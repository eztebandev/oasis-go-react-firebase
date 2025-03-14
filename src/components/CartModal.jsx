import React from 'react';

function CartModal({ cartItems, onClose, onIncrease, onDecrease, onSendWhatsApp }) {
  const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);
  const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Tu Carrito</h2>
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
          {cartItems.length === 0 ? (
            <div className="text-center py-8">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p className="mt-4 text-gray-600">Tu carrito está vacío</p>
              <button 
                onClick={onClose}
                className="mt-4 text-blue-500 hover:text-blue-600 font-medium"
              >
                Continuar comprando
              </button>
            </div>
          ) : (
            <ul className="divide-y">
              {cartItems.map((item) => (
                <li key={item.id} className="py-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <img src={item.imageUrl} alt={item.name} className="h-16 w-16 object-cover rounded-md mr-4" />
                    <div>
                      <h3 className="text-gray-800 font-medium">{item.name}</h3>
                      <p className="text-gray-600 text-sm">${item.price.toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="flex items-center space-x-2 mr-2">
                      <button 
                        onClick={() => onDecrease(item)}
                        className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-300"
                      >
                        -
                      </button>
                      <span className="text-gray-800 w-6 text-center">{item.quantity}</span>
                      <button 
                        onClick={() => onIncrease(item)}
                        className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-300"
                      >
                        +
                      </button>
                    </div>
                    {/*<span className="font-semibold text-blue-600">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>*/}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        
        {cartItems.length > 0 && (
          <div className="border-t p-4">
            <div className="flex justify-between items-center mb-1">
              <span className="text-gray-600">Subtotal ({totalItems} items)</span>
              <span className="font-semibold">${subtotal.toFixed(2)}</span>
            </div>
            
            <div className="border-t pt-2 mt-2 mb-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-gray-800">Total</span>
                <span className="text-xl font-bold text-blue-600">${subtotal.toFixed(2)}</span>
              </div>
            </div>
            
            <button
              onClick={onSendWhatsApp}
              className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-medium transition duration-300 flex items-center justify-center"
            >
              <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.498 14.382c-.301-.15-1.767-.867-2.04-.966-.273-.101-.473-.15-.673.15-.197.295-.771.964-.944 1.162-.175.195-.349.21-.646.075-.3-.15-1.263-.465-2.403-1.485-.888-.795-1.484-1.77-1.66-2.07-.174-.3-.019-.465.13-.615.136-.135.301-.345.451-.523.146-.181.194-.301.297-.496.1-.21.049-.375-.025-.524-.075-.15-.672-1.62-.922-2.206-.24-.584-.487-.51-.672-.51-.172-.015-.371-.015-.571-.015-.2 0-.523.074-.797.359-.273.3-1.045 1.02-1.045 2.475s1.07 2.865 1.219 3.075c.149.18 2.095 3.195 5.076 4.483.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.29.173-1.414-.074-.124-.272-.196-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Enviar pedido por WhatsApp
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default CartModal;