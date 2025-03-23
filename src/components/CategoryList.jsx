import React, { useState, useEffect, useRef } from 'react';

function CategoryList({ categories, selectedCategory, onSelectCategory }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const autoPlayIntervalRef = useRef(null);
  const touchStartXRef = useRef(0);
  const touchEndXRef = useRef(0);
  const containerRef = useRef(null);
  
  // Detectar si es dispositivo móvil
  useEffect(() => {
    const checkIfMobile = () => setIsMobile(window.innerWidth < 768);
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);
  
  // Autoavance en móvil
  useEffect(() => {
    if (isMobile && categories.length > 2) {
      autoPlayIntervalRef.current = setInterval(() => {
        setCurrentIndex(prev => (prev + 2) % (Math.ceil(categories.length / 2) * 2));
      }, 5000);
    }
    return () => {
      if (autoPlayIntervalRef.current) clearInterval(autoPlayIntervalRef.current);
    };
  }, [isMobile, categories.length]);
  
  // Navegación
  const nextSlide = () => {
    setCurrentIndex(prev => (prev + 2) % (Math.ceil(categories.length / 2) * 2));
  };
  
  const prevSlide = () => {
    setCurrentIndex(prev => (prev - 2 + categories.length) % (Math.ceil(categories.length / 2) * 2));
  };
  
  // Manejadores de eventos táctiles para deslizamiento
  const handleTouchStart = (e) => {
    // Detener autoavance temporalmente cuando el usuario interactúa
    if (autoPlayIntervalRef.current) {
      clearInterval(autoPlayIntervalRef.current);
    }
    
    // Guardar posición inicial del toque
    touchStartXRef.current = e.touches[0].clientX;
    touchEndXRef.current = e.touches[0].clientX;
  };
  
  const handleTouchMove = (e) => {
    // Actualizar posición final del toque
    touchEndXRef.current = e.touches[0].clientX;
  };
  
  const handleTouchEnd = () => {
    // Calcular la distancia del deslizamiento
    const touchDiff = touchStartXRef.current - touchEndXRef.current;
    
    // Si el deslizamiento fue significativo (más de 50px)
    if (Math.abs(touchDiff) > 50) {
      if (touchDiff > 0) {
        // Deslizamiento hacia la izquierda -> siguiente slide
        nextSlide();
      } else {
        // Deslizamiento hacia la derecha -> slide anterior
        prevSlide();
      }
    }
    
    // Reiniciar autoavance después de la interacción
    if (isMobile && categories.length > 2) {
      autoPlayIntervalRef.current = setInterval(() => {
        setCurrentIndex(prev => (prev + 2) % (Math.ceil(categories.length / 2) * 2));
      }, 3000);
    }
  };
  
  // Renderizado móvil
  const renderMobileView = () => {
    // Mostrar solo 2 categorías a la vez
    const visibleCategories = categories.slice(currentIndex, currentIndex + 2);
    // Si no hay suficientes categorías, añadir desde el principio
    if (visibleCategories.length < 2 && categories.length > 0) {
      visibleCategories.push(...categories.slice(0, 2 - visibleCategories.length));
    }
    
    return (
      <div 
        className="relative px-2 flex items-center"
        ref={containerRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Solo mostramos 2 categorías a la vez */}
        <div className="grid grid-cols-2 gap-2">
          {visibleCategories.map((category) => (
            <div 
              key={category.id} 
              className={`bg-gradient-to-br from-white to-gray-100 rounded-lg shadow cursor-pointer
                ${selectedCategory === category.id ? 'ring-2 ring-blue-500' : ''}`}
              onClick={() => onSelectCategory(category.id)}
            >
              <div className="flex items-center p-2 h-24">
                <div className="flex-grow">
                  <h3 className="text-sm font-semibold text-gray-800">{category.name}</h3>
                </div>
                <div className="w-16 h-16 flex-shrink-0">
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
        
        {/* Flechas indicadoras de deslizamiento */}
        <div className="absolute right-0 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-1 shadow-md z-10 animate-pulse">
          <svg className="w-5 h-5 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
        
        {/* Indicadores
        <div className="flex justify-center mt-3">
          {Array.from({ length: Math.ceil(categories.length / 2) }).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i * 2)}
              className={`h-2 w-8 mx-1 rounded-full ${Math.floor(currentIndex / 2) === i ? 'bg-blue-500' : 'bg-gray-300'}`}
            />
          ))}
        </div> */}
      </div>
    );
  };
  
  return (
    <div className="mb-8 w-full">
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