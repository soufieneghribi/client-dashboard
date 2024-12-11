/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",],
  theme: {
   
    extend: {
      colors:{
        blue:{
          360:'#2B2B68',
        },
        orange:{
          360:'#FF5330',
        }
      },
      fontFamily: {
        'limon-milk': ['"limon milk"'],
      },
    },}}