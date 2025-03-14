import React from 'react';

function Cart({ cartItems }) {
  return (
    <div className="border p-4 rounded shadow">
      <h2 className="text-xl font-bold">Carrito</h2>
      {cartItems.length === 0 ? (
        <p>El carrito está vacío</p>
      ) : (
        <ul>
          {cartItems.map((item, index) => (
            <li key={index}>
              {item.name} - ${item.price}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Cart;
