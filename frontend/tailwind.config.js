/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Intel's brand colors
        'intel-blue': '#0071c5',
        'intel-dark-blue': '#003c71',
        'intel-light-blue': '#00aeef',
        'intel-gray': '#959595',
        'intel-light-gray': '#f3f3f3',
        'intel-dark-gray': '#333333',
      },
      fontFamily: {
        'intel': ['Intel Clear', 'Intel One', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
