import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { collection, query, where, getDocs, orderBy, limit, startAfter } from 'firebase/firestore';
import { db } from './firebaseConfig';
import Navbar from './components/Navbar';
import SearchBar from './components/SearchBar';
import ProductList from './components/ProductList';
import CartButton from './components/CartButton';
import CartModal from './components/CartModal';
import WhatsAppButton from './components/WhatsAppButton';
import CategoryList from './components/CategoryList';
import UploadProducts from './components/UploadProducts';
import BulkUpload from './components/BulkUpload';
import AdminLink from './components/AdminLink';
import BulkUploadButton from './components/BulkUploadButton';
import AdminStoreButton from './components/AdminStoreButton';
import AdminProductButton from './components/AdminProductButton';
import StoreManagement from './components/admin-stores/StoreManagement';
import ProductManagement from './components/admin-products/ProductManagement';
import BusinessHours from './components/BusinessHours';
import ServiceLocations from './components/ServiceLocations';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/my-stores/Dashboard';
import axios from 'axios';
import HomePage from './pages/HomePage';

function App() {
  return (
    <Router>
      <div className="min-h-screen w-full flex flex-col">
        <Navbar />
        <Routes>
          {/* Ruta principal - Catálogo de productos */}
          <Route path="/" element={<HomePage />} />

          {/* Ruta de administración de productos */}
          <Route path="/admin/products" element={<ProductManagement />} />

          {/* Ruta por defecto */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;


