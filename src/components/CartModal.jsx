import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

function CartModal({ cartItems, onClose, onIncrease, onDecrease, onSendWhatsApp }) {
  // Estado para forzar actualizaciones
  const [updateKey, setUpdateKey] = useState(0);
  // Estado para la dirección de entrega
  const [deliveryAddress, setDeliveryAddress] = useState('');
  // Estado para la distancia calculada
  const [deliveryDistance, setDeliveryDistance] = useState(null);
  // Estado para el costo de delivery
  const [deliveryCost, setDeliveryCost] = useState(0);
  // Estado para el tiempo estimado
  const [estimatedTime, setEstimatedTime] = useState(null);
  // Estado para el error de dirección
  const [addressError, setAddressError] = useState('');
  // Estado para indicar cálculo en progreso
  const [calculating, setCalculating] = useState(false);
  // Estado para las coordenadas geocodificadas
  const [coordinates, setCoordinates] = useState(null);
  // Estado para indicar obtención de ubicación
  const [gettingLocation, setGettingLocation] = useState(false);
  // Estado para el error de geolocalización
  const [locationError, setLocationError] = useState('');
  // Estado para las sugerencias de direcciones
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  // Estado para mostrar/ocultar sugerencias
  const [showSuggestions, setShowSuggestions] = useState(false);
  // Estado para indicar búsqueda de sugerencias
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  // Referencia para el timeout de debounce
  const debounceTimerRef = useRef(null);
  // Referencia para el input de dirección
  const addressInputRef = useRef(null);
  
  // Coordenadas de la tienda (punto de origen)
  const STORE_LOCATION = { latitude: -14.845201110914694, longitude: -74.94385917743881 };
  
  // Calcular totales directamente de cartItems
  const totalItems = cartItems.reduce((total, item) => total + (item.quantity || 0), 0);
  const subtotal = cartItems.reduce((total, item) => 
    total + (parseFloat(item.price) * (item.quantity || 0)), 0);
  const total = subtotal + deliveryCost;
  
  // Forzar actualización cuando cambian los cartItems
  useEffect(() => {
    console.log('CartModal: cartItems actualizados', cartItems);
    console.log('Totales calculados:', { totalItems, subtotal });
    setUpdateKey(prev => prev + 1);
  }, [cartItems]);
  
  // Manejadores con actualización inmediata
  const handleIncrease = (item) => {
    console.log('CartModal: Incrementando', item);
    onIncrease(item);
    // Forzar actualización inmediata
    setUpdateKey(prev => prev + 1);
  };
  
  const handleDecrease = (item) => {
    console.log('CartModal: Decrementando', item);
    onDecrease(item);
    // Forzar actualización inmediata
    setUpdateKey(prev => prev + 1);
  };
  
  // Cerrar sugerencias al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (addressInputRef.current && !addressInputRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Buscar sugerencias de direcciones con debounce
  const searchAddressSuggestions = (query) => {
    // Limpiar timer anterior
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    if (!query.trim()) {
      setAddressSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    
    setLoadingSuggestions(true);
    
    // Establecer nuevo timer (300ms debounce)
    debounceTimerRef.current = setTimeout(async () => {
      try {
        // Agregamos parámetros para mejorar la búsqueda a nivel de calle
        const response = await axios.post(`${import.meta.env.VITE_API_URL}/geocode`, { 
          address: query + ', Nasca, Ica, Perú',
          //components: 'country:pe', // Restricción a Perú (ajustar según país)        
          components: 'country:pe|administrative_area_level_1:Ica|administrative_area_level_2:Nasca', 
          addresstype: 'street_address|route|establishment', // Preferencia para direcciones de calle
          location: '-14.83, -74.94', // Coordenadas cercanas a Nasca
          radius: 20000 // Radio de 20km alrededor de Nasca
        });
        
        if (response.data.data.status === 'OK' && response.data.data.results) {
          const results = response.data.data.results;
          
          // Transformamos los resultados al formato de sugerencias
          const suggestions = results.map(result => {
            // Extraemos componentes de dirección para mostrar mejor formato
            const addressComponents = result.address_components || [];
            const street = addressComponents.find(c => c.types.includes('route'))?.long_name || '';
            const streetNumber = addressComponents.find(c => c.types.includes('street_number'))?.long_name || '';
            const neighborhood = addressComponents.find(c => c.types.includes('sublocality_level_1'))?.long_name || '';
            const locality = addressComponents.find(c => c.types.includes('locality'))?.long_name || '';
            
            // Crear un formato más detallado para la dirección principal
            let mainText = result.formatted_address.split(',')[0];
            if (street && streetNumber) {
              mainText = `${street} ${streetNumber}`;
            } else if (street) {
              mainText = street;
            }
            
            // Crear un formato más detallado para la dirección secundaria
            let secondaryText = result.formatted_address.split(',').slice(1).join(',').trim();
            if (neighborhood && locality) {
              secondaryText = `${neighborhood}, ${locality}`;
            } else if (locality) {
              secondaryText = locality;
            }
            
            return {
              place_id: result.place_id,
              description: result.formatted_address,
              structured_formatting: {
                main_text: mainText,
                secondary_text: secondaryText
              },
              geometry: result.geometry
            };
          });
          
          setAddressSuggestions(suggestions);
          setShowSuggestions(true);
        } else {
          setAddressSuggestions([]);
          setShowSuggestions(false);
        }
      } catch (error) {
        console.error('Error al buscar sugerencias:', error);
        setAddressSuggestions([]);
        setShowSuggestions(false);
      } finally {
        setLoadingSuggestions(false);
      }
    }, 300);
  };
  
  // Seleccionar una sugerencia de dirección
  const selectAddressSuggestion = async (suggestion) => {
    setDeliveryAddress(suggestion.description);
    setShowSuggestions(false);
    
    try {
      // Las coordenadas ya vienen en la sugerencia gracias al endpoint de geocode
      const location = suggestion.geometry.location;
      
      // Actualizar estados con la información obtenida
      setCoordinates({
        latitude: location.lat,
        longitude: location.lng,
        formattedAddress: suggestion.description
      });
      
      // Calcular la ruta automáticamente
      await calculateRouteFromCoordinates({
        latitude: location.lat,
        longitude: location.lng
      });
    } catch (error) {
      console.error('Error al procesar la dirección seleccionada:', error);
      setAddressError('No se pudieron obtener los detalles de esta dirección');
    }
  };
  
  // Calcular costo de delivery basado en la distancia
  const calculateDeliveryCost = (distanceInKm) => {

    // Obtener la hora actual
    const currentHour = new Date().getHours();

    // Si es entre 11pm (23) y 7am (7), el precio base es 5
    const isNightTime = currentHour >= 23 || currentHour < 7;
    const baseCost = isNightTime ? 5 : 4;

    //console.log(`Hora actual: ${currentHour}h`);
    //console.log(`¿Horario nocturno?`, isNightTime);
    //console.log('Distancia de Kms:', distanceInKm);

    const additionalKm = distanceInKm >= 2 ? Math.max(0, Math.ceil(distanceInKm - 1)) : 0;
    const cost = baseCost + additionalKm;

    return cost;
  };
  
  // Obtener la ubicación actual del usuario
  const getCurrentLocation = () => {
    setGettingLocation(true);
    setLocationError('');
    
    if (!navigator.geolocation) {
      setLocationError('La geolocalización no está soportada por tu navegador');
      setGettingLocation(false);
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          console.log('Ubicación obtenida:', position.coords);
          
          // Realizar geocodificación inversa usando el endpoint
          const response = await axios.post(`${import.meta.env.VITE_API_URL}/reverse-geocode`, {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
          
          if (response.data.data.status !== 'OK' || !response.data.data.results.length) {
            throw new Error('No se pudo obtener la dirección para esta ubicación');
          }
          
          // Obtener la dirección formateada
          const formattedAddress = response.data.data.results[0].formatted_address;
          console.log('Dirección obtenida:', formattedAddress);
          
          // Actualizar estados
          setDeliveryAddress(formattedAddress);
          setCoordinates({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            formattedAddress
          });
          
          // Calcular la ruta automáticamente
          await calculateRouteFromCoordinates({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        } catch (error) {
          console.error('Error al obtener la ubicación actual:', error);
          setLocationError('No se pudo obtener tu ubicación actual. Por favor ingresa la dirección manualmente.');
        } finally {
          setGettingLocation(false);
        }
      },
      (error) => {
        console.error('Error de geolocalización:', error);
        let errorMessage = 'No se pudo acceder a tu ubicación.';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Permiso denegado para acceder a tu ubicación. Por favor habilita el acceso en tu navegador.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'La información de ubicación no está disponible.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Se agotó el tiempo para obtener tu ubicación.';
            break;
        }
        
        setLocationError(errorMessage);
        setGettingLocation(false);
      },
      { 
        enableHighAccuracy: true, 
        timeout: 10000, 
        maximumAge: 0 
      }
    );
  };
  
  // Calcular la ruta desde coordenadas
  const calculateRouteFromCoordinates = async (destinationCoords) => {
    setCalculating(true);
    setAddressError('');
    
    try {
      console.log('Calculando ruta desde coordenadas:', destinationCoords);
      
      // Usar el endpoint de route-info para calcular la ruta
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/route-info`, {
        origin: STORE_LOCATION,
        destination: destinationCoords,
        mode: 'driving'
      });
      
      if (response.data.data.status !== 'OK') {
        throw new Error(`Error al calcular la ruta: ${response.data.data.status}`);
      }
      
      // Extraer la información de la respuesta
      const distanceMeters = response.data.data.distance;
      const durationSeconds = response.data.data.duration;
      
      // Convertir a unidades más útiles
      const distanceKm = distanceMeters / 1000;
      const durationMinutes = Math.ceil(durationSeconds / 60);
      
      console.log(`Distancia calculada: ${distanceKm.toFixed(2)} km (${durationMinutes} minutos)`);
      
      // Actualizar estados
      setDeliveryDistance(distanceKm);
      setEstimatedTime(durationMinutes);
      const cost = calculateDeliveryCost(distanceKm);
      setDeliveryCost(cost);
      
      console.log(`Costo de delivery calculado: S/. ${cost}`);
      
      // Opcionalmente, guardar la ruta planificada
      await saveDeliveryRoute(destinationCoords, distanceKm, durationMinutes);
      
    } catch (error) {
      console.error('Error al calcular la ruta:', error);
      setAddressError('No se pudo calcular la ruta. Verifica la dirección e intenta nuevamente.');
      setDeliveryDistance(null);
      setEstimatedTime(null);
      setDeliveryCost(0);
    } finally {
      setCalculating(false);
    }
  };
  
  // Calcular distancia desde dirección de texto
  const calculateDistance = async () => {
    if (!deliveryAddress.trim()) {
      setAddressError('Por favor ingresa una dirección de entrega');
      return;
    }
    
    setAddressError('');
    setCalculating(true);
    
    try {
      // 1. Geocodificar la dirección
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/geocode`, { address: deliveryAddress });
      
      if (response.data.data.status !== 'OK' || !response.data.data.results.length) {
        throw new Error('No se encontraron resultados para esta dirección');
      }
      
      const result = response.data.data.results[0];
      const location = result.geometry.location;
      
      // 2. Actualizar con la dirección formateada
      setDeliveryAddress(result.formatted_address);
      setCoordinates({
        latitude: location.lat,
        longitude: location.lng,
        formattedAddress: result.formatted_address
      });
      
      // 3. Calcular la ruta con las coordenadas obtenidas
      await calculateRouteFromCoordinates({
        latitude: location.lat,
        longitude: location.lng
      });
      
    } catch (error) {
      console.error('Error al calcular la distancia:', error);
      setAddressError('No se pudo calcular la distancia. Verifica la dirección e intenta nuevamente.');
      setDeliveryDistance(null);
      setEstimatedTime(null);
      setDeliveryCost(0);
    } finally {
      setCalculating(false);
    }
  };
  
  // Guardar la ruta de entrega (opcional)
  const saveDeliveryRoute = async (destinationCoords, distance, duration) => {
    // Solo si hay items en el carrito
    if (cartItems.length === 0) return;
    
    try {
      const totalWeight = cartItems.reduce((sum, item) => sum + item.quantity, 0);
      
      // Usar el endpoint para guardar la ruta
      await axios.post(`${import.meta.env.VITE_API_URL}/save-route`, {
        name: `Entrega - ${new Date().toLocaleDateString()}`,
        description: `Entrega a ${deliveryAddress}`,
        vehicleId: 1, // ID por defecto
        stops: [{
          orderId: `TEMP-${Date.now()}`,
          address: deliveryAddress,
          latitude: destinationCoords.latitude,
          longitude: destinationCoords.longitude,
          estimatedArrivalTime: new Date(Date.now() + duration * 60 * 1000).toISOString()
        }],
        estimatedDistance: distance,
        estimatedDuration: duration * 60, // Convertir a segundos
        scheduledDate: new Date().toISOString(),
        storeId: 1 // ID por defecto
      });
      
      console.log('Ruta guardada correctamente');
    } catch (error) {
      console.error('Error al guardar la ruta:', error);
      // No interrumpimos el flujo principal si falla el guardado
    }
  };
  
  // Preparar el mensaje de WhatsApp con información de delivery
  const handleSendWhatsApp = () => {
    // Preparar información de delivery si existe
    let deliveryInfo = '';
    if (deliveryDistance !== null) {
      deliveryInfo = 
        `📍 *INFORMACIÓN DE ENTREGA*\n` +
        `Dirección: ${deliveryAddress}\n` +
        //`Distancia: ${deliveryDistance.toFixed(2)} km\n` +
        //`Tiempo estimado: ${estimatedTime} minutos\n` +
        `Costo de delivery: s/. ${deliveryCost.toFixed(2)}\n\n`;
    }
    
    // Llamar a la función del componente padre
    onSendWhatsApp(deliveryInfo, total);
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center border-b p-4">
          <h2 className="text-xl font-bold text-gray-800">Carrito de Compras</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full">
              <svg className="h-16 w-16 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <p className="text-gray-500 text-lg font-medium">Tu carrito está vacío</p>
              <p className="text-gray-400 text-center mt-2">Agrega algunos productos para continuar</p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex border-b pb-4">
                    <img src={item.imageUrl} alt={item.name} className="h-20 w-20 object-cover rounded-md" />
                    <div className="ml-4 flex-1">
                      <div className="flex justify-between">
                        <h3 className="font-medium text-gray-800">{item.name}</h3>
                        <span className="font-medium text-gray-800">S/. {parseFloat(item.price).toFixed(2)}</span>
                      </div>
                      <p className="text-gray-500 text-sm mt-1">{item.description}</p>
                      <div className="flex justify-between items-center mt-2">
                        <div className="flex items-center border rounded-md">
                          <button 
                            onClick={() => handleDecrease(item)}
                            className="px-2 py-1 text-gray-600 hover:bg-gray-100"
                          >
                            -
                          </button>
                          <span className="px-2 py-1 text-gray-800">{item.quantity}</span>
                          <button 
                            onClick={() => handleIncrease(item)}
                            className="px-2 py-1 text-gray-600 hover:bg-gray-100"
                          >
                            +
                          </button>
                        </div>
                        <span className="font-medium text-gray-800">
                          S/. {(parseFloat(item.price) * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                
                <div className="mt-6">
                  <h3 className="font-medium text-gray-800 mb-2">Opciones de Entrega</h3>
                  <div className="space-y-4">
                    <div className="flex flex-col relative" ref={addressInputRef}>
                      <div className="flex">
                        <input
                          id="deliveryAddress"
                          type="text"
                          value={deliveryAddress}
                          onChange={(e) => {
                            setDeliveryAddress(e.target.value);
                            searchAddressSuggestions(e.target.value);
                          }}
                          onFocus={() => {
                            if (deliveryAddress.trim() && addressSuggestions.length > 0) {
                              setShowSuggestions(true);
                            }
                          }}
                          placeholder="Ingresa tu dirección completa"
                          className="flex-1 p-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          onClick={calculateDistance}
                          disabled={calculating}
                          className="bg-blue-500 text-white px-3 py-2 rounded-r-md hover:bg-blue-600 transition-colors disabled:bg-blue-300"
                        >
                          {calculating ? (
                            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          ) : "Calcular"}
                        </button>
                      </div>
                      
                      {/* Lista de sugerencias - corregida para posicionamiento */}
                      {showSuggestions && addressSuggestions.length > 0 && (
                        <ul className="absolute z-50 w-full bg-white border border-gray-300 rounded-md mt-[40px] shadow-lg max-h-60 overflow-y-auto left-0">
                          {addressSuggestions.map((suggestion) => (
                            <li 
                              key={suggestion.place_id}
                              onClick={() => selectAddressSuggestion(suggestion)}
                              className="p-2 hover:bg-gray-100 cursor-pointer border-b border-gray-200 last:border-b-0"
                            >
                              <div className="flex items-start">
                                <svg className="h-5 w-5 text-gray-500 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <div>
                                  <p className="text-sm font-medium text-gray-700">{suggestion.structured_formatting.main_text}</p>
                                  <p className="text-xs text-gray-500">{suggestion.structured_formatting.secondary_text}</p>
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                      
                      {/* Indicador de carga de sugerencias */}
                      {loadingSuggestions && (
                        <div className="absolute right-[60px] top-2.5">
                          <svg className="animate-spin h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        </div>
                      )}
                      
                      <button
                        onClick={getCurrentLocation}
                        disabled={gettingLocation}
                        className="flex items-center justify-center mt-2 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-md transition-colors"
                      >
                        {gettingLocation ? (
                          <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : (
                          <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        )}
                        {gettingLocation ? "Obteniendo ubicación..." : "Usar mi ubicación actual"}
                      </button>
                    </div>
                    
                    {addressError && (
                      <p className="text-red-500 text-sm mt-1">{addressError}</p>
                    )}
                    
                    {locationError && (
                      <p className="text-red-500 text-sm mt-1">{locationError}</p>
                    )}
                  </div>
                  
                  {deliveryDistance !== null && (
                    <div className="bg-blue-50 p-3 rounded-md mt-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">Dirección:</span>
                        <span className="font-medium text-sm text-right text-blue-600">{deliveryAddress}</span>
                      </div>
                      {/*<div className="flex justify-between items-center mt-1">
                        <span className="text-gray-700">Distancia:</span>
                        <span className="font-medium text-blue-600">{deliveryDistance.toFixed(2)} km</span>
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-gray-700">Tiempo estimado:</span>
                        <span className="font-medium text-blue-600">{estimatedTime} min</span>
                      </div>*/}
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-gray-700">Costo de delivery:</span>
                        <span className="font-medium text-blue-600">S/. {deliveryCost.toFixed(2)}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
        
        {cartItems.length > 0 && (
          <div className="border-t p-4">
            <div className="flex justify-between items-center mb-1">
              <span className="text-gray-600">Subtotal ({totalItems} items)</span>
              <span className="font-semibold text-blue-600">S/. {subtotal.toFixed(2)}</span>
            </div>
            
            {deliveryDistance !== null && (
              <div className="flex justify-between items-center mb-1">
                <span className="text-gray-600"> + Delivery</span>
                <span className="font-semibold text-blue-600">S/. {deliveryCost.toFixed(2)}</span>
              </div>
            )}
            
            <div className="border-t pt-2 mt-2 mb-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-gray-800">Total</span>
                <span className="text-xl font-bold text-blue-600">S/. {total.toFixed(2)}</span>
              </div>
            </div>
            
            <button
              onClick={handleSendWhatsApp}
              disabled={cartItems.length === 0}
              className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-medium transition duration-300 flex items-center justify-center disabled:bg-green-300"
            >
              <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.498 14.382c-.301-.15-1.767-.867-2.04-.966-.273-.101-.473-.15-.673.15-.197.295-.771.964-.944 1.162-.175.195-.349.21-.646.075-.3-.15-1.263-.465-2.403-1.485-.888-.795-1.484-1.77-1.66-2.07-.174-.3-.019-.465.13-.615.136-.135.301-.345.451-.523.146-.181.194-.301.297-.496.1-.21.049-.375-.025-.524-.075-.15-.672-1.62-.922-2.206-.24-.584-.487-.51-.672-.51-.172-.015-.371-.015-.571-.015-.2 0-.523.074-.797.359-.273.3-1.045 1.02-1.045 2.475s1.07 2.865 1.219 3.075c.149.18 2.095 3.195 5.076 4.483.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.29.173-1.414-.074-.124-.272-.196-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Enviar pedido por WhatsApp
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default CartModal;