import React, { useState, useRef, useEffect, useCallback } from 'react';
import axios from 'axios';
import { GoogleMap, LoadScript, Marker, useJsApiLoader } from '@react-google-maps/api';

const mapContainerStyle = {
  width: '100%',
  height: '300px'
};

const center = {
  lat: 19.4326, // Coordenadas de Ciudad de México por defecto
  lng: -99.1332
};

const daysOfWeek = [
  { value: 0, label: 'Domingo' },
  { value: 1, label: 'Lunes' },
  { value: 2, label: 'Martes' },
  { value: 3, label: 'Miércoles' },
  { value: 4, label: 'Jueves' },
  { value: 5, label: 'Viernes' },
  { value: 6, label: 'Sábado' }
];

// Componente de mapa separado para evitar recargas de la API
function StoreLocationMap({ markerPosition, setMarkerPosition, setAddress }) {
    
  console.log('markerPosition func', markerPosition);
  const googleMapApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: googleMapApiKey,
    id: 'google-map-script'
  });
  
  const mapRef = useRef(null);
  
  const onLoad = useCallback(map => {
    mapRef.current = map;
  }, []);
  
  const onUnmount = useCallback(() => {
    mapRef.current = null;
  }, []);
  
  const handleMapClick = useCallback(async (e) => {
    const newPosition = {
      lat: e.latLng.lat(),
      lng: e.latLng.lng()
    };
    
    setMarkerPosition(newPosition);
    
    // Obtener dirección a partir de coordenadas (geocodificación inversa)
    try {
      const geocoder = new window.google.maps.Geocoder();
      const response = await new Promise((resolve, reject) => {
        geocoder.geocode({ location: newPosition }, (results, status) => {
          if (status === "OK" && results[0]) {
            resolve(results[0].formatted_address);
          } else {
            reject(new Error(`Geocoder failed: ${status}`));
          }
        });
      });
      
      setAddress(response);
    } catch (error) {
      console.error("Error al obtener dirección:", error);
    }
  }, [setMarkerPosition, setAddress]);
  
  if (loadError) {
    return <div className="p-4 bg-red-50 text-red-700 rounded">Error al cargar Google Maps</div>;
  }
  
  if (!isLoaded) {
    return <div className="p-4 bg-gray-50 text-gray-500 rounded">Cargando mapa...</div>;
  }
  
  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      center={markerPosition}
      zoom={15}
      onClick={handleMapClick}
      onLoad={onLoad}
      onUnmount={onUnmount}
    >
      <Marker position={markerPosition} />
    </GoogleMap>
  );
}

