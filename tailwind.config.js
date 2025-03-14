/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#D7263D',     // Rojo fuerte
        secondary: '#F46036',   // Naranja cálido
        background: '#F7F7F7',  // Gris claro fondo
        accent: '#A1C181',      // Verde suave para detalles
        contrast: '#4F6D7A',    // Azul grisáceo para contraste
        textdark: '#2E2E2E',    // Texto negro humo
      },
      keyframes: {
        pulse: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.1)' }
        },
        'bounce-x': {
          '0%, 100%': { transform: 'translateX(0)' },
          '50%': { transform: 'translateX(25%)' },
        }
      },
      animation: {
        'bounce-x': 'bounce-x 1s infinite',
      }
    },
  },
  plugins: [],
}

