import React from 'react';

function StoreCard({ store, onEdit, onDelete, onSelect }) {
  // Función para formatear la hora (de "HH:MM" a "HH:MM AM/PM")
  const formatTime = (timeString) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  };

  // Obtener el nombre del día de descanso
  const getDayOffName = (dayOffValue) => {
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    return days[dayOffValue] || 'No especificado';
  };

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg transition-all duration-200 hover:shadow-md">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
            {store.logoUrl ? (
              <img 
                src={store.logoUrl} 
                alt={store.name} 
                className="h-8 w-8 object-cover"
              />
            ) : (
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            )}
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">
                {store.name}
              </dt>
              <dd>
                <div className="text-lg font-medium text-gray-900">
                  {store.address}
                </div>
              </dd>
            </dl>
          </div>
          <div>
            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
              store.state ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {store.state ? 'Activo' : 'Inactivo'}
            </span>
          </div>
        </div>
        
        <div className="mt-4">
          <p className="text-sm text-gray-500 line-clamp-2">
            {store.description || 'Sin descripción'}
          </p>
        </div>
        
        {store.phone && (
          <div className="mt-2 flex items-center text-sm text-gray-500">
            <svg className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            {store.phone}
          </div>
        )}
        
        {store.email && (
          <div className="mt-2 flex items-center text-sm text-gray-500">
            <svg className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            {store.email}
          </div>
        )}
        
        <div className="mt-2 flex items-center text-sm text-gray-500">
          <svg className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {store.allDay ? (
            'Abierto 24 horas'
          ) : (
            <>
              {formatTime(store.init)} - {formatTime(store.close)}
            </>
          )}
        </div>
        
        <div className="mt-2 flex items-center text-sm text-gray-500">
          <svg className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Cerrado: {getDayOffName(store.dayOff)}
        </div>
      </div>
      <div className="bg-gray-50 px-5 py-3 grid grid-cols-3 gap-1">
        <button
          onClick={onSelect}
          className="inline-flex justify-center items-center text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          <svg className="mr-1 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          Productos
        </button>
        <button
          onClick={onEdit}
          className="inline-flex justify-center items-center text-sm font-medium text-gray-600 hover:text-gray-800"
        >
          <svg className="mr-1 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Editar
        </button>
        <button
          onClick={onDelete}
          className="inline-flex justify-center items-center text-sm font-medium text-red-600 hover:text-red-800"
        >
          <svg className="mr-1 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Eliminar
        </button>
      </div>
    </div>
  );
}

export default StoreCard; 