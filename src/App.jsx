import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
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
import StoreManagement from './components/stores/StoreManagement';
import ProductManagement from './components/products/ProductManagement';
import BusinessHours from './components/BusinessHours';
import ServiceLocations from './components/ServiceLocations';

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

  // Calcular el total de items en el carrito
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    // Cargar tiendas y productos desde Firestore
    const fetchData = async () => {
      setLoading(true);
      try {
        // Primero, cargar tiendas y crear un mapa de tiendas activas
        const storesSnapshot = await getDocs(collection(db, 'stores'));
        const storesList = storesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setStores(storesList);
        
        // Crear un mapa para verificar rápidamente el estado de las tiendas
        const storesMap = {};
        storesList.forEach(store => {
          storesMap[store.id] = store.state;
        });
        setActiveStoresMap(storesMap);
        
        // Luego cargar productos
        const productsSnapshot = await getDocs(collection(db, 'products'));
        const productsList = productsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Filtrar productos por tiendas activas
        const activeProducts = productsList.filter(product => 
          product.active && storesMap[product.storeId]
        );
        
        setProducts(activeProducts);
        setFilteredProducts(activeProducts);
        
        // Cargar categorías
        const categoriesSnapshot = await getDocs(collection(db, 'productsCategory'));
        const categoriesList = categoriesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setCategories(categoriesList);
      } catch (error) {
        console.error("Error al cargar datos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filtrar productos cuando cambie la categoría o el término de búsqueda
  useEffect(() => {
    let result = products;
    
    // Filtrar por tiendas activas
    result = result.filter(product => activeStoresMap[product.storeId]);
    
    // Filtrar por categoría si hay una seleccionada
    if (selectedCategory) {
      result = result.filter(product => product.productsCategoryId === selectedCategory);
    }
    
    // Filtrar por término de búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(product =>
        product.name.toLowerCase().includes(term) ||
        (product.description && product.description.toLowerCase().includes(term))
      );
    }
    
    setFilteredProducts(result);
  }, [products, selectedCategory, searchTerm, activeStoresMap]);

  const handleAddToCart = (product) => {
    const existingProduct = cartItems.find(item => item.id === product.id);
    if (existingProduct) {
      setCartItems(cartItems.map(item =>
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setCartItems([...cartItems, product]);
    }
  };

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

  const handleCategorySelect = (categoryId) => {
    if (selectedCategory === categoryId) {
      // Si se vuelve a hacer clic en la misma categoría, deseleccionamos
      setSelectedCategory(null);
    } else {
      setSelectedCategory(categoryId);
    }
  };

  // Verificar si un producto está en el carrito
  const isProductInCart = (productId) => {
    return cartItems.some(item => item.id === productId);
  };

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
                  <SearchBar onSearch={setSearchTerm} />
                  <ProductList 
                    products={filteredProducts} 
                    onAddToCart={handleAddToCart} 
                    onRemoveFromCart={handleRemoveFromCart}
                    isProductInCart={isProductInCart}
                  />
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
        </Routes>
      </div>
    </Router>
  );
}

export default App;


