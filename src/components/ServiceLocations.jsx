import React from 'react';

function ServiceLocations() {
  const locations = [
    { name: "Nasca", address: "Av. Principal #123" },
    { name: "Vista Alegre", address: "Calle Las Flores #456" },
    { name: "Cajuca", address: "Jr. Los Pinos #789" }
  ];

  return (
    <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm rounded-lg px-2 py-2 shadow-sm">

      <div className="flex flex-col">
        <span className="text-sm font-medium text-gray-600">
          Lugares de atención:
        </span>
        <div className="flex-wrap gap-2 mt-1">
          {locations.map((location, index) => (
            <span 
              key={index} 
              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800"
              title={location.address}
            >
              {location.name}
            </span>
          ))}
        </div>
        <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5 text-gray-600 flex-shrink-0" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
        >
            <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" 
            />
            <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" 
            />
        </svg>
      </div>
    </div>
  );
}

export default ServiceLocations; 