/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#D7263D',        // Rojo fuerte
        primarySoft: '#E94B5F',    // Rojo más suave
        primaryLighter: '#F28B94', // Rojo aún más claro
        primaryLightest: '#F8C3C8', // Rojo pastel muy claro
        primaryBlack: '#2E2E2E',
        
        secondary: '#F46036',       // Naranja cálido
        background: '#F7F7F7',      // Gris claro fondo
        accent: '#A1C181',          // Verde suave para detalles
        contrast: '#4F6D7A',        // Azul grisáceo para contraste
        textdark: '#2E2E2E',        // Texto negro humo
        
        // Semitransparencias de rojo
        primaryTransparent: 'rgba(215, 38, 61, 0.6)',   // Rojo fuerte con 60% opacidad
        primarySoftTransparent: 'rgba(233, 75, 95, 0.5)', // Rojo más suave con 50% opacidad
        primaryLighterTransparent: 'rgba(242, 139, 148, 0.4)', // Rojo claro con 40% opacidad
        primaryLightestTransparent: 'rgba(248, 195, 200, 0.3)', // Rojo pastel con 30% opacidad
      },
      keyframes: {
        pulse: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.1)' }
        },
        pulseGrow: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.1)' },
        },
        'bounce-x': {
          '0%, 100%': { transform: 'translateX(0)' },
          '50%': { transform: 'translateX(25%)' },
        }
      },
      animation: {
        'bounce-x': 'bounce-x 1s infinite',
        'pulseGrow': 'pulseGrow 1.5s infinite',
      }
    },
  },
  plugins: [],
}

