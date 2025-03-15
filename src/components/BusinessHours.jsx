import React, { useState, useEffect } from 'react';

function BusinessHours() {
  const [currentSchedule, setCurrentSchedule] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const updateSchedule = () => {
      const now = new Date();
      const day = now.getDay(); // 0 es domingo, 1-5 es lunes a viernes, 6 es sábado
      const hour = now.getHours();

      let schedule = '';
      let open = false;

      if (day >= 1 && day <= 5) { // Lunes a Viernes
        schedule = '6:00 PM - 2:00 AM';
        // Abierto de 18:00 (6 PM) a 02:00 (2 AM del día siguiente)
        open = (hour >= 18) || (hour < 2);
      } else if (day === 6) { // Sábado
        schedule = '12:00 PM - 2:00 AM';
        // Abierto de 12:00 (12 PM) a 02:00 (2 AM del día siguiente)
        open = (hour >= 12) || (hour < 2);
      } else { // Domingo
        schedule = '12:00 PM - 2:00 AM';
        // Abierto de 12:00 (12 PM) a 02:00 (2 AM del día siguiente)
        open = (hour >= 12) || (hour < 2);
      }

      setCurrentSchedule(schedule);
      setIsOpen(open);
    };

    updateSchedule();
    const interval = setInterval(updateSchedule, 60000); // Actualizar cada minuto

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm rounded-lg px-4 py-2 shadow-sm">
      <div className="flex flex-col">
        <span className="text-sm font-medium text-gray-600">
          Horario de hoy:
        </span>
        <span className="text-sm font-medium text-gray-600">
          {currentSchedule}
        </span>
        <span className={`text-xs font-medium ${isOpen ? 'text-green-600' : 'text-red-600'}`}>
          {isOpen ? '● Abierto ahora' : '● Cerrado'}
        </span>
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-5 w-5 text-gray-600" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
          />
        </svg>
      </div>
    </div>
  );
}

export default BusinessHours; 