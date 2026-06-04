/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2563EB', // ko'k
          hover: '#1D4ED8',
          light: '#DBEAFE',
        },
        secondary: {
          DEFAULT: '#059669', // yashil
          hover: '#047857',
          light: '#D1FAE5',
        },
        danger: {
          DEFAULT: '#DC2626', // qizil
          hover: '#B91C1C',
          light: '#FEE2E2',
        },
        warning: {
          DEFAULT: '#D97706', // to'q sariq
          hover: '#B45309',
          light: '#FEF3C7',
        },
      },
    },
  },
  plugins: [],
}
