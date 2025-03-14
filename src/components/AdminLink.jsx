import React from 'react';
import { Link } from 'react-router-dom';

function AdminLink() {
  return (
    <Link 
      to="/upload-products" 
      className="fixed bottom-36 right-4 bg-purple-600 hover:bg-purple-700 text-white w-14 h-14 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center z-10"
      title="Admin: Subir Productos"
    >
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
      </svg>
    </Link>
  );
}

export default AdminLink; 