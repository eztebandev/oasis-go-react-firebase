import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import ProductForm from './ProductForm';
import { Link } from 'react-router-dom';

function ProductManagement() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [categoriesMap, setCategoriesMap] = useState({});
  const [storesMap, setStoresMap] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Obtener categorías y crear mapa para referencia rápida
      const categoriesSnapshot = await getDocs(collection(db, 'productsCategory'));
      const categoriesList = categoriesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCategories(categoriesList);
      
      const categoriesObj = {};
      categoriesList.forEach(cat => {
        categoriesObj[cat.id] = cat.name;
      });
      setCategoriesMap(categoriesObj);

      // Obtener tiendas y crear mapa para referencia rápida
      const storesSnapshot = await getDocs(collection(db, 'stores'));
      const storesList = storesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setStores(storesList);
      
      const storesObj = {};
      storesList.forEach(store => {
        storesObj[store.id] = {
          name: store.name,
          state: store.state
        };
      });
      setStoresMap(storesObj);

      // Obtener productos
      const productsQuery = query(collection(db, 'products'), orderBy('dateCreate', 'desc'));
      const productsSnapshot = await getDocs(productsQuery);
      const productsList = productsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProducts(productsList);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product) => {
    setCurrentProduct(product);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, 'products', id));
      setProducts(products.filter(product => product.id !== id));
      setConfirmDelete(null);
    } catch (error) {
      console.error('Error al eliminar producto:', error);
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setCurrentProduct(null);
    fetchData(); // Recargar la lista después de guardar
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Administración de Productos</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md transition-colors duration-300"
        >
          <span className="flex items-center">
            <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Nuevo Producto
          </span>
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          {products.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p className="mt-2 text-gray-600">No hay productos registrados</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tienda</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.map((product) => (
                    <tr key={product.id} className={`hover:bg-gray-50 ${storesMap[product.storeId]?.state === false ? 'bg-red-50' : ''}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            {product.imageUrl ? (
                              <img className="h-10 w-10 rounded-md object-cover" src={product.imageUrl} alt={product.name} />
                            ) : (
                              <div className="h-10 w-10 rounded-md bg-gray-200 flex items-center justify-center">
                                <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{product.name}</div>
                            {product.description && (
                              <div className="text-xs text-gray-500 max-w-xs truncate">
                                {product.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        s/. {product.price?.toFixed(2) || '0.00'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {categoriesMap[product.productsCategoryId] || 'Sin categoría'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {storesMap[product.storeId]?.name || 'Sin tienda'}
                        {storesMap[product.storeId]?.state === false && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                            Tienda inactiva
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${product.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {product.active ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button 
                          onClick={() => handleEdit(product)} 
                          className="text-indigo-600 hover:text-indigo-900 mr-3"
                        >
                          Editar
                        </button>
                        {confirmDelete === product.id ? (
                          <div className="inline-flex items-center">
                            <button
                              onClick={() => handleDelete(product.id)}
                              className="text-red-600 hover:text-red-900 mr-2"
                            >
                              Confirmar
                            </button>
                            <button
                              onClick={() => setConfirmDelete(null)}
                              className="text-gray-600 hover:text-gray-900"
                            >
                              Cancelar
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDelete(product.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Eliminar
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Formulario para crear/editar producto */}
      {showForm && (
        <ProductForm
          product={currentProduct}
          categories={categories}
          stores={stores}
          onClose={handleFormClose}
        />
      )}

      {/* Botón para volver al inicio */}
      <div className="mt-6 text-center">
        <Link 
          to="/"
          className="inline-flex items-center text-blue-600 hover:text-blue-800"
        >
          <svg className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}

export default ProductManagement; 