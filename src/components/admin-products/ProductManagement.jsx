import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ProductForm from './ProductForm';

function ProductManagement() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [error, setError] = useState('');

  // Cargar productos
  const loadProducts = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/categories`);
      setCategories(response.data);
      setError('');
    } catch (error) {
      console.error('Error al cargar categorias:', error);
      setError('Error al cargar las categorias');
    } finally {
      setLoading(false);
    }
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/stores`);
      setStores(response.data.data.stores);
      setError('');
    } catch (error) {
      console.error('Error al cargar tiendas:', error);
      setError('Error al cargar las tiendas');
    } finally {
      setLoading(false);
    }
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/products`);
      setProducts(response.data.data.products);
      setError('');
    } catch (error) {
      console.error('Error al cargar productos:', error);
      setError('Error al cargar los productos');
    } finally {
      setLoading(false);
    }
  };

  // Cargar producto específico para editar
  const loadProduct = async (productId) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/product/${productId}`);
      return response.data.data.product;
    } catch (error) {
      console.error('Error al cargar el producto:', error);
      throw new Error('Error al cargar el producto');
    }
  };

  // Eliminar producto
  const handleDelete = async (productId) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      return;
    }

    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/delete-product/${productId}`);
      await loadProducts(); // Recargar lista
      setError('');
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      setError('Error al eliminar el producto');
    }
  };

  // Cambiar estado activo/inactivo
  const handleToggleActive = async (product) => {
    try {
      const formData = new FormData();
      formData.append('name', product.name);
      formData.append('description', product.description || '');
      formData.append('price', product.price);
      formData.append('stock', product.stock);
      formData.append('active', product.active ? 0 : 1);
      formData.append('productsCategoryId', product.productsCategoryId);
      formData.append('storeId', product.storeId);

      await axios.put(`${import.meta.env.VITE_API_URL}/update-product/${product.id}`, formData);
      await loadProducts();
      setError('');
    } catch (error) {
      console.error('Error al actualizar estado del producto:', error);
      setError('Error al actualizar el estado del producto');
    }
  };

  // Editar producto
  const handleEdit = async (productId) => {
    try {
      const product = await loadProduct(productId);
      setEditingProduct(product);
      setShowForm(true);
      setError('');
    } catch (error) {
      setError('Error al cargar el producto para editar');
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      {loading ? (
        <div className="flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Gestión de Productos</h2>
            <button
              onClick={() => {
                setEditingProduct(null);
                setShowForm(true);
              }}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
            >
              Agregar Producto
            </button>
          </div>

          {showForm && (
            <ProductForm
              productId={editingProduct?.id}
              categories={categories}
              stores={stores}
              onSuccess={() => {
                setShowForm(false);
                setEditingProduct(null);
                loadProducts();
              }}
              onClose={() => {
                setShowForm(false);
                setEditingProduct(null);
              }}
              initialData={editingProduct}
            />
          )}

          {error && (
            <div className="mb-4 p-4 text-red-700 bg-red-100 rounded-md">
              {error}
            </div>
          )}

          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            {products.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Imagen
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nombre
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Precio
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.map((product) => (
                    <tr key={product.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="h-10 w-10 object-cover rounded-md"
                          />
                        ) : (
                          <div className="h-10 w-10 bg-gray-200 rounded-md flex items-center justify-center">
                            <span className="text-gray-500">Sin imagen</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">S/ {parseFloat(product.price).toFixed(2)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleActive(product)}
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            product.active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {product.active ? 'Activo' : 'Inactivo'}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleEdit(product.id)}
                          className="text-indigo-600 hover:text-indigo-900 mr-4"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-4 text-gray-500">
                No hay productos disponibles.
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default ProductManagement; 