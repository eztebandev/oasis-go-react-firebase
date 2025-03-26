import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebaseConfig';
import axios from 'axios';

// Componentes
import Navigation from './Navigation';
import StoreList from './StoreList';
import StoreForm from './StoreForm';
import ProductManagement from './ProductManagement';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorAlert from '../common/ErrorAlert';

function Dashboard() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('stores');
  const [stores, setStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState(null);
  const [showStoreForm, setShowStoreForm] = useState(false);
  const [editingStore, setEditingStore] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const unsubscribe = auth.onAuthStateChanged(async (user) => {
        if (user) {
          try {
            const userData = JSON.parse(localStorage.getItem('user'));
            setUserData(userData);
            await loadStores(userData.id);
          } catch (error) {
            console.error('Error al obtener datos del usuario:', error);
            setError('Error al cargar los datos del usuario');
          } finally {
            setLoading(false);
          }
        } else {
          await signOut(auth);
          navigate('/login');
        }
      });

      return () => unsubscribe();
    };

    checkAuth();
  }, [navigate]);

  const loadStores = async (userId) => {
    try {
      setLoading(true);
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/my-stores?userId=${userId}`);
      console.log('get my stores', response.data);
      if (response.data) {
        setStores(response.data);
      }
    } catch (error) {
      console.error('Error al cargar tiendas:', error);
      setError('Error al cargar las tiendas. Por favor, inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('user');
      navigate('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      setError('Error al cerrar sesión');
    }
  };

  const handleAddStore = () => {
    setEditingStore(null);
    setShowStoreForm(true);
  };

  const handleEditStore = (store) => {
    setEditingStore(store);
    setShowStoreForm(true);
  };

  const handleDeleteStore = async (storeId) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este establecimiento?')) {
      return;
    }

    try {
      setLoading(true);
      await axios.delete(`${import.meta.env.VITE_API_URL}/stores/${storeId}`);
      setStores(stores.filter(store => store.id !== storeId));
      if (selectedStore && selectedStore.id === storeId) {
        setSelectedStore(null);
        setActiveTab('stores');
      }
    } catch (error) {
      console.error('Error al eliminar tienda:', error);
      setError('Error al eliminar la tienda. Por favor, inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectStore = (store) => {
    setSelectedStore(store);
    setActiveTab('products');
  };

  const handleStoreFormSubmit = async (formData) => {
    try {
      setLoading(true);
      if (editingStore) {
        // Actualizar tienda existente
        const response = await axios.put(
          `${import.meta.env.VITE_API_URL}/edit-store/${editingStore.id}`,
          { ...formData, userId: userData.id }
        );
        setStores(stores.map(store => 
          store.id === editingStore.id ? response.data.store : store
        ));
      } else {
        // Crear nueva tienda
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/create-store`,
          { ...formData, userId: userData.id }
        );
        setStores([...stores, response.data.store]);
      }
      setShowStoreForm(false);
      setEditingStore(null);
    } catch (error) {
      console.error('Error al guardar tienda:', error);
      setError('Error al guardar la tienda. Por favor, inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const renderUserSettings = () => {
    return (
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Información de la cuenta</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">Detalles personales y configuración</p>
        </div>
        <div className="border-t border-gray-200">
          <dl>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Nombre completo</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{userData?.name}</dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Correo electrónico</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{userData?.email}</dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Teléfono</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{userData?.phone || 'No especificado'}</dd>
            </div>
          </dl>
        </div>
      </div>
    );
  };

  if (loading && !userData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navigation 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        userData={userData} 
        handleLogout={handleLogout} 
      />

      <div className="py-10">
        <header>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold leading-tight text-gray-900">
              {activeTab === 'products' ? 'Gestión de Productos' : activeTab === 'stores' ? 'Gestión de Establecimientos' : 'Configuración de la Cuenta'}
            </h1>
          </div>
        </header>
        <main>
          <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div className="px-4 py-8 sm:px-0">
              {error && (
                <ErrorAlert 
                  message={error} 
                  onClose={() => setError('')} 
                />
              )}
              
              {loading && (
                <div className="my-6">
                  <LoadingSpinner />
                </div>
              )}
              
              {!loading && (
                <>
                  {activeTab === 'products' && selectedStore ? (
                    <ProductManagement storeId={selectedStore.id} />
                  ) : activeTab === 'stores' ? (
                    showStoreForm ? (
                      <StoreForm 
                        editingStore={editingStore} 
                        onSubmit={handleStoreFormSubmit} 
                        onCancel={() => setShowStoreForm(false)} 
                      />
                    ) : (
                      <StoreList 
                        stores={stores} 
                        onAddStore={handleAddStore} 
                        onEditStore={handleEditStore} 
                        onDeleteStore={handleDeleteStore} 
                        onSelectStore={handleSelectStore} 
                      />
                    )
                  ) : (
                    renderUserSettings()
                  )}
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Dashboard; 