/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Inter', 'sans-serif'],
      },

      colors: {
        primary: '#16a34a', // Green-600
        'on-primary': '#FFFFFF',
        'primary-container': '#dcfce7', // Green-100
        'on-primary-container': '#14532d', // Green-900

        secondary: '#059669', // Emerald-600
        'on-secondary': '#FFFFFF',
        'secondary-container': '#d1fae5', // Emerald-100

        accent: '#f59e0b', // Amber-500
        'on-accent': '#FFFFFF',

        background: '#F8F9FA',
        surface: '#FFFFFF',
        'surface-variant': '#E9ECEF',
        outline: '#ADB5BD',

        sidebar: '#0f172a', // Slate-900
        'text-main': '#1F2937',

        indigo: '#4F46E5',
        cyan: '#06B6D4',
        gold: '#f59e0b',
      },
    },
  },
  plugins: [],
}