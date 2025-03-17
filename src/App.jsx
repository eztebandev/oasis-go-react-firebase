import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { collection, query, where, getDocs, orderBy, limit, startAfter } from 'firebase/firestore';
import { db } from './firebaseConfig';
import Navbar from './components/Navbar';
import SearchBar from './components/SearchBar';
import ProductList from './components/ProductList';
import CartButton from './components/CartButton';
import CartModal from './components/CartModal';
import WhatsAppButton from './components/WhatsAppButton';
import CategoryList from './components/CategoryList';
import UploadProducts from './components/UploadProducts';
import BulkUpload from './components/BulkUpload';
import AdminLink from './components/AdminLink';
import BulkUploadButton from './components/BulkUploadButton';
import AdminStoreButton from './components/AdminStoreButton';
import AdminProductButton from './components/AdminProductButton';
import StoreManagement from './components/admin-stores/StoreManagement';
import ProductManagement from './components/admin-products/ProductManagement';
import BusinessHours from './components/BusinessHours';
import ServiceLocations from './components/ServiceLocations';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/my-stores/Dashboard';
import axios from 'axios';


function App() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [stores, setStores] = useState([]); 
  const [activeStoresMap, setActiveStoresMap] = useState({});
  const [lastVisible, setLastVisible] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const PRODUCTS_PER_PAGE = 10;
  const [error, setError] = useState('');

  // Calcular el total de items en el carrito
  const totalItems = cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0);

  // Separar la carga inicial de datos
  const loadInitialData = async () => {
    setLoading(true);
    try {
      // Cargar tiendas desde la API
      const storesResponse = await axios.get(`${import.meta.env.VITE_API_URL}/stores`);
      const storesList = storesResponse.data.data.stores;
      
      // Formatear las tiendas y crear el mapa de tiendas activas
      const formattedStores = storesList.map(store => ({
        id: store.id.toString(),
        name: store.name,
        state: store.active === 1,
        description: store.description || '',
        createdAt: new Date(store.createdAt),
        updatedAt: new Date(store.updatedAt)
      }));
      
      // Crear y establecer mapa de tiendas activas
      const storesMap = {};
      formattedStores.forEach(store => {
        storesMap[store.id] = store.state;
      });
      
      setStores(formattedStores);
      setActiveStoresMap(storesMap);

      // Cargar categorías desde la API
      const categoriesResponse = await axios.get(`${import.meta.env.VITE_API_URL}/categories`);
      setCategories(categoriesResponse.data);

      // Cargar productos iniciales
      await loadProducts(false);
    } catch (error) {
      console.error("Error al cargar datos iniciales:", error);
      setError('Error al cargar los datos iniciales');
    } finally {
      setLoading(false);
    }
  };

  // Modificar loadProducts para manejar la estructura correcta de la respuesta
  const loadProducts = async (isLoadingMore = false, storesMapOverride = null, categoryId = null, term = null) => {
    console.log('term input', term);
    try {
      // Construir parámetros de consulta
      const params = new URLSearchParams();
      
      if (term) {
        params.append('term', term);
      }
      
      if (categoryId) {
        params.append('productsCategoryId', categoryId);
      }

      // Usar el mapa de tiendas proporcionado o el del estado
      const currentStoresMap = storesMapOverride || activeStoresMap;
      const activeStoreIds = Object.keys(currentStoresMap).filter(id => currentStoresMap[id]);
      
      if (activeStoreIds.length > 0) {
        activeStoreIds.forEach(storeId => {
          params.append('storeId', storeId);
        });
      }

      // Agregar parámetros de paginación
      params.append('limit', PRODUCTS_PER_PAGE.toString());
      if (isLoadingMore && lastVisible) {
        params.append('offset', products.length.toString());
      }

      // Realizar la consulta a la API
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/products?${params.toString()}`);
      
      // Acceder a los datos correctamente
      const productsList = response.data.data.products;
      const total = response.data.data.total;

      // Formatear los productos para que coincidan con la estructura esperada
      const formattedProducts = productsList.map(product => ({
        id: product.id.toString(),
        name: product.name,
        description: product.description || '',
        price: parseFloat(product.price),
        stock: product.stock,
        active: product.active === 1,
        imageUrl: product.imageUrl,
        imageKey: product.imageKey,
        productsCategoryId: product.productsCategoryId,
        storeId: product.storeId,
        createdAt: new Date(product.createdAt),
        updatedAt: new Date(product.updatedAt)
      }));

      // Actualizar el estado de "hasMore"
      setHasMore(products.length + formattedProducts.length < total);

      // Actualizar productos
      if (isLoadingMore) {
        setProducts(prev => [...prev, ...formattedProducts]);
        setFilteredProducts(prev => [...prev, ...formattedProducts]);
      } else {
        setProducts(formattedProducts);
        setFilteredProducts(formattedProducts);
      }

      setError('');
    } catch (error) {
      console.error("Error al cargar productos:", error);
      setError('Error al cargar los productos');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Función para cargar más productos
  const loadMoreProducts = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    await loadProducts(true);
  };

  // Función para manejar la selección de categoría
  const handleCategorySelect = async (categoryId) => {
    console.log('categoryIdSelected', categoryId);
    setFilteredProducts([]); // Limpiar productos filtrados
    setLastVisible(null);
    setHasMore(true);

    let categorySelected = selectedCategory === categoryId ? null : categoryId;
    // Actualizar categoría seleccionada
    if (selectedCategory === categoryId) {
      setSelectedCategory(null);
    } else {
      setSelectedCategory(categoryId);
    }

    // Cargar productos con el nuevo filtro
    try {
      //setLoading(true);
      await loadProducts(false, null, categorySelected);
    } catch (error) {
      console.error("Error al filtrar por categoría:", error);
      setError('Error al filtrar los productos');
    } finally {
      //setLoading(false);
    }
  };

  // Función para manejar la búsqueda
  const handleSearch = async (term) => {
    console.log('term input', term);
    setFilteredProducts([]); // Limpiar productos filtrados
    setLastVisible(null);
    setHasMore(true);
    setSearchTerm(term);

    // Cargar productos con el término de búsqueda
    try {
      //setLoading(true);
      await loadProducts(false, null, selectedCategory, term);
    } catch (error) {
      console.error("Error al buscar productos:", error);
      setError('Error al buscar productos');
    } finally {
      //setLoading(false);
    }
  };

  // Añadir al carrito
  const handleAddToCart = (product) => {
    const existingProduct = cartItems.find(item => item.id === product.id);
    if (existingProduct) {
      setCartItems(cartItems.map(item =>
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setCartItems([...cartItems, { ...product, quantity: 1 }]);
    }
  };

  // Quitar del carrito
  const handleRemoveFromCart = (product) => {
    setCartItems(cartItems.filter(item => item.id !== product.id));
  };

  const handleIncreaseQuantity = (product) => {
    setCartItems(cartItems.map(item =>
      item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
    ));
  };

  const handleDecreaseQuantity = (product) => {
    // Si la cantidad es 1 y se disminuye, eliminar el producto del carrito
    if (product.quantity === 1) {
      setCartItems(cartItems.filter(item => item.id !== product.id));
    } else {
      setCartItems(cartItems.map(item =>
        item.id === product.id ? { ...item, quantity: item.quantity - 1 } : item
      ));
    }
  };

  const handleSendWhatsApp = () => {
    // Calcular subtotal
    const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    
    // Crear mensaje formateado con listado y total
    const itemsList = cartItems.map(item => 
      `🔹 *${item.name}*\n   Cantidad: ${item.quantity} x $${item.price.toFixed(2)} = $${(item.price * item.quantity).toFixed(2)}`
    ).join('\n\n');
    
    const message = `*¡Hola! Quiero realizar el siguiente pedido:*\n\n${itemsList}\n\n` + 
                   `💰 *RESUMEN DEL PEDIDO*\n` +
                   `📦 Cantidad de productos: ${cartItems.reduce((total, item) => total + item.quantity, 0)}\n` +
                   `💵 *TOTAL A PAGAR: $${subtotal.toFixed(2)}*\n\n` +
                   `Espero su confirmación.`;
    
    const whatsappUrl = `https://wa.me/918647161?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  // Verificar si un producto está en el carrito
  const isProductInCart = (productId) => {
    return cartItems.some(item => item.id === productId);
  };

  // Efecto inicial solo para la primera carga
  useEffect(() => {
    loadInitialData();
  }, []);

  // Remover el efecto que recargaba todo al cambiar activeStoresMap
  // Solo mantener el efecto necesario para productos
  useEffect(() => {
    if (Object.keys(activeStoresMap).length > 0) {
      loadProducts(false);
    }
  }, [activeStoresMap]);

  return (
    <Router>
      <div className="min-h-screen w-full flex flex-col">
        <Navbar />
        <Routes>
          <Route path="/" element={
            <div className="flex-grow p-4 max-w-4xl mx-auto">
              {loading ? (
                <div className="flex justify-center items-center h-24">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <>
                  <div className="flex flex-row md:flex-row items-center mb-4 justify-center gap-2">
                    <BusinessHours />
                    <ServiceLocations />
                  </div>
                  <CategoryList 
                    categories={categories} 
                    selectedCategory={selectedCategory}
                    onSelectCategory={handleCategorySelect}
                  />
                  <SearchBar 
                    onSearch={handleSearch} 
                    initialValue={searchTerm}
                  />
                  <ProductList 
                    products={filteredProducts}
                    loading={loading}
                    onAddToCart={handleAddToCart} 
                    onRemoveFromCart={handleRemoveFromCart}
                    isProductInCart={isProductInCart}
                  />
                  {hasMore && !loading && filteredProducts.length > 0 && (
                    <div className="flex justify-center py-8">
                      <button
                        onClick={loadMoreProducts}
                        disabled={loadingMore}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        {loadingMore ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Cargando...
                          </>
                        ) : (
                          'Ver más productos'
                        )}
                      </button>
                    </div>
                  )}
                </>
              )}
              <CartButton onClick={() => setIsCartOpen(true)} itemCount={totalItems} />
              <WhatsAppButton cartItems={cartItems} />
              {/*<AdminLink />
              <BulkUploadButton />
              <AdminStoreButton />
              <AdminProductButton />*/}
              {isCartOpen && (
                <CartModal
                  cartItems={cartItems}
                  onClose={() => setIsCartOpen(false)}
                  onIncrease={handleIncreaseQuantity}
                  onDecrease={handleDecreaseQuantity}
                  onSendWhatsApp={handleSendWhatsApp}
                />
              )}
            </div>
          } />
          <Route path="/upload-products" element={<UploadProducts />} />
          <Route path="/bulk-upload" element={<BulkUpload />} />
          <Route path="/admin-stores" element={<StoreManagement />} />
          <Route path="/admin-products" element={<ProductManagement />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;


