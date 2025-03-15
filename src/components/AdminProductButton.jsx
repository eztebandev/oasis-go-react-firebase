import React from 'react';
import { Link } from 'react-router-dom';

function AdminProductButton() {
  return (
    <Link 
      to="/admin-products" 
      className="fixed bottom-72 right-4 bg-green-500 hover:bg-green-600 text-white w-14 h-14 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center z-10"
      title="Administrar Productos"
    >
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
    </Link>
  );
}

export default AdminProductButton; 