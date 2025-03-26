import React, { useState, useRef, useEffect } from 'react';

function SearchBar({ onSearch, initialValue = '' }) {
  const [searchTerm, setSearchTerm] = useState(initialValue);
  const [debouncedTerm, setDebouncedTerm] = useState(initialValue);
  const searchContainerRef = useRef(null);
  const debounceTimeoutRef = useRef(null);

  // Efecto para manejar el debounce
  useEffect(() => {
    // Limpiar el timeout anterior si existe
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    // Establecer un nuevo timeout
    debounceTimeoutRef.current = setTimeout(() => {
      setDebouncedTerm(searchTerm);
    }, 1000); // 500ms de espera después de que el usuario deja de escribir
    
    // Limpiar el timeout cuando el componente se desmonte o searchTerm cambie
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [searchTerm]);
  
  // Efecto para ejecutar la búsqueda cuando el término debounced cambie
  useEffect(() => {
    // Solo ejecutar la búsqueda si el término ha cambiado
    if (debouncedTerm !== initialValue) {
      onSearch(debouncedTerm);
    }
  }, [debouncedTerm, onSearch, initialValue]);

  const handleSubmit = (e) => {
    e.preventDefault(); // Prevenir la recarga de la página
    onSearch(searchTerm); // Ejecutar búsqueda inmediatamente al presionar enter
  };

  const handleChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleClear = () => {
    setSearchTerm('');
    setDebouncedTerm('');
    onSearch('');
  };

  return (
    <div ref={searchContainerRef} className="mb-4">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative w-full">
          {/* Icono de lupa (no es un botón, solo decorativo) */}
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          
          {/* Campo de entrada */}
          <input
            type="text"
            value={searchTerm}
            onChange={handleChange}
            placeholder="Buscar productos..."
            className="w-full pl-10 pr-1 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          
          {/* Botón para limpiar (solo visible cuando hay texto) 
          {searchTerm && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}*/}
        </div>
      </form>
    </div>
  );
}

export default SearchBar;
