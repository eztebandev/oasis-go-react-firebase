import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp, writeBatch, doc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import * as XLSX from 'xlsx';

function BulkUpload() {
  const [file, setFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [preview, setPreview] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setMessage({ text: '', type: '' });
    setPreview([]);
    setIsPreviewMode(false);
  };

  const processExcel = () => {
    if (!file) {
      setMessage({ text: 'Por favor selecciona un archivo Excel', type: 'error' });
      return;
    }

    setIsProcessing(true);
    setMessage({ text: '', type: '' });

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        // Validar estructura mínima en cada fila
        const validatedData = jsonData.map((row, index) => {
          // Convertir precio a número si es un string
          const price = typeof row.price === 'string' 
            ? parseFloat(row.price.replace(/[^\d.-]/g, '')) 
            : row.price;

          // Validar campos obligatorios
          if (!row.name || isNaN(price) || !row.imageUrl || !row.productsCategoryId) {
            throw new Error(`Error en la fila ${index + 2}: Faltan campos obligatorios o el precio no es válido`);
          }

          return {
            name: row.name,
            description: row.description || '',
            price: price,
            imageUrl: row.imageUrl,
            productsCategoryId: row.productsCategoryId,
            storeId: row.storeId, // Valor por defecto
            active: row.active === undefined ? true : Boolean(row.active),
          };
        });

        setPreview(validatedData);
        setIsPreviewMode(true);
        setIsProcessing(false);
      } catch (error) {
        console.error("Error al procesar archivo:", error);
        setMessage({ 
          text: `Error al procesar el archivo: ${error.message}`, 
          type: 'error' 
        });
        setIsProcessing(false);
      }
    };
    
    reader.readAsArrayBuffer(file);
  };

  const uploadToFirestore = async () => {
    if (preview.length === 0) {
      setMessage({ text: 'No hay datos para cargar', type: 'error' });
      return;
    }

    setIsProcessing(true);
    setUploadProgress(0);
    
    try {
      const batch = writeBatch(db);
      const productsRef = collection(db, 'products');
      
      // Dividir en batches de máx 500 documentos (límite de Firestore)
      const batchSize = 450;
      const batches = [];
      
      for (let i = 0; i < preview.length; i += batchSize) {
        batches.push(preview.slice(i, i + batchSize));
      }
      
      for (let i = 0; i < batches.length; i++) {
        const currentBatch = writeBatch(db);
        
        batches[i].forEach(product => {
          const docRef = doc(productsRef);
          currentBatch.set(docRef, {
            ...product,
            dateCreate: serverTimestamp()
          });
        });
        
        await currentBatch.commit();
        setUploadProgress(Math.round(((i + 1) / batches.length) * 100));
      }

      setMessage({ 
        text: `¡Éxito! ${preview.length} productos cargados a Firestore.`, 
        type: 'success' 
      });
      setIsPreviewMode(false);
      setPreview([]);
      setFile(null);
    } catch (error) {
      console.error("Error al cargar a Firestore:", error);
      setMessage({ 
        text: `Error al cargar productos: ${error.message}`, 
        type: 'error' 
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Carga Masiva de Productos</h1>
      
      <div className="bg-secondary p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-lg font-semibold mb-4">Instrucciones</h2>
        <p className="mb-3">Sube un archivo Excel (.xlsx) con los siguientes columnas:</p>
        <ul className="list-disc pl-5 mb-4 space-y-1">
          <li><span className="font-medium">name</span> (obligatorio): Nombre del producto</li>
          <li><span className="font-medium">description</span>: Descripción del producto</li>
          <li><span className="font-medium">price</span> (obligatorio): Precio (numérico)</li>
          <li><span className="font-medium">imageUrl</span> (obligatorio): URL de la imagen</li>
          <li><span className="font-medium">productsCategoryId</span> (obligatorio): ID de la categoría</li>
          <li><span className="font-medium">storeId</span>: ID de la tienda (predeterminado: fQjRLVK4QAnVWoZOlu61)</li>
          <li><span className="font-medium">active</span>: Estado activo del producto (predeterminado: true)</li>
        </ul>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="excel-file">
            Seleccionar archivo Excel
          </label>
          <input
            type="file"
            id="excel-file"
            accept=".xlsx,.xls"
            className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-semibold
                      file:bg-blue-50 file:text-blue-700
                      hover:file:bg-blue-100"
            onChange={handleFileChange}
            disabled={isProcessing}
          />
          {file && (
            <p className="mt-2 text-sm text-gray-600">
              Archivo seleccionado: {file.name}
            </p>
          )}
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button
            onClick={processExcel}
            disabled={!file || isProcessing}
            className={`bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:shadow-outline ${(!file || isProcessing) ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isProcessing ? 'Procesando...' : 'Vista previa'}
          </button>
          
          {isPreviewMode && (
            <button
              onClick={uploadToFirestore}
              disabled={isProcessing}
              className={`bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:shadow-outline ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isProcessing ? 'Cargando...' : 'Subir productos'}
            </button>
          )}
        </div>
        
        {message.text && (
          <div className={`mt-4 p-3 rounded ${message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            {message.text}
          </div>
        )}
        
        {isProcessing && uploadProgress > 0 && (
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-blue-600 h-2.5 rounded-full" 
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 text-center mt-1">
              {uploadProgress}% completado
            </p>
          </div>
        )}
      </div>
      
      {isPreviewMode && preview.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4">Vista previa ({preview.length} productos)</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Activo</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {preview.slice(0, 10).map((product, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${product.price.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.productsCategoryId}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.active ? "Sí" : "No"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {preview.length > 10 && (
              <p className="text-sm text-gray-500 mt-2 text-center">
                Mostrando 10 de {preview.length} productos
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default BulkUpload; 