import React from 'react';

function Navigation({ activeTab, setActiveTab, userData, handleLogout }) {
  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            {/*<div className="flex-shrink-0 flex items-center">
              <img
                className="block h-8 w-auto"
                src="/logo.png"
                alt="Logo"
              />
            </div>*/}
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <button
                onClick={() => setActiveTab('stores')}
                className={`${
                  activeTab === 'stores'
                    ? 'border-blue-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
              >
                Establecimientos
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`${
                  activeTab === 'settings'
                    ? 'border-blue-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
              >
                Mi Cuenta
              </button>
            </div>
          </div>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="mr-3 text-sm font-medium text-gray-700">{userData?.name}</span>
              <button
                onClick={handleLogout}
                className="relative inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navigation; 