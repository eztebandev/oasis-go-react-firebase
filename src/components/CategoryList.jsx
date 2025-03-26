import React, { useState, useEffect, useRef } from 'react';

function CategoryList({ categories, selectedCategory, onSelectCategory }) {
  const carouselRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

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
  }, [categories]);

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

  // Función para desplazarse automáticamente a la categoría seleccionada
  useEffect(() => {
    if (selectedCategory && carouselRef.current) {
      // Encontrar el elemento de la categoría seleccionada
      const selectedElement = carouselRef.current.querySelector(`[data-category-id="${selectedCategory.id}"]`);
      if (selectedElement) {
        // Calcular la posición para centrar el elemento
        const containerWidth = carouselRef.current.offsetWidth;
        const elementLeft = selectedElement.offsetLeft;
        const elementWidth = selectedElement.offsetWidth;
        const scrollPosition = elementLeft - (containerWidth / 2) + (elementWidth / 2);
        
        // Desplazarse a la posición calculada
        carouselRef.current.scrollTo({
          left: scrollPosition,
          behavior: 'smooth'
        });
      }
    }
  }, [selectedCategory]);

  // Si no hay categorías, no mostrar nada
  if (!categories || categories.length === 0) {
    return null;
  }

  return (
    <div className="mb-6 relative">
      <h2 className="text-lg font-medium text-white mb-3">Categorías</h2>
      
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
          {/* Botón "Todos" */}
          <div className="flex-none snap-start px-2 w-28 sm:w-32">
            <button
              onClick={() => onSelectCategory(null)}
              className={`flex flex-col items-center p-3 rounded-lg transition-all w-full h-full text-gray-900 justify-center ${
                !selectedCategory
                  ? 'bg-primarySoft border-2 border-primarySoft shadow-md text-white'
                  : 'bg-white border border-primary hover:bg-gray-50'
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                !selectedCategory ? 'bg-primaryLightest text-white' : 'bg-primarySoft text-white'
              }`}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </div>
              <span className={`text-sm font-medium text-center ${!selectedCategory ? 'text-white' : ''}`}>Todos</span>
              {!selectedCategory && (
                <div className="w-1.5 h-1.5 bg-white rounded-full mt-1"></div>
              )}
            </button>
          </div>
          
          {/* Categorías */}
          {categories.map(category => (
            <div 
              key={category.id}
              data-category-id={category.id}
              className="flex-none snap-start px-2 w-28 sm:w-32"
            >
              <button
                onClick={() => onSelectCategory(category)}
                className={`flex flex-col items-center p-1 py-2 rounded-lg transition-all w-full h-full text-gray-900 justify-center ${
                  selectedCategory?.id === category.id
                    ? 'bg-primarySoft border-2 border-white shadow-md text-white'
                    : 'bg-white border border-primary hover:bg-gray-50'
                }`}
              >
                {category.imageUrl ? (
                  <div className="relative">
                    <img 
                      src={category.imageUrl} 
                      alt={category.name} 
                      className={`w-16 h-16 object-contain rounded-full mb-2 bg-white ${
                        selectedCategory?.id === category.id ? 'ring-2 ring-white' : ''
                      }`}
                    />
                    {selectedCategory?.id === category.id && (
                      <div className="absolute -top-1 -right-1 bg-primaryLightest rounded-full w-4 h-4 flex items-center justify-center">
                        <svg className="w-3 h-3 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                    selectedCategory?.id === category.id ? 'bg-primarySoft text-white' : 'bg-primaryLightest text-white'
                  }`}>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                )}
                <span className={`text-sm font-medium text-center line-clamp-2 ${
                  selectedCategory?.id === category.id ? 'text-white' : ''
                }`}>{category.name}</span>
                {selectedCategory?.id === category.id && (
                  <div className="w-1.5 h-1.5 bg-white rounded-full mt-1"></div>
                )}
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
      
      {/* Panel informativo de la categoría seleccionada
      {selectedCategory && (
        <div className="mt-2 px-2">
          <div className="bg-blue-50 rounded-md p-2 text-sm text-blue-800 flex items-center">
            <span className="font-medium mr-2">Categoría seleccionada:</span>
            <span>{selectedCategory.name}</span>
          </div>
        </div>
      )} */}
    </div>
  );
}

export default CategoryList;