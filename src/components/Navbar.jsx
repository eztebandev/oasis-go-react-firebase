import React from 'react';
import BusinessHours from './BusinessHours';

function Navbar() {
  return (
    <nav className="bg-gradient-to-r from-primary to-primary text-white shadow-md">
      <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <h1 className="text-2xl font-bold">Oasis Go</h1>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;