// src/components/PedidoForm.jsx
import { useState, useEffect } from 'react';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';

export default function PedidoForm() {
  const [cliente, setCliente] = useState({ nombre: '', telefono: '', direccion: '' });
  const [productos, setProductos] = useState([]);
  const [productoInput, setProductoInput] = useState({ nombre: '', cantidad: 1, precioUnitario: 0 });
  const [tipoEntregaId, setTipoEntregaId] = useState('');
  const [estadoPedidoId, setEstadoPedidoId] = useState('');
  const [tiposEntrega, setTiposEntrega] = useState([]);
  const [estadosPedido, setEstadosPedido] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const tiposSnap = await getDocs(collection(db, 'tiposEntrega'));
      setTiposEntrega(tiposSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      const estadosSnap = await getDocs(collection(db, 'estadosPedido'));
      setEstadosPedido(estadosSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };

    fetchData();
  }, []);

  const agregarProducto = () => {
    if (!productoInput.nombre || productoInput.cantidad <= 0 || productoInput.precioUnitario <= 0) {
      alert('Completa los datos del producto');
      return;
    }
    setProductos([...productos, productoInput]);
    setProductoInput({ nombre: '', cantidad: 1, precioUnitario: 0 });
  };

  const guardarPedido = async () => {
    if (!cliente.nombre || productos.length === 0 || !tipoEntregaId || !estadoPedidoId) {
      alert('Completa todos los campos');
      return;
    }

    const pedido = {
      cliente,
      tiendaId: 'tuTiendaId123',
      productos,
      tipoEntregaId,
      estadoPedidoId,
      voucherUrl: '',
      fechaCreacion: new Date()
    };

    try {
      await addDoc(collection(db, 'pedidos'), pedido);
      alert('Pedido guardado con éxito');
      setCliente({ nombre: '', telefono: '', direccion: '' });
      setProductos([]);
      setTipoEntregaId('');
      setEstadoPedidoId('');
    } catch (error) {
      console.error('Error al guardar pedido', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-lg mx-auto mt-8">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Crear Nuevo Pedido</h2>

      {/* Cliente */}
      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-1">Nombre Cliente</label>
        <input
          type="text"
          className="w-full border border-gray-300 rounded px-3 py-2 focus:ring focus:ring-blue-300"
          value={cliente.nombre}
          onChange={e => setCliente({ ...cliente, nombre: e.target.value })}
          placeholder="Nombre del cliente"
        />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-1">Teléfono</label>
        <input
          type="text"
          className="w-full border border-gray-300 rounded px-3 py-2 focus:ring focus:ring-blue-300"
          value={cliente.telefono}
          onChange={e => setCliente({ ...cliente, telefono: e.target.value })}
          placeholder="Número de teléfono"
        />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-1">Dirección</label>
        <input
          type="text"
          className="w-full border border-gray-300 rounded px-3 py-2 focus:ring focus:ring-blue-300"
          value={cliente.direccion}
          onChange={e => setCliente({ ...cliente, direccion: e.target.value })}
          placeholder="Dirección de entrega"
        />
      </div>

      {/* Producto */}
      <div className="border-t pt-4 mt-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Agregar Producto</h3>

        <div className="flex flex-col gap-2 mb-3">
          <input
            type="text"
            className="border border-gray-300 rounded px-3 py-2 focus:ring focus:ring-green-300"
            placeholder="Nombre del producto"
            value={productoInput.nombre}
            onChange={e => setProductoInput({ ...productoInput, nombre: e.target.value })}
          />
          <input
            type="number"
            min="1"
            className="border border-gray-300 rounded px-3 py-2 focus:ring focus:ring-green-300"
            placeholder="Cantidad"
            value={productoInput.cantidad}
            onChange={e => setProductoInput({ ...productoInput, cantidad: parseInt(e.target.value) })}
          />
          <input
            type="number"
            min="0.01"
            className="border border-gray-300 rounded px-3 py-2 focus:ring focus:ring-green-300"
            placeholder="Precio unitario"
            value={productoInput.precioUnitario}
            onChange={e => setProductoInput({ ...productoInput, precioUnitario: parseFloat(e.target.value) })}
          />
          <button
            onClick={agregarProducto}
            className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition"
          >
            Agregar Producto
          </button>
        </div>

        {productos.length > 0 && (
          <ul className="list-disc ml-5 text-sm text-gray-700 space-y-1">
            {productos.map((prod, idx) => (
              <li key={idx}>
                {prod.cantidad} x {prod.nombre} @ S/. {prod.precioUnitario.toFixed(2)}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Tipo de entrega */}
      <div className="mb-4 mt-4">
        <label className="block text-gray-700 font-medium mb-1">Tipo de Entrega</label>
        <select
          className="w-full border border-gray-300 rounded px-3 py-2 focus:ring focus:ring-blue-300"
          value={tipoEntregaId}
          onChange={e => setTipoEntregaId(e.target.value)}
        >
          <option value="">Selecciona tipo de entrega</option>
          {tiposEntrega.map(te => (
            <option key={te.id} value={te.id}>{te.nombre}</option>
          ))}
        </select>
      </div>

      {/* Estado del pedido */}
      <div className="mb-6">
        <label className="block text-gray-700 font-medium mb-1">Estado del Pedido</label>
        <select
          className="w-full border border-gray-300 rounded px-3 py-2 focus:ring focus:ring-blue-300"
          value={estadoPedidoId}
          onChange={e => setEstadoPedidoId(e.target.value)}
        >
          <option value="">Selecciona estado</option>
          {estadosPedido.map(est => (
            <option key={est.id} value={est.id}>{est.nombre}</option>
          ))}
        </select>
      </div>

      <button
        onClick={guardarPedido}
        className="w-full bg-blue-600 text-white py-3 px-4 rounded hover:bg-blue-700 transition text-lg font-medium"
      >
        Guardar Pedido
      </button>
    </div>
  );
}
