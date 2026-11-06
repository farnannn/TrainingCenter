/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        heading: ['"Plus Jakarta Sans"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        sans: ['"IBM Plex Sans"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      colors: {
        industrial: {
          charcoal: '#18232B',
          slate: '#263640',
          orange: '#E88932',
          'orange-hover': '#D47621',
          offwhite: '#F4F6F5',
          white: '#FFFFFF',
          border: '#E2E8E8',
          success: '#397C69',
          warning: '#D5A33D',
          danger: '#B94C45',
          info: '#527FA1',
        },
        raja: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          500: '#E88932',
          600: '#D47621',
          700: '#263640',
          800: '#18232B',
          900: '#11191F',
        }
      }
    },
  },
  plugins: [],
}
