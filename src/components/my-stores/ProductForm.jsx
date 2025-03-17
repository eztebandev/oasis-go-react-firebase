import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, doc, updateDoc, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { s3Client, PutObjectCommand, DeleteObjectCommand } from '../../config/s3Config';
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import axios from 'axios';

function ProductForm({ storeId, productId = null, onSuccess, onCancel }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [active, setActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [stockType, setStockType] = useState('unspecified');
  const [stock, setStock] = useState('');
  const [currentImageKey, setCurrentImageKey] = useState('');

  // Función para generar un hash único
  const generateUniqueHash = (name) => {
    const timestamp = Date.now().toString();
    const randomStr = Math.random().toString(36).substring(2, 8);
    return `${timestamp}-${randomStr}`;
  };

  // Función para generar la key de S3
  const generateS3Key = (name) => {
    const sanitizedName = name.replace(/\s+/g, '').toLowerCase();
    const hash = generateUniqueHash(name);
    return `${sanitizedName}-${hash}`;
  };

  // Función para generar Pre-Signed URL
  const generatePresignedUrl = async (key, contentType) => {
    const command = new PutObjectCommand({
      Bucket: 'oasis-go-bucket',
      Key: `products/${key}`,
      ContentType: contentType
    });

    try {
      const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
      return signedUrl;
    } catch (error) {
      console.error('Error al generar URL firmada:', error);
      throw new Error('Error al generar URL para subir la imagen');
    }
  };

  // Función para subir archivo a S3 usando axios
  const uploadToS3 = async (file, key) => {
    try {
      // Generar URL firmada
      const presignedUrl = await generatePresignedUrl(key, file.type);

      // Subir archivo usando axios
      await axios.put(presignedUrl, file, {
        headers: {
          'Content-Type': file.type,
        },
      });

      // Retornar la URL pública del archivo
      return `https://oasis-go-bucket.s3.amazonaws.com/products/${key}`;
    } catch (error) {
      console.error('Error al subir archivo a S3:', error);
      throw new Error('Error al subir la imagen');
    }
  };

  // Función para eliminar archivo de S3
  const deleteFromS3 = async (key) => {
    if (!key) return;

    const params = {
      Bucket: import.meta.env.VITE_APP_AWS_BUCKET_NAME,
      Key: key,
    };

    try {
      await s3Client.send(new DeleteObjectCommand(params));
    } catch (error) {
      console.error('Error al eliminar archivo de S3:', error);
    }
  };

  // Cargar categorías y datos del producto si se está editando
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Cargar categorías
        const categoriesSnapshot = await getDocs(collection(db, 'productsCategory'));
        const categoriesList = categoriesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setCategories(categoriesList);

        // Si hay un productId, cargar datos del producto
        if (productId) {
          const productDoc = await getDoc(doc(db, 'products', productId));
          if (productDoc.exists()) {
            const productData = productDoc.data();
            setName(productData.name || '');
            setDescription(productData.description || '');
            setPrice(productData.price?.toString() || '');
            setCategory(productData.productsCategoryId || '');
            setActive(productData.active !== false);
            setImagePreview(productData.image || '');
            setCurrentImageKey(productData.imageKey || '');
            
            // Setear stock
            if (productData.stock === undefined || productData.stock === null) {
              setStockType('unspecified');
              setStock('');
            } else {
              setStockType('specified');
              setStock(productData.stock.toString());
            }
          }
        }
      } catch (error) {
        console.error('Error al cargar datos:', error);
        setError('Error al cargar datos. Por favor, inténtalo de nuevo.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [productId]);

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setImage(e.target.files[0]);
      setImagePreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validar datos
      if (!name.trim() || !price || !category) {
        throw new Error('Por favor, completa todos los campos obligatorios');
      }

      let imageUrl = imagePreview;
      let imageKey = currentImageKey;

      // Si hay una nueva imagen
      if (image) {
        // Validar tipo de archivo
        const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!validTypes.includes(image.type)) {
          throw new Error('Por favor, sube una imagen en formato JPG, PNG o WebP');
        }

        // Validar tamaño (máximo 5MB)
        if (image.size > 5 * 1024 * 1024) {
          throw new Error('La imagen no debe superar los 5MB');
        }

        // Si hay una imagen anterior, eliminarla de S3
        if (currentImageKey) {
          await deleteFromS3(currentImageKey);
        }

        // Subir nueva imagen a S3
        imageKey = generateS3Key(name);
        imageUrl = await uploadToS3(image, imageKey);
      }

      // Preparar datos del producto
      const productData = {
        name: name.trim(),
        description: description.trim(),
        price: parseFloat(price),
        productsCategoryId: category,
        storeId: storeId,
        active: active,
        updatedAt: new Date(),
        image: imageUrl,
        imageKey: imageKey,
        ...(stockType === 'specified' ? { stock: parseInt(stock) } : { stock: null })
      };

      // Crear o actualizar producto
      if (productId) {
        await updateDoc(doc(db, 'products', productId), productData);
      } else {
        productData.createdAt = new Date();
        await addDoc(collection(db, 'products'), productData);
      }

      onSuccess();
    } catch (error) {
      console.error('Error al guardar producto:', error);
      setError(error.message || 'Error al guardar el producto. Por favor, inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6 flex justify-between">
        <div>
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            {productId ? 'Editar Producto' : 'Nuevo Producto'}
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Completa la información del producto.
          </p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Volver
        </button>
      </div>
      <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
        {loading && !productId ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">{error}</h3>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Nombre del producto *
              </label>
              <input
                type="text"
                name="name"
                id="name"
                required
                className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md text-white"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Descripción
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md text-white"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                  Precio *
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    name="price"
                    id="price"
                    required
                    min="0"
                    step="0.01"
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md text-white"
                    placeholder="0.00"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                  Categoría *
                </label>
                <select
                  id="category"
                  name="category"
                  required
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md text-white"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="">Selecciona una categoría</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Imagen del producto
              </label>
              <div className="mt-1 flex items-center">
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Vista previa"
                      className="h-32 w-32 object-cover rounded-md"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImage(null);
                        setImagePreview('');
                      }}
                      className="absolute top-0 right-0 -mt-2 -mr-2 bg-red-100 rounded-full p-1 text-red-600 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div className="flex justify-center items-center h-32 w-32 border-2 border-gray-300 border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                      <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <div className="text-sm text-gray-600">
                        <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                          <span>Subir imagen</span>
                          <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*" onChange={handleImageChange} />
                        </label>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="active"
                name="active"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
              />
              <label htmlFor="active" className="ml-2 block text-sm text-gray-900">
                Producto activo
              </label>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Stock
                </label>
                <div className="mt-2">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="stockUnspecified"
                        name="stockType"
                        value="unspecified"
                        checked={stockType === 'unspecified'}
                        onChange={(e) => setStockType(e.target.value)}
                        className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                      />
                      <label htmlFor="stockUnspecified" className="ml-2 block text-sm text-gray-700">
                        Sin especificar
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="stockSpecified"
                        name="stockType"
                        value="specified"
                        checked={stockType === 'specified'}
                        onChange={(e) => setStockType(e.target.value)}
                        className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                      />
                      <label htmlFor="stockSpecified" className="ml-2 block text-sm text-gray-700">
                        Especificar cantidad
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {stockType === 'specified' && (
                <div>
                  <label htmlFor="stock" className="block text-sm font-medium text-gray-700">
                    Cantidad en stock
                  </label>
                  <div className="mt-1">
                    <input
                      type="number"
                      name="stock"
                      id="stock"
                      min="0"
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      value={stock}
                      onChange={(e) => setStock(e.target.value)}
                      required={stockType === 'specified'}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onCancel}
                className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Guardando...
                  </>
                ) : (
                  'Guardar'
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default ProductForm; 