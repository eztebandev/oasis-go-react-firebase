import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import ProductList from '../components/ProductList';
import CartButton from '../components/CartButton';
import CartModal from '../components/CartModal';
import WhatsAppButton from '../components/WhatsAppButton';
import CategoryList from '../components/CategoryList';
import SearchBar from '../components/SearchBar';
import BusinessHours from '../components/BusinessHours';
import ServiceLocations from '../components/ServiceLocations';

function HomePage() {
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
    const [pagination, setPagination] = useState({
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0
    });
  
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
        await loadProducts(1, false, selectedCategory, searchTerm);
      } catch (error) {
        console.error("Error al cargar datos iniciales:", error);
        setError('Error al cargar los datos iniciales');
      } finally {
        setLoading(false);
      }
    };
  
    // Modificar loadProducts para manejar la estructura correcta de la respuesta
    const loadProducts = async (page = 1, isLoadingMore = false, category = null, term = null) => {
      try {
        setError('');
        if (!isLoadingMore) {
          setLoading(true);
        } else {
          setLoadingMore(true);
        }

        const params = new URLSearchParams({
          page: page.toString(),
          limit: pagination.limit.toString()
        });

        if (category) {
          params.append('productsCategoryId', category);
        }

        if (term) {
          params.append('term', term);
        }

        const response = await axios.get(`${import.meta.env.VITE_API_URL}/products?${params}`);
        const { products: newProducts } = response.data.data;
        const { pagination: newPagination } = response.data.data;

        console.log('newProducts', response.data.data.products);
        console.log('newPagination', response.data.data.pagination);

        if (isLoadingMore) {
          setProducts(prev => [...prev, ...newProducts]);
          setFilteredProducts(prev => [...prev, ...newProducts]);
        } else {
          setProducts(newProducts);
          setFilteredProducts(newProducts);
        }

        setPagination(newPagination);
      } catch (error) {
        console.error('Error al cargar productos:', error);
        setError('Error al cargar los productos');
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    };
  
    // Función para manejar la selección de categoría
    const handleCategorySelect = useCallback((categoryId) => {
      console.log('categoryId 0', categoryId);
      console.log('selectedCategory', selectedCategory);
      if (categoryId === selectedCategory) {
        categoryId = null;
        console.log('categoryId 1', categoryId);
      }
      console.log('categoryId 2', categoryId);
      setSelectedCategory(categoryId);
      setPagination(prev => ({ ...prev, page: 1 }));
      setProducts([]);
      loadProducts(1, false, categoryId, searchTerm);
    }, [searchTerm, selectedCategory]);
  
    // Función para manejar la búsqueda
    const handleSearch = useCallback((term) => {
      setSearchTerm(term);
      setPagination(prev => ({ ...prev, page: 1 }));
      setProducts([]);
      loadProducts(1, false, selectedCategory, term);
    }, [selectedCategory]);
  
    // Añadir al carrito
    const handleAddToCart = (product) => {
      setCartItems(prevItems => {
        // Verificar si el producto ya está en el carrito
        const existingItem = prevItems.find(item => item.id === product.id);
        
        if (existingItem) {
          // Si ya existe, incrementar la cantidad
          return prevItems.map(item => 
            item.id === product.id 
              ? { ...item, quantity: (item.quantity || 0) + 1 } 
              : item
          );
        } else {
          // Si no existe, agregarlo con cantidad 1
          return [...prevItems, { ...product, quantity: 1 }];
        }
      });
    };
  
    // Quitar del carrito
    const handleRemoveFromCart = (product) => {
      setCartItems(prevItems => 
        prevItems.filter(item => item.id !== product.id)
      );
    };
  
    // Función para incrementar la cantidad
    const handleIncreaseQuantity = (product) => {
      console.log('HomePage: Incrementando cantidad para:', product);
      
      // Crear una copia profunda del array de cartItems
      const updatedItems = JSON.parse(JSON.stringify(cartItems));
      
      // Encontrar y actualizar el item
      const itemIndex = updatedItems.findIndex(item => item.id === product.id);
      if (itemIndex !== -1) {
        updatedItems[itemIndex].quantity += 1;
        console.log(`Actualizando cantidad de ${updatedItems[itemIndex].name} a ${updatedItems[itemIndex].quantity}`);
      }
      
      // Actualizar el estado con el nuevo array
      console.log('Nuevo carrito:', updatedItems);
      setCartItems(updatedItems);
    };
  
    // Función para decrementar la cantidad
    const handleDecreaseQuantity = (product) => {
      console.log('HomePage: Decrementando cantidad para:', product);
      
      // Crear una copia profunda del array de cartItems
      const updatedItems = JSON.parse(JSON.stringify(cartItems));
      
      // Encontrar el item
      const itemIndex = updatedItems.findIndex(item => item.id === product.id);
      if (itemIndex !== -1) {
        if (updatedItems[itemIndex].quantity <= 1) {
          // Eliminar el producto si la cantidad es 1
          console.log(`Eliminando ${updatedItems[itemIndex].name} del carrito`);
          updatedItems.splice(itemIndex, 1);
        } else {
          // Decrementar la cantidad
          updatedItems[itemIndex].quantity -= 1;
          console.log(`Actualizando cantidad de ${updatedItems[itemIndex].name} a ${updatedItems[itemIndex].quantity}`);
        }
      }
      
      // Actualizar el estado con el nuevo array
      console.log('Nuevo carrito:', updatedItems);
      setCartItems(updatedItems);
    };
  
    const handleSendWhatsApp = () => {
      // Calcular subtotal
      const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
      
      // Crear mensaje formateado con listado y total
      const itemsList = cartItems.map(item => 
        `🔹 *${item.name}*\n   Cantidad: ${item.quantity} x s/. ${parseFloat(item.price).toFixed(2)} = s/. ${(parseFloat(item.price) * item.quantity).toFixed(2)}`
      ).join('\n\n');
      
      const message = `*¡Hola! Quiero realizar el siguiente pedido:*\n\n${itemsList}\n\n` + 
                     `💰 *RESUMEN DEL PEDIDO*\n` +
                     `📦 Cantidad de productos: ${cartItems.reduce((total, item) => total + item.quantity, 0)}\n` +
                     `💵 *TOTAL A PAGAR: s/. ${subtotal.toFixed(2)}*\n\n` +
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
        loadProducts(1, false, selectedCategory, searchTerm);
      }
    }, [activeStoresMap]);

  // ... resto de la lógica del HomePage (loadProducts, handleSearch, etc.) ...

  return (
    <div className="flex-grow p-4 max-w-4xl mx-auto">
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
        products={products}
        loading={loading}
        loadingMore={loadingMore}
        hasMore={pagination.page < pagination.totalPages}
        onLoadMore={() => loadProducts(pagination.page + 1, true, selectedCategory, searchTerm)}
        onAddToCart={handleAddToCart} 
        onRemoveFromCart={handleRemoveFromCart}
        isProductInCart={isProductInCart}
      />
      {error && (
        <div className="mt-4 p-4 text-red-700 bg-red-100 rounded-md">
          {error}
        </div>
      )}
      <CartButton onClick={() => setIsCartOpen(true)} itemCount={totalItems} />
      <WhatsAppButton cartItems={cartItems} />
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
  );
}

export default HomePage; 