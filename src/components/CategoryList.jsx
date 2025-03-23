import React, { useState, useEffect, useRef } from 'react';

function CategoryList({ categories, selectedCategory, onSelectCategory }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const scrollContainerRef = useRef(null);
  const autoPlayIntervalRef = useRef(null);
  
  // Detectar si es dispositivo móvil
  useEffect(() => {
    const checkIfMobile = () => setIsMobile(window.innerWidth < 768);
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);
  
  // Autoavance en móvil con comportamiento circular
  useEffect(() => {
    if (isMobile && categories.length > 2) {
      autoPlayIntervalRef.current = setInterval(() => {
        if (scrollContainerRef.current) {
          const container = scrollContainerRef.current;
          const maxScrollLeft = container.scrollWidth - container.clientWidth;
          
          // Si estamos cerca del final, volver al inicio
          if (container.scrollLeft >= maxScrollLeft - 50) {
            container.scrollTo({
              left: 0,
              behavior: 'smooth'
            });
          } else {
            // De lo contrario, avanzar normalmente
            container.scrollBy({
              left: 160, // Ancho aproximado de un elemento
              behavior: 'smooth'
            });
          }
          
          // Actualizar el índice actual basado en la posición de desplazamiento
          setTimeout(() => {
            const scrollLeft = container.scrollLeft;
            const itemWidth = 160; // Ancho aproximado de un elemento con padding
            const newIndex = Math.round(scrollLeft / itemWidth) % categories.length;
            setCurrentIndex(newIndex);
          }, 300); // Esperar a que termine la animación
        }
      }, 5000);
    }
    return () => {
      if (autoPlayIntervalRef.current) clearInterval(autoPlayIntervalRef.current);
    };
  }, [isMobile, categories.length]);
  
  // Manejar el evento de desplazamiento para actualizar el índice actual
  // y detectar cuando llega al final para volver al inicio
  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const scrollLeft = container.scrollLeft;
      const maxScrollLeft = container.scrollWidth - container.clientWidth;
      const itemWidth = 160; // Ancho aproximado de un elemento con padding
      
      // Actualizar el índice actual
      const newIndex = Math.round(scrollLeft / itemWidth) % categories.length;
      setCurrentIndex(newIndex);
      
      // Si el usuario ha llegado al final manualmente, volver al inicio
      if (scrollLeft >= maxScrollLeft) {
        // Pequeño retraso para que el usuario vea que ha llegado al final
        setTimeout(() => {
          container.scrollTo({
            left: 0,
            behavior: 'smooth'
          });
        }, 300);
      }
    }
  };
  
  // Renderizado móvil
  const renderMobileView = () => {
    return (
      <div className="w-full">
        {/* Contenedor de desplazamiento nativo */}
        <div 
          ref={scrollContainerRef}
          className="flex w-full overflow-x-auto pb-4 hide-scrollbar snap-x snap-mandatory"
          style={{ 
            scrollbarWidth: 'none', // Firefox
            msOverflowStyle: 'none', // IE/Edge
          }}
          onScroll={handleScroll}
        >
          {/* Mostrar todas las categorías en una fila horizontal */}
          {categories.map((category, index) => (
            <div 
              key={category.id} 
              className="flex-none w-32 px-2 snap-start"
              onClick={() => onSelectCategory(category.id)}
            >
              <div className={`bg-gradient-to-br from-white to-gray-100 rounded-lg shadow cursor-pointer h-24
                ${selectedCategory === category.id ? 'ring-2 ring-blue-500' : ''}`}
              >
                <div className="flex flex-col items-center p-2 h-full">
                  <div className="w-full text-center mb-1">
                    <h3 className="text-xs font-semibold text-gray-800 truncate">{category.name}</h3>
                  </div>
                  <div className="w-12 h-12 flex-shrink-0">
                    <img 
                      src={category.imageUrl} 
                      alt={category.name} 
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Flechas indicadoras de deslizamiento */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-1 shadow-md z-10 animate-pulse">
          <svg className="w-5 h-5 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
        
        {/* Indicadores 
        <div className="flex justify-center mt-2">
          <div className="flex space-x-1 max-w-full overflow-x-auto py-1 px-2">
            {categories.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  if (scrollContainerRef.current) {
                    scrollContainerRef.current.scrollTo({
                      left: i * 160,
                      behavior: 'smooth'
                    });
                  }
                  setCurrentIndex(i);
                }}
                className={`h-2 w-2 flex-shrink-0 rounded-full ${currentIndex === i ? 'bg-blue-500' : 'bg-gray-300'}`}
              />
            ))}
          </div>
        </div>*/}
      </div>
    );
  };
  
  // Estilos CSS para ocultar la barra de desplazamiento en WebKit (Chrome, Safari)
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .hide-scrollbar::-webkit-scrollbar {
        display: none;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  
  return (
    <div className="mb-8 w-full relative">
      <h2 className="text-xl font-bold text-white mb-4">Categorías</h2>
      
      {isMobile ? renderMobileView() : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {categories.map((category) => (
            <div 
              key={category.id} 
              className={`flex items-center bg-gradient-to-br from-white to-gray-100 rounded-lg shadow cursor-pointer
                ${selectedCategory === category.id ? 'ring-2 ring-blue-500 transform scale-105' : ''}`}
              onClick={() => onSelectCategory(category.id)}
            >
              <div className="flex w-full items-center p-4">
                <div className="flex-grow">
                  <h3 className="text-md font-semibold text-gray-800">{category.name}</h3>
                </div>
                <div className="w-24 h-24">
                  <img 
                    src={category.imageUrl} 
                    alt={category.name} 
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CategoryList;