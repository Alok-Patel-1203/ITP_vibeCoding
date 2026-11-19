/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        charcoal: {
          950: '#0B0F17',
          900: '#111827',
          800: '#1F2937', // Primary Dark Charcoal
          700: '#374151',
          600: '#4B5563',
          500: '#6B7280',
        },
        gold: {
          50: '#FDF8EA',
          100: '#FAF0CB',
          200: '#F5E197',
          300: '#EFD163',
          400: '#E4BD32',
          500: '#D4A017', // Primary Gold Accent
          600: '#B5830E',
          700: '#8A610A',
          800: '#644409',
          900: '#422B06',
        },
        amber: {
          500: '#F59E0B',
          600: '#D97706',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      borderRadius: {
        'card': '1rem',      // rounded-xl
        'card-lg': '1.5rem',  // rounded-2xl
      }
    },
  },
  plugins: [],
}
