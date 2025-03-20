import React from 'react';

function WhatsAppButton({ cartItems }) {

    const handleWhatsAppAction = () => {
        // Calcular subtotal
        const subtotal = cartItems.reduce((total, item) => total + (parseFloat(item.price) * item.quantity), 0);

        // Crear mensaje formateado con listado y total
        const itemsList = cartItems.map(item => 
            `🔹 *${item.name}*\n   Cantidad: ${item.quantity} x $${parseFloat(item.price).toFixed(2)} = $${(parseFloat(item.price) * item.quantity).toFixed(2)}`
        ).join('\n\n');

        let message = '';

        if (cartItems.length > 0) {
            message = `*¡Hola! Quiero realizar el siguiente pedido:*\n\n${itemsList}\n\n` + 
            `💰 *RESUMEN DEL PEDIDO*\n` +
            `📦 Cantidad de productos: ${cartItems.reduce((total, item) => total + item.quantity, 0)}\n` +
            `💵 *TOTAL A PAGAR: $${subtotal.toFixed(2)}*\n\n` +
            `Espero su confirmación.`;
        } else {
            message = 'Hola!, quiero realizar una compra';
        }

        const whatsappUrl = `https://wa.me/918647161?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    };

  return (
    <a
      onClick={handleWhatsAppAction}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-4 right-4 bg-green-500 hover:bg-green-600 text-white w-14 h-14 rounded-full flex items-center justify-center z-10 animate-[pulseGrow_1.5s_infinite]"
    >
      <svg className="h-7 w-7" fill="currentColor" viewBox="0 0 24 24">
        <path d="M17.498 14.382c-.301-.15-1.767-.867-2.04-.966-.273-.101-.473-.15-.673.15-.197.295-.771.964-.944 1.162-.175.195-.349.21-.646.075-.3-.15-1.263-.465-2.403-1.485-.888-.795-1.484-1.77-1.66-2.07-.174-.3-.019-.465.13-.615.136-.135.301-.345.451-.523.146-.181.194-.301.297-.496.1-.21.049-.375-.025-.524-.075-.15-.672-1.62-.922-2.206-.24-.584-.487-.51-.672-.51-.172-.015-.371-.015-.571-.015-.2 0-.523.074-.797.359-.273.3-1.045 1.02-1.045 2.475s1.07 2.865 1.219 3.075c.149.18 2.095 3.195 5.076 4.483.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.29.173-1.414-.074-.124-.272-.196-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
    </a>
  );
}

export default WhatsAppButton;