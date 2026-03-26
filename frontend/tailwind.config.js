/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        hcLightBlue: '#1e293b', // slate-800
        hcBlue: '#3b82f6',      // blue-500
        hcDarkBlue: '#0f172a',  // slate-900 
        hcTeal: '#14b8a6',      // teal-500
      }
    },
  },
  plugins: [],
}
