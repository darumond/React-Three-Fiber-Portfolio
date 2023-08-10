/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{html,js,jsx,ts,tsx}"],
  theme: {
    fontFamily: {
      poppins: ['Poppins', 'sans-serif'],
    },
    fontStyle: {
      italic: 'italic',
    },
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      'white': '#ffffff',
      'black': '#000000',
      'lightblack': '#454545',
      'purple-dark': '#2843a0',
      'purple-light': '#3e59cf',
      'midnight': '#121063',
      'metal': '#565584',
      'tahiti': '#3ab7bf',
      'silver': '#ecebff',
      'pink': '#9f8bc3',
      'bermuda': '#78dcca',
      'prettywhite': '#fef2f4',
      'blue': '#0066c8',
      'lightblue': '#3baaea',
      'background': "#b9bcff"
    },
  },
  plugins: [],
}

