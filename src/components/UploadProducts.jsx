import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebaseConfig';

function UploadProducts() {
  const [productData, setProductData] = useState({
    name: '',
    description: '',
    price: '',
    imageUrl: '',
    active: true,
    storeId: 'fQjRLVK4QAnVWoZOlu61', // Valor por defecto
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProductData({
      ...productData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ text: '', type: '' });

    try {
      // Validar campos requeridos
      if (!productData.name || !productData.description || !productData.imageUrl || !productData.price) {
        throw new Error('Todos los campos son obligatorios');
      }

      // Convertir precio a número
      const numericPrice = parseFloat(productData.price);
      if (isNaN(numericPrice)) {
        throw new Error('El precio debe ser un número válido');
      }

      // Crear objeto de producto para almacenar en Firestore
      const productToSave = {
        ...productData,
        price: numericPrice,
        dateCreate: serverTimestamp(),
      };

      // Guardar en Firestore
      const docRef = await addDoc(collection(db, 'products'), productToSave);
      
      setMessage({ 
        text: `Producto agregado correctamente con ID: ${docRef.id}`, 
        type: 'success' 
      });
      
      // Limpiar formulario
      setProductData({
        name: '',
        description: '',
        price: '',
        imageUrl: '',
        active: true,
        storeId: '',
      });
    } catch (error) {
      console.error('Error al agregar producto:', error);
      setMessage({ 
        text: `Error: ${error.message}`, 
        type: 'error' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto my-8 p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Subir Nuevo Producto</h1>
      
      {message.text && (
        <div className={`p-4 mb-4 rounded-md ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message.text}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
            Nombre del Producto
          </label>
          <input
            id="name"
            name="name"
            type="text"
            value={productData.name}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ingrese el nombre del producto"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
            Descripción
          </label>
          <textarea
            id="description"
            name="description"
            value={productData.description}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ingrese la descripción del producto"
            rows="3"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="price">
            Precio
          </label>
          <input
            id="price"
            name="price"
            type="text"
            value={productData.price}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ej. 42.50"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="imageUrl">
            URL de la Imagen
          </label>
          <input
            id="imageUrl"
            name="imageUrl"
            type="text"
            value={productData.imageUrl}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="https://ejemplo.com/imagen.png"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="storeId">
            ID de la Tienda
          </label>
          <input
            id="storeId"
            name="storeId"
            type="text"
            value={productData.storeId}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="ID de la tienda"
          />
        </div>
        
        <div className="mb-6">
          <label className="flex items-center">
            <input
              type="checkbox"
              name="active"
              checked={productData.active}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-gray-700">Producto Activo</span>
          </label>
        </div>
        
        <div className="flex items-center justify-between">
          <button
            type="submit"
            disabled={isLoading}
            className={`bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:shadow-outline ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isLoading ? 'Guardando...' : 'Guardar Producto'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default UploadProducts; 