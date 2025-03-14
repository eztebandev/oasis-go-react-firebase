import React from 'react';

function CategoryList({ categories, selectedCategory, onSelectCategory }) {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold text-white mb-4">Categorías</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {categories.map((category) => (
          <div 
            key={category.id} 
            className={`flex justify-center items-center bg-gradient-to-br from-white to-gray-100 rounded-lg shadow overflow-hidden cursor-pointer hover:shadow-md transition-all duration-300 
              ${selectedCategory === category.id ? 'ring-2 ring-blue-500 transform scale-105' : ''}`}
            onClick={() => onSelectCategory(category.id)}
          >
            <div className="flex items-center p-2">
              <div className="flex-grow z-10">
                <h3 className="text-md font-semibold text-gray-800">{category.name}</h3>
              </div>
              <div className="w-30 h-30 ml-2">
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
    </div>
  );
}

export default CategoryList;