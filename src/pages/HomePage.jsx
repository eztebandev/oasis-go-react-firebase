import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import ProductList from '../components/ProductList';
import CartButton from '../components/CartButton';
import CartModal from '../components/CartModal';
import WhatsAppButton from '../components/WhatsAppButton';
import CategoryList from '../components/CategoryList';
import SearchBar from '../components/SearchBar';
import BusinessHours from '../components/BusinessHours';
import ServiceLocations from '../components/ServiceLocations';
import ServiceSelector from '../components/ServiceSelector';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorAlert from '../components/common/ErrorAlert';

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
    const [selectedService, setSelectedService] = useState(null);
    
    // Referencias para mantener la posición de desplazamiento
    const productsRef = useRef(null);

    //Tarifa de servicio
    const SERVICE_TAX = selectedService ? parseFloat(selectedService.tax_base) / 100 : 0.10;
  
    // Calcular el total de items en el carrito
    const totalItems = cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
  
    // Manejar la selección de servicio
    const handleServiceSelect = useCallback((service) => {
      console.log('Servicio seleccionado:', service);
      setSelectedService(service);
      
      // Reiniciar estados relacionados con productos y categorías
      setSelectedCategory(null);
      setSearchTerm('');
      setPagination(prev => ({ ...prev, page: 1 }));
      setProducts([]);
      setFilteredProducts([]);
      
      // Si el servicio es delivery, cargar categorías y productos
      if (service.name.toLowerCase() === 'delivery') {
        loadInitialData();
      } else {
        // Para otros servicios, limpiar categorías y productos
        setCategories([]);
        setProducts([]);
        setFilteredProducts([]);
        setLoading(false);
      }
    }, []);
  
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
        const sortedCategories = categoriesResponse.data.sort((a, b) => a.order - b.order);
        setCategories(sortedCategories);
  
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
        response.data.data.products.map(product => {
          product.priceTax = parseFloat(product.price) + (parseFloat(product.price) * SERVICE_TAX);
          product.PriceAndTariff = (Math.ceil(product.priceTax * 10) / 10).toFixed(2);
        });
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
  
    // Función para manejar la búsqueda
    const handleSearch = useCallback((term) => {
      setSearchTerm(term);
      
      // Si el término está vacío o es muy corto, no realizar búsqueda
      if (!term || term.length < 1) {
        if (term === '') {
          // Si se borró completamente, cargar productos iniciales
          setPagination(prev => ({ ...prev, page: 1 }));
          setProducts([]);
          loadProducts(1, false, selectedCategory, '');
        }
        return;
      }
      
      setPagination(prev => ({ ...prev, page: 1 }));
      setProducts([]);
      
      // Guardar la posición actual de desplazamiento
      const currentScrollPosition = window.scrollY;
      
      loadProducts(1, false, selectedCategory, term).then(() => {
        // Después de cargar los productos, mantener la posición de desplazamiento
        // o desplazarse hasta la sección de productos si es una nueva búsqueda
        if (term && productsRef.current) {
          productsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
          window.scrollTo(0, currentScrollPosition);
        }
      });
    }, [selectedCategory, loadProducts]);
  
    // Función para manejar la selección de categoría
    const handleCategorySelect = useCallback((category) => {
      if (category === null) {
        setSelectedCategory(null);
      } else if (category.id === selectedCategory?.id) {
        setSelectedCategory(null);
      } else {
        setSelectedCategory(category);
      }

      setPagination(prev => ({ ...prev, page: 1 }));
      setProducts([]);
      
      // Guardar la posición actual de desplazamiento
      const currentScrollPosition = window.scrollY;
      
      loadProducts(1, false, category.id, searchTerm).then(() => {
        // Después de cargar los productos, mantener la posición de desplazamiento
        // o desplazarse hasta la sección de productos
        if (productsRef.current) {
          productsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
          window.scrollTo(0, currentScrollPosition);
        }
      });
    }, [searchTerm, selectedCategory, loadProducts]);
  
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
  
    const handleSendWhatsApp = (deliveryInfo = '', totalWithDelivery = null) => {
      const subtotal = cartItems.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
      const total = totalWithDelivery !== null ? totalWithDelivery : subtotal;
      
      const itemsList = cartItems.map(item => 
        `• ${item.quantity}x ${item.name} - s/. ${(parseFloat(item.price) * item.quantity).toFixed(2)}`
      ).join('\n');
      
      const message = `*NUEVO PEDIDO*\n\n` +
                     `*PRODUCTOS:*\n${itemsList}\n\n` +
                     `💵 *SUBTOTAL: s/. ${subtotal.toFixed(2)}*\n` +
                     `${deliveryInfo}` +
                     `💵 *TOTAL A PAGAR: s/. ${total.toFixed(2)}*\n\n` +
                     `Espero su confirmación.`;
      
      const whatsappUrl = `https://wa.me/918647161?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    };
  
    // Verificar si un producto está en el carrito
    const isProductInCart = (productId) => {
      return cartItems.some(item => item.id === productId);
    };
  
    // Efecto inicial para cargar servicios
    useEffect(() => {
      // No cargar datos iniciales automáticamente, esperar selección de servicio
      setLoading(false);
    }, []);
  
    // Remover el efecto que recargaba todo al cambiar activeStoresMap
    // Solo mantener el efecto necesario para productos
    useEffect(() => {
      if (Object.keys(activeStoresMap).length > 0 && selectedService?.name.toLowerCase() === 'delivery') {
        loadProducts(1, false, selectedCategory, searchTerm);
      }
    }, [activeStoresMap, selectedService]);

  // Renderizar contenido específico según el servicio seleccionado
  const renderServiceContent = () => {
    if (!selectedService) {
      return (
        <div className="text-center p-8">
          <p className="text-lg text-gray-600">Por favor, selecciona un servicio para continuar.</p>
        </div>
      );
    }

    // Si es delivery, mostrar categorías y productos
    if (selectedService.name.toLowerCase() === 'delivery') {
      return (
        <>
          <CategoryList 
            categories={categories} 
            selectedCategory={selectedCategory}
            onSelectCategory={handleCategorySelect}
          />
          <SearchBar 
            onSearch={handleSearch} 
            initialValue={searchTerm}
          />
          <div ref={productsRef}>
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
          </div>
        </>
      );
    }

    // Para otros servicios, mostrar información específica
    return (
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">{selectedService.name}</h2>
        
        {selectedService.imageUrl && (
          <div className="mb-4 flex justify-center">
            <img 
              src={selectedService.imageUrl} 
              alt={selectedService.name} 
              className="h-40 w-auto object-contain rounded-md"
            />
          </div>
        )}
        
        <div className="prose max-w-none">
          <p className="text-gray-600">{selectedService.description || 'No hay descripción disponible para este servicio.'}</p>
        </div>
        
        <div className="mt-4 p-3 bg-blue-50 rounded-md">
          <p className="text-sm text-blue-800">
            <span className="font-medium">Disponibilidad:</span> {selectedService.disponibility || '24/7'}
          </p>
          <p className="text-sm text-blue-800 mt-1">
            <span className="font-medium">Tarifa base:</span> S/. {parseFloat(selectedService.tax_base).toFixed(2)}
          </p>
        </div>
        
        <div className="mt-6">
          <button
            onClick={() => handleSendWhatsApp(`*SERVICIO SOLICITADO:* ${selectedService.name}\n`, parseFloat(selectedService.tax_base))}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-md flex items-center justify-center"
          >
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Solicitar por WhatsApp
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex-grow p-2 max-w-full mx-auto">
      <div className="flex flex-row md:flex-row items-center mb-2 mt-2 justify-center gap-2">
        {/* <BusinessHours /> */}
        <ServiceLocations />
      </div>
      
      <ServiceSelector 
        onSelectService={handleServiceSelect} 
        selectedService={selectedService}
      />
      
      {error && (
        <ErrorAlert 
          message={error} 
          onClose={() => setError('')}
        />
      )}
      
      {loading ? (
        <div className="flex justify-center p-8">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        renderServiceContent()
      )}
      
      {selectedService?.name.toLowerCase() === 'delivery' && (
        <>
          <CartButton onClick={() => setIsCartOpen(true)} itemCount={totalItems} />
          <WhatsAppButton cartItems={cartItems} />
          {isCartOpen && (
            <CartModal
              cartItems={cartItems}
              onClose={() => setIsCartOpen(false)}
              onIncrease={handleIncreaseQuantity}
              onDecrease={handleDecreaseQuantity}
              onSendWhatsApp={handleSendWhatsApp}
              serviceTax={SERVICE_TAX}
            />
          )}
        </>
      )}
    </div>
  );
}

export default HomePage; 