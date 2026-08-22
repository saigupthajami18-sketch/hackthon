/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        burgundy: "#710912",
        black: "#0D0D0D",
        gold: "#C28D39",
        espresso: "#362822",
        champagne: "#EFE5D2",
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'serif'],
        ui: ['"Space Grotesk"', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
