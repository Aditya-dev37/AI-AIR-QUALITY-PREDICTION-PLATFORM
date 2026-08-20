/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        teal: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          900: '#134e4a',
        },
        navy: {
          800: '#1e293b',
          900: '#0f172a',
        },
        aqi: {
          good: '#10b981',        // Green
          satisfactory: '#84cc16',// Light Green
          moderate: '#eab308',    // Yellow
          poor: '#f97316',        // Orange
          verypoor: '#ef4444',    // Red
          severe: '#881337',      // Maroon
        }
      }
    },
  },
  plugins: [],
}
