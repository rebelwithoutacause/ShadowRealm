/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/react-app/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'dark-bg': '#0A0A0A',
        'pale-white': '#F5F5F5',
        'blood-red': '#FF0000',
        'dark-gray': '#1A1A1A',
        'form-bg': '#1B1B1B',
      },
      fontFamily: {
        'creepster': ['Creepster', 'cursive'],
        'nosifer': ['Nosifer', 'cursive'],
        'inter': ['Inter', 'sans-serif'],
      },
      animation: {
        'shake': 'shake 0.5s',
        'flicker': 'flicker 2s infinite',
        'error-shake': 'errorShake 0.3s ease-in-out',
        'fade-in': 'fadeIn 0.3s ease-in',
      },
    },
  },
  plugins: [],
};
