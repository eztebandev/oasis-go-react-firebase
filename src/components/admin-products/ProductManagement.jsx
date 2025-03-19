import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import ProductForm from './ProductForm';

function ProductManagement() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Cargar productos
  const loadProducts = useCallback(async (page = 1, isLoadingMore = false) => {
    try {
      setError('');
      if (!isLoadingMore) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      // Cargar tiendas desde la API
      const storesResponse = await axios.get(`${import.meta.env.VITE_API_URL}/stores`);
      const storesList = storesResponse.data.data.stores;

      // Cargar categorías desde la API
      const categoriesResponse = await axios.get(`${import.meta.env.VITE_API_URL}/categories`);
      setCategories(categoriesResponse.data);

      console.log('limit', pagination.limit);
      console.log('page', page);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString()
      });

      // Agregar filtros a los parámetros
      if (selectedCategory) {
        params.append('productsCategoryId', selectedCategory);
      }

      if (searchTerm) {
        params.append('term', searchTerm);
      }

      const response = await axios.get(`${import.meta.env.VITE_API_URL}/products?${params}`);
      const { products: newProducts, pagination: newPagination } = response.data.data;

      if (isLoadingMore) {
        setProducts(prev => [...prev, ...newProducts]);
      } else {
        setProducts(newProducts);
      }

      setPagination(newPagination);
    } catch (error) {
      console.error('Error al cargar productos:', error);
      setError('Error al cargar los productos');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [pagination.limit, selectedCategory, searchTerm]);

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
      // Recargar la página actual
      loadProducts(pagination.page, false);
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
      // Recargar la página actual
      loadProducts(pagination.page, false);
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

  // Manejar éxito en crear/editar
  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingProduct(null);
    // Recargar la página actual
    loadProducts(pagination.page, false);
  };

  // Manejar búsqueda
  const handleSearch = (term) => {
    setSearchTerm(term);
    setPagination(prev => ({ ...prev, page: 1 }));
    setProducts([]);
    loadProducts(1, false);
  };

  // Manejar selección de categoría
  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
    setPagination(prev => ({ ...prev, page: 1 }));
    setProducts([]);
    loadProducts(1, false);
  };

  // Carga inicial
  useEffect(() => {
    loadProducts(1, false);
  }, [loadProducts]);

  // Referencia para el observador de intersección
  const observerRef = React.useRef();
  const sentinelRef = React.useRef();

  // Configurar observador para carga infinita
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && !loadingMore && pagination.page < pagination.totalPages) {
          loadProducts(pagination.page + 1, true);
        }
      },
      { threshold: 0.5 }
    );

    observerRef.current = observer;

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [loading, loadingMore, pagination.page, pagination.totalPages, loadProducts]);

  // Observar el elemento sentinel
  useEffect(() => {
    if (sentinelRef.current && observerRef.current) {
      observerRef.current.observe(sentinelRef.current);
    }
  }, [products]);

  return (
    <div className="container mx-auto px-4 py-8">
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

      {/* Filtros */}
      <div className="mb-6 space-y-4">
        <div className="flex gap-4">
          {/* Búsqueda */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Selector de categoría */}
          <select
            value={selectedCategory || ''}
            onChange={(e) => handleCategorySelect(e.target.value || null)}
            className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todas las categorías</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {showForm && (
        <ProductForm
          productId={editingProduct?.id}
          onSuccess={handleFormSuccess}
          categories={categories}
          onCancel={() => {
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
          <>
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

            {/* Elemento sentinel para la carga infinita */}
            {pagination.page < pagination.totalPages && (
              <div 
                ref={sentinelRef}
                className="flex justify-center py-4"
              >
                {loadingMore && (
                  <div className="flex items-center space-x-2">
                    <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="text-gray-500">Cargando más productos...</span>
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-4 text-gray-500">
            {loading ? 'Cargando productos...' : 'No hay productos disponibles.'}
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductManagement;