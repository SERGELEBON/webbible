/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./App.tsx",
  ],
  theme: {
    extend: {
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
      },
      colors: {
        blue: {
          600: '#2B7FFF',
          700: '#1E6FE8',
          800: '#1558C7',
        },
        red: {
          600: '#B12023',
        },
      },
    },
  },
  plugins: [],
}