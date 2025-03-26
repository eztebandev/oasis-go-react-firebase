import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import LoadingSpinner from './common/LoadingSpinner';

function ServiceSelector({ onSelectService, selectedService }) {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const carouselRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  useEffect(() => {
    const loadServices = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/services`);
        if (response.data.data) {
          // Filtrar solo servicios activos
          const activeServices = response.data.data.filter(service => service.state === 'Activo');
          setServices(activeServices);
          
          // Si no hay servicio seleccionado y hay servicios disponibles, seleccionar el primero
          if (!selectedService && activeServices.length > 0) {
            onSelectService(activeServices[0]);
          }
        }
      } catch (error) {
        console.error('Error al cargar servicios:', error);
        setError('No se pudieron cargar los servicios');
      } finally {
        setLoading(false);
      }
    };

    loadServices();
  }, [onSelectService, selectedService]);

  // Comprobar si se deben mostrar las flechas de navegación
  useEffect(() => {
    const checkScrollPosition = () => {
      if (carouselRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
        setShowLeftArrow(scrollLeft > 0);
        setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10); // 10px de margen
      }
    };

    // Comprobar inicialmente
    checkScrollPosition();

    // Añadir listener para el evento scroll
    const currentRef = carouselRef.current;
    if (currentRef) {
      currentRef.addEventListener('scroll', checkScrollPosition);
    }

    // Limpiar listener
    return () => {
      if (currentRef) {
        currentRef.removeEventListener('scroll', checkScrollPosition);
      }
    };
  }, [services]);

  // Funciones para desplazar el carrusel
  const scrollLeft = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-4">
        <LoadingSpinner size="md" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md text-red-700 text-sm">
        {error}
      </div>
    );
  }

  if (services.length === 0) {
    return (
      <div className="bg-yellow-50 p-4 rounded-md text-yellow-700 text-sm">
        No hay servicios disponibles en este momento.
      </div>
    );
  }

  return (
    <div className="mb-6 relative">
      <h2 className="text-lg font-medium text-white mb-3">Nuestros Servicios</h2>
      
      <div className="relative">
        {/* Botón de desplazamiento izquierdo */}
        {showLeftArrow && (
          <button 
            onClick={scrollLeft}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white rounded-full shadow-md p-1 hover:bg-gray-100"
            aria-label="Desplazar a la izquierda"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        
        {/* Contenedor del carrusel */}
        <div 
          ref={carouselRef}
          className="flex overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {services.map(service => (
            <div 
              key={service.id}
              className="flex-none snap-start px-2 w-32 sm:w-40"
            >
              <button
                onClick={() => onSelectService(service)}
                className={`flex flex-col items-center p-1 py-2 rounded-lg transition-all w-full h-full text-gray-900 ${
                  selectedService?.id === service.id
                    ? 'bg-primarySoft border-2 border-primarySoft shadow-md text-white'
                    : 'bg-white border border-primary hover:bg-gray-50'
                }`}
              >
                {service.imageUrl ? (
                  <img 
                    src={service.imageUrl} 
                    alt={service.name} 
                    className="w-14 h-14 object-contain mb-2"
                  />
                ) : (
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                    <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
                <span className="text-sm font-medium text-center line-clamp-2">{service.name}</span>
              </button>
            </div>
          ))}
        </div>
        
        {/* Botón de desplazamiento derecho */}
        {showRightArrow && (
          <button 
            onClick={scrollRight}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white rounded-full shadow-md p-1 hover:bg-gray-100"
            aria-label="Desplazar a la derecha"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>
      
      {/* Información adicional del servicio seleccionado
      {selectedService && (
        <div className="mt-3 p-3 bg-blue-50 rounded-md">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-blue-800">{selectedService.name}</h3>
              <p className="text-xs text-blue-700 mt-1">
                Tarifa base: S/. {selectedService.tax_base.toFixed(2)}
              </p>
            </div>
            {selectedService.disponibility && (
              <div className="text-xs text-blue-700 bg-blue-100 px-2 py-1 rounded">
                {selectedService.disponibility}
              </div>
            )}
          </div>
        </div>
      )} */}
    </div>
  );
}

// Añadir estilos para ocultar la barra de desplazamiento
const style = document.createElement('style');
style.textContent = `
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
`;
document.head.appendChild(style);

export default ServiceSelector; 