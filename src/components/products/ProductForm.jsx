import React, { useState, useEffect } from 'react';
import { collection, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

function ProductForm({ product, categories, stores, onClose }) {
  const initialFormData = {
    name: '',
    description: '',
    price: '',
    imageUrl: '',
    productsCategoryId: '',
    storeId: '',
    active: true
  };

  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (product) {
      // Si estamos editando, cargamos los datos del producto
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price ? product.price.toString() : '',
        imageUrl: product.imageUrl || '',
        productsCategoryId: product.productsCategoryId || '',
        storeId: product.storeId || '',
        active: product.active !== undefined ? product.active : true
      });
    } else if (stores.length > 0) {
      // Si estamos creando y hay tiendas disponibles, seleccionamos la primera por defecto
      setFormData({
        ...initialFormData,
        storeId: stores[0].id
      });
    }
  }, [product, stores]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setFormData({
        ...formData,
        [name]: checked
      });
    } else if (name === 'price') {
      // Permitir solo números y punto decimal
      const regex = /^[0-9]*\.?[0-9]*$/;
      if (value === '' || regex.test(value)) {
        setFormData({
          ...formData,
          [name]: value
        });
      }
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es obligatorio';
    }
    
    if (!formData.price) {
      newErrors.price = 'El precio es obligatorio';
    } else if (isNaN(parseFloat(formData.price)) || parseFloat(formData.price) <= 0) {
      newErrors.price = 'El precio debe ser un número mayor que cero';
    }
    
    if (!formData.productsCategoryId) {
      newErrors.productsCategoryId = 'La categoría es obligatoria';
    }
    
    if (!formData.storeId) {
      newErrors.storeId = 'La tienda es obligatoria';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Preparar datos del producto
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
      };
      
      if (product) {
        // Actualizar producto existente
        await updateDoc(doc(db, 'products', product.id), productData);
      } else {
        // Crear nuevo producto
        await addDoc(collection(db, 'products'), {
          ...productData,
          dateCreate: serverTimestamp()
        });
      }
      
      onClose();
    } catch (error) {
      console.error('Error al guardar producto:', error);
      alert('Ocurrió un error al guardar los datos.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4 overflow-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-auto">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">
            {product ? 'Editar Producto' : 'Nuevo Producto'}
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="flex-grow overflow-auto p-4">
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* Nombre del producto */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del producto *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
              </div>
              
              {/* Descripción */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                ></textarea>
              </div>
              
              {/* Precio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Precio *
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">s/. </span>
                  </div>
                  <input
                    type="text"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    className={`w-full pl-7 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${errors.price ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="0.00"
                  />
                </div>
                {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price}</p>}
              </div>
              
              {/* URL de imagen */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL de imagen
                </label>
                <input
                  type="text"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                {formData.imageUrl && (
                  <div className="mt-2 flex justify-center">
                    <img 
                      src={formData.imageUrl} 
                      alt="Vista previa" 
                      className="h-32 w-32 object-cover rounded-md"
                      onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/128?text=Error'; }}
                    />
                  </div>
                )}
              </div>
              
              {/* Selección de categoría */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoría *
                </label>
                <select
                  name="productsCategoryId"
                  value={formData.productsCategoryId}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${errors.productsCategoryId ? 'border-red-500' : 'border-gray-300'}`}
                >
                  <option value="">Seleccionar categoría</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {errors.productsCategoryId && (
                  <p className="mt-1 text-sm text-red-600">{errors.productsCategoryId}</p>
                )}
              </div>
              
              {/* Selección de tienda */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tienda *
                </label>
                <select
                  name="storeId"
                  value={formData.storeId}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${errors.storeId ? 'border-red-500' : 'border-gray-300'}`}
                >
                  <option value="">Seleccionar tienda</option>
                  {stores.map(store => (
                    <option 
                      key={store.id} 
                      value={store.id}
                      className={store.state ? '' : 'text-red-500'}
                    >
                      {store.name} {!store.state && '(Inactiva)'}
                    </option>
                  ))}
                </select>
                {errors.storeId && (
                  <p className="mt-1 text-sm text-red-600">{errors.storeId}</p>
                )}
                {formData.storeId && stores.find(s => s.id === formData.storeId && !s.state) && (
                  <p className="mt-1 text-sm text-orange-600">
                    <svg className="inline-block h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    Advertencia: Este producto pertenece a una tienda inactiva y no será visible para los clientes
                  </p>
                )}
              </div>
              
              {/* Estado */}
              <div>
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    name="active"
                    checked={formData.active}
                    onChange={handleChange}
                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
                  <span className="ml-2 text-sm text-gray-700">Producto activo</span>
                </label>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isSubmitting ? 'Guardando...' : product ? 'Actualizar' : 'Crear'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ProductForm; 