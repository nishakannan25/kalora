/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        terracotta: {
          50: '#fff7ed',
          100: '#ffedd5',
          500: '#ea580c',
          600: '#c2410c',
          700: '#9a3412',
          900: '#7c2d12',
        },
        gold: {
          400: '#fbbf24',
          500: '#d97706',
          600: '#b45309',
        },
        heritage: {
          cream: '#FAF6F0',
          dark: '#1C1917',
          deep: '#292524'
        }
      },
      fontFamily: {
        serif: ['Merriweather', 'serif'],
        sans: ['Inter', 'sans-serif']
      }
    },
  },
  plugins: [],
}
