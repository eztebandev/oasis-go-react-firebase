import React from 'react';

function ProductCard({ product, onAddToCart, onRemoveFromCart, isInCart }) {
  console.log('product', product);
  const handleProductAction = () => {
    if (isInCart) {
      onRemoveFromCart(product);
    } else {
      onAddToCart(product);
    }
  };

  return (
    <div className={`flex flex-col justify-between pb-1 pt-1 bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 h-full
      ${isInCart ? 'ring-2 ring-green-500 shadow-lg' : 'hover:shadow-lg'}`}>
      <div className="relative pb-2/3 h-24 mt-2">
        <img 
          src={product.imageUrl} 
          alt={product.name} 
          className="absolute h-full w-full object-contain"
        />
      </div>
      <div className=" flex flex-col justify-between items-center p-2">
        <h3 className="w-full font-bold text-gray-800 mb-1 text-left">{product.name}</h3>
        {/*<p className="text-gray-600 text-sm mb-2">{product.description}</p>*/}
        <div className="flex w-full flex-row justify-between items-center">
          <p className="text-blue-600 font-bold text-base">s/. {parseFloat(product.price).toFixed(2)}</p>
          <button
            onClick={handleProductAction}
            className={`text-white px-2 py-2 rounded-lg transition duration-300 flex items-center
              ${isInCart ? 'bg-contrast' : 'bg-primary'}`}
          >
            {isInCart ? (
              <>
                <svg className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </>
            ) : (
              <>
                +
                <svg className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
