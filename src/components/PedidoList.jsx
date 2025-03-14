// src/components/PedidoList.jsx
import { useEffect, useState } from 'react';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

export default function PedidoList() {
  const [pedidos, setPedidos] = useState([]);

  useEffect(() => {
    const fetchPedidos = async () => {
      const pedidosSnap = await getDocs(collection(db, 'pedidos'));
      const pedidosData = await Promise.all(pedidosSnap.docs.map(async (docSnap) => {
        const pedido = docSnap.data();

        const tipoEntrega = await getDoc(doc(db, 'tiposEntrega', pedido.tipoEntregaId));
        const estadoPedido = await getDoc(doc(db, 'estadosPedido', pedido.estadoPedidoId));

        return {
          id: docSnap.id,
          ...pedido,
          tipoEntrega: tipoEntrega.data()?.nombre || 'No definido',
          estadoPedido: estadoPedido.data()?.nombre || 'No definido'
        };
      }));

      setPedidos(pedidosData);
    };

    fetchPedidos();
  }, []);

  return (
    <div className="max-w-4xl mx-auto mt-10">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Lista de Pedidos</h2>
      <div className="space-y-4">
        {pedidos.map(pedido => (
          <div key={pedido.id} className="bg-white shadow-md rounded-lg p-4 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Cliente: {pedido.cliente.nombre}</h3>
            <p className="text-sm text-gray-600 mb-1"><strong>Teléfono:</strong> {pedido.cliente.telefono}</p>
            <p className="text-sm text-gray-600 mb-1"><strong>Dirección:</strong> {pedido.cliente.direccion}</p>
            <p className="text-sm text-gray-600 mb-1"><strong>Tipo de Entrega:</strong> {pedido.tipoEntrega}</p>
            <p className="text-sm text-gray-600 mb-1"><strong>Estado del Pedido:</strong> {pedido.estadoPedido}</p>

            <div className="mt-3">
              <p className="text-sm font-medium text-gray-700 mb-1">Productos:</p>
              <ul className="list-disc ml-5 text-sm text-gray-600">
                {pedido.productos.map((p, idx) => (
                  <li key={idx}>{p.cantidad} x {p.nombre} @ S/. {p.precioUnitario.toFixed(2)}</li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
