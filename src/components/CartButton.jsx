import React from 'react';

function CartButton({ onClick, itemCount }) {
  return (
    <button 
      onClick={onClick}
      className="fixed bottom-20 right-4 p-3 bg-primary hover:bg-blue-700 text-white w-14 h-14 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center z-10"
    >
      {/* Ícono nuevo: shopping cart solid */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-14 w-14"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M3 3a1 1 0 0 1 1-1h2a1 1 0 0 1 .96.74L7.68 5H21a1 1 0 0 1 .95 1.31l-2 6A1 1 0 0 1 19 13H8.1l-.6 2H20a1 1 0 1 1 0 2H7a1 1 0 0 1-.96-1.26l1.1-3.64L4.34 4H3a1 1 0 0 1-1-1ZM7 20a2 2 0 1 1 4 0 2 2 0 0 1-4 0Zm10 0a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z" />
      </svg>
      {itemCount > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
          {itemCount}
        </span>
      )}
    </button>
  );
}

export default CartButton;