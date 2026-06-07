/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        primary: {
          50: '#e8edf4',
          100: '#c5d0e1',
          200: '#9fb0cc',
          300: '#7990b7',
          400: '#5c78a7',
          500: '#3f6097',
          600: '#324d7a',
          700: '#253a5c',
          800: '#18273e',
          900: '#0F3460',
        },
        accent: {
          orange: '#E94560',
          teal: '#16C79A',
        },
        industrial: {
          50: '#f5f5f5',
          100: '#e8e8e8',
          200: '#d1d1d1',
          300: '#b3b3b3',
          400: '#8a8a8a',
          500: '#6b6b6b',
          600: '#535461',
          700: '#424242',
          800: '#1A1A2E',
          900: '#0a0a0f',
        }
      },
      fontFamily: {
        sans: ['"Noto Sans SC"', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'industrial': '4px',
      },
      boxShadow: {
        'industrial': '0 2px 8px rgba(0, 0, 0, 0.15)',
        'industrial-hover': '0 4px 16px rgba(0, 0, 0, 0.2)',
      }
    },
  },
  plugins: [],
};