function StoreForm({ editingStore, onSubmit, onCancel }) {
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [formError, setFormError] = useState('');
  const [allDay, setAllDay] = useState(editingStore?.allDay || false);
  const [markerPosition, setMarkerPosition] = useState({
    lat: parseFloat(editingStore?.lat) || center.lat,
    lng: parseFloat(editingStore?.long) || center.lng
  });
  const [address, setAddress] = useState(editingStore?.address || '');
  const fileInputRef = useRef(null);
  const googleMapApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  console.log('markerPosition', markerPosition);

  useEffect(() => {
    if (editingStore) {
      if (editingStore.logoUrl) {
        setLogoPreview(editingStore.logoUrl);
      }
      if (editingStore.allDay !== undefined) {
        setAllDay(editingStore.allDay);
      }
      if (editingStore.lat && editingStore.long) {
        setMarkerPosition({
          lat: parseFloat(editingStore.lat),
          lng: parseFloat(editingStore.long)
        });
      }
      if (editingStore.address) {
        setAddress(editingStore.address);
      }
    }
  }, [editingStore]);

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar tipo de archivo
      if (!file.type.match('image.*')) {
        setFormError('Por favor, selecciona un archivo de imagen válido.');
        return;
      }
      
      // Validar tamaño (máximo 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setFormError('La imagen no debe superar los 2MB.');
        return;
      }
      
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
      setFormError('');
    }
  };

  const handleRemoveLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAddressChange = (e) => {
    setAddress(e.target.value);
  };
  
  const searchAddress = async () => {
    if (!address.trim()) return;
    
    try {
      const geocoder = new window.google.maps.Geocoder();
      const response = await new Promise((resolve, reject) => {
        geocoder.geocode({ address }, (results, status) => {
          if (status === "OK" && results[0]) {
            resolve(results[0]);
          } else {
            reject(new Error(`Geocoder failed: ${status}`));
          }
        });
      });
      
      const newPosition = {
        lat: response.geometry.location.lat(),
        lng: response.geometry.location.lng()
      };
      
      setMarkerPosition(newPosition);
    } catch (error) {
      console.error("Error al buscar dirección:", error);
      setFormError("No se pudo encontrar la dirección. Intenta con otra o selecciona manualmente en el mapa.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    
    const form = e.target;
    const name = form.name.value.trim();
    const phone = form.phone.value.trim();
    const description = form.description?.value.trim() || '';
    const email = form.email?.value.trim() || '';
    const state = form.state?.checked || false;
    const dayOff = parseInt(form.dayOff.value, 10);
    const init = allDay ? '00:00' : form.init.value;
    const close = allDay ? '23:59' : form.close.value;
    const logoFile = logoPreview;
    
    // Validaciones
    if (!name) {
      setFormError('El nombre del establecimiento es obligatorio.');
      return;
    }
    
    if (!address) {
      setFormError('La dirección es obligatoria.');
      return;
    }
    
    if (!phone) {
      setFormError('El teléfono es obligatorio.');
      return;
    }
    
    if (!allDay && (!init || !close)) {
      setFormError('Debes especificar el horario de apertura y cierre.');
      return;
    }
    
    try {
      
      // Preparar datos para enviar
      const storeData = {
        name,
        address,
        phone,
        description,
        email,
        state,
        allDay,
        init,
        close,
        dayOff,
        logoFile,
        lat: markerPosition.lat,
        long: markerPosition.lng,
      };
      
      // Enviar datos al componente padre
      onSubmit(storeData);
    } catch (error) {
      console.error('Error al guardar:', error);
      setFormError(error.message || 'Error al guardar los datos. Por favor, inténtalo de nuevo.');
    }
  };

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          {editingStore ? 'Editar Establecimiento' : 'Nuevo Establecimiento'}
        </h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Completa la información de tu establecimiento
        </p>
      </div>
      
      {formError && (
        <div className="mx-6 my-4 bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{formError}</p>
            </div>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="border-t border-gray-200">
        <div className="px-4 py-5 bg-white sm:p-6">
          <div className="grid grid-cols-6 gap-6">
            <div className="col-span-6 sm:col-span-3">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nombre del establecimiento</label>
              <input
                type="text"
                name="name"
                id="name"
                defaultValue={editingStore?.name || ''}
                className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                required
              />
            </div>
            
            <div className="col-span-6 sm:col-span-3">
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Teléfono</label>
              <input
                type="tel"
                name="phone"
                id="phone"
                defaultValue={editingStore?.phone || ''}
                className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                required
              />
            </div>
            
            <div className="col-span-6 sm:col-span-3">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Correo electrónico</label>
              <input
                type="email"
                name="email"
                id="email"
                defaultValue={editingStore?.email || ''}
                className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              />
            </div>
            
            <div className="col-span-6 sm:col-span-3">
              <label htmlFor="dayOff" className="block text-sm font-medium text-gray-700">Día de descanso</label>
              <select
                id="dayOff"
                name="dayOff"
                defaultValue={editingStore?.dayOff !== undefined ? editingStore.dayOff : 0}
                className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                {daysOfWeek.map(day => (
                  <option key={day.value} value={day.value}>{day.label}</option>
                ))}
              </select>
            </div>
            
            <div className="col-span-6">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">Descripción</label>
              <textarea
                id="description"
                name="description"
                rows={3}
                defaultValue={editingStore?.description || ''}
                className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              />
            </div>
            
            <div className="col-span-6">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="allDay"
                    name="allDay"
                    type="checkbox"
                    checked={allDay}
                    onChange={(e) => setAllDay(e.target.checked)}
                    className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="allDay" className="font-medium text-gray-700">Abierto 24 horas</label>
                  <p className="text-gray-500">Marca esta opción si tu establecimiento está abierto todo el día</p>
                </div>
              </div>
            </div>
            
            {!allDay && (
              <div className="col-span-6 sm:col-span-3">
                <label htmlFor="init" className="block text-sm font-medium text-gray-700">Hora de apertura</label>
                <input
                  type="time"
                  name="init"
                  id="init"
                  defaultValue={editingStore?.init || '08:00'}
                  className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            )}
            
            {!allDay && (
              <div className="col-span-6 sm:col-span-3">
                <label htmlFor="close" className="block text-sm font-medium text-gray-700">Hora de cierre</label>
                <input
                  type="time"
                  name="close"
                  id="close"
                  defaultValue={editingStore?.close || '20:00'}
                  className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            )}
            
            <div className="col-span-6">
              <label className="block text-sm font-medium text-gray-700">Logo</label>
              <div className="mt-1 flex items-center">
                {logoPreview ? (
                  <div className="relative">
                    <img src={logoPreview} alt="Logo preview" className="h-32 w-32 object-cover rounded-md" />
                    <button
                      type="button"
                      onClick={handleRemoveLogo}
                      className="absolute top-0 right-0 -mt-2 -mr-2 bg-red-100 rounded-full p-1 text-red-600 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div className="flex justify-center items-center h-32 w-32 border-2 border-gray-300 border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                      <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <div className="flex text-sm text-gray-600">
                        <label htmlFor="logo-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                          <span>Subir logo</span>
                          <input
                            id="logo-upload"
                            name="logo-upload"
                            type="file"
                            ref={fileInputRef}
                            className="sr-only"
                            accept="image/*"
                            onChange={handleLogoChange}
                          />
                        </label>
                      </div>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF hasta 2MB</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          
            <div className="sm:col-span-6">
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
              <div className="flex mb-2">
                <input
                  type="text"
                  id="address"
                  value={address}
                  onChange={handleAddressChange}
                  className="focus:ring-blue-500 p-2 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md rounded-r-none"
                  placeholder="Ingresa la dirección"
                />
                <button
                  type="button"
                  onClick={searchAddress}
                  className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 shadow-sm text-sm font-medium rounded-r-md text-gray-700 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
              <p className="text-xs text-gray-500 mb-2">Busca una dirección o haz clic en el mapa para seleccionar la ubicación exacta</p>
              
              <StoreLocationMap 
                markerPosition={markerPosition} 
                setMarkerPosition={setMarkerPosition}
                setAddress={setAddress}
              />
              
              <div className="mt-2 grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="lat" className="block text-sm font-medium text-gray-700">Latitud</label>
                  <input
                    type="text"
                    id="lat"
                    name="lat"
                    value={markerPosition.lat}
                    readOnly
                    className="mt-1 bg-gray-50 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label htmlFor="long" className="block text-sm font-medium text-gray-700">Longitud</label>
                  <input
                    type="text"
                    id="long"
                    name="long"
                    value={markerPosition.lng}
                    readOnly
                    className="mt-1 bg-gray-50 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>
            </div>
            
            <div className="col-span-6">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="state"
                  id="state"
                  defaultChecked={editingStore?.state || false}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="state" className="ml-2 block text-sm text-gray-700">
                  Activo
                </label>
              </div>
            </div>
          </div>
        </div>
        
        <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
          <button
            type="button"
            onClick={onCancel}
            className="mr-3 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            disabled={uploadingLogo}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            disabled={uploadingLogo}
          >
            {uploadingLogo ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Guardando...
              </>
            ) : (
              'Guardar'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default StoreForm; 