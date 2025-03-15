import React, { useState, useEffect } from 'react';
import { collection, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

function StoreForm({ store, onClose }) {
  const initialFormData = {
    name: '',
    address: '',
    phone: '',
    logoUrl: '',
    schedule: {
      allDay: false,
      init: '09:00',
      close: '18:00',
      dayOff: 0
    },
    state: true
  };

  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (store) {
      // Si estamos editando, cargamos los datos de la tienda
      setFormData({
        name: store.name || '',
        address: store.address || '',
        phone: store.phone || '',
        logoUrl: store.logoUrl || '',
        schedule: {
          allDay: store.schedule?.allDay || false,
          init: store.schedule?.init || '09:00',
          close: store.schedule?.close || '18:00',
          dayOff: store.schedule?.dayOff || 0
        },
        dateCreate: store.dateCreate || '',
        state: store.state !== undefined ? store.state : true
      });
    }
  }, [store]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('schedule.')) {
      // Para campos del objeto schedule
      const scheduleProp = name.split('.')[1];
      setFormData({
        ...formData,
        schedule: {
          ...formData.schedule,
          [scheduleProp]: type === 'checkbox' ? checked : value
        }
      });
    } else {
      // Para otros campos
      setFormData({
        ...formData,
        [name]: type === 'checkbox' ? checked : value
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es obligatorio';
    }
    
    if (!formData.address.trim()) {
      newErrors.address = 'La dirección es obligatoria';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'El teléfono es obligatorio';
    } else if (!/^\d{9,}$/.test(formData.phone.trim())) {
      newErrors.phone = 'El teléfono debe tener al menos 9 dígitos';
    }
    
    if (!formData.schedule.allDay) {
      if (!formData.schedule.init) {
        newErrors['schedule.init'] = 'La hora de apertura es obligatoria';
      }
      
      if (!formData.schedule.close) {
        newErrors['schedule.close'] = 'La hora de cierre es obligatoria';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {

        const formatDate = () => {
            const fecha = new Date();
        
            return new Intl.DateTimeFormat('es-PE', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
                second: 'numeric',
                hour12: true,
                timeZone: 'America/Lima',
                timeZoneName: 'short' // Devuelve "GMT-5"
            }).format(fecha);
        };

      if (store) {
        // Actualizar tienda existente
        await updateDoc(doc(db, 'stores', store.id), {
          ...formData,
          // No actualizamos dateCreate para mantener la fecha original
        });
      } else {
        formData.dateCreate = formatDate();
        // Crear nueva tienda
        await addDoc(collection(db, 'stores'), {
          ...formData,
          dateCreate: serverTimestamp()
        });
      }
      
      onClose();
    } catch (error) {
      console.error('Error al guardar tienda:', error);
      alert('Ocurrió un error al guardar los datos.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">
            {store ? 'Editar Tienda' : 'Nueva Tienda'}
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="flex-grow overflow-auto p-4">
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* Nombre */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre de la tienda *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
              </div>
              
              {/* Dirección */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dirección *
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${errors.address ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address}</p>}
              </div>
              
              {/* Teléfono */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono *
                </label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
              </div>
              
              {/* URL del logo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL del logo
                </label>
                <input
                  type="text"
                  name="logoUrl"
                  value={formData.logoUrl}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                {formData.logoUrl && (
                  <div className="mt-2 flex justify-center">
                    <img 
                      src={formData.logoUrl} 
                      alt="Logo preview" 
                      className="h-20 w-20 object-cover rounded-md"
                      onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/80?text=Error'; }}
                    />
                  </div>
                )}
              </div>
              
              {/* Horario */}
              <div className="border border-gray-200 rounded-md p-4">
                <h3 className="text-md font-medium text-gray-700 mb-3">Horario</h3>
                
                <div className="mb-3">
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      name="schedule.allDay"
                      checked={formData.schedule.allDay}
                      onChange={handleChange}
                      className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    />
                    <span className="ml-2 text-sm text-gray-700">Abierto 24 horas</span>
                  </label>
                </div>
                
                {!formData.schedule.allDay && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Hora de apertura *
                      </label>
                      <input
                        type="time"
                        name="schedule.init"
                        value={formData.schedule.init}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${errors['schedule.init'] ? 'border-red-500' : 'border-gray-300'}`}
                      />
                      {errors['schedule.init'] && <p className="mt-1 text-sm text-red-600">{errors['schedule.init']}</p>}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Hora de cierre *
                      </label>
                      <input
                        type="time"
                        name="schedule.close"
                        value={formData.schedule.close}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${errors['schedule.close'] ? 'border-red-500' : 'border-gray-300'}`}
                      />
                      {errors['schedule.close'] && <p className="mt-1 text-sm text-red-600">{errors['schedule.close']}</p>}
                    </div>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Día de descanso
                  </label>
                  <select
                    name="schedule.dayOff"
                    value={formData.schedule.dayOff}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value={0}>Domingo</option>
                    <option value={1}>Lunes</option>
                    <option value={2}>Martes</option>
                    <option value={3}>Miércoles</option>
                    <option value={4}>Jueves</option>
                    <option value={5}>Viernes</option>
                    <option value={6}>Sábado</option>
                  </select>
                </div>
              </div>
              
              {/* Estado */}
              <div>
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    name="state"
                    checked={formData.state}
                    onChange={handleChange}
                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
                  <span className="ml-2 text-sm text-gray-700">Tienda activa</span>
                </label>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isSubmitting ? 'Guardando...' : store ? 'Actualizar' : 'Crear'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default StoreForm; 