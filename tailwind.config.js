/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        green: {
          primary: '#00923C',
          dark:    '#007230',
          light:   '#E6F5EC',
          hero:    '#D6F0E0',
        },
        blue:  { primary: '#0081CF' },
        red:   { primary: '#D2514E' },
        gold:  '#F5C842',
      },
      fontFamily: {
        display: ['Satisfy', 'cursive'],
        body:    ['DM Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
}