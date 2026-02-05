/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        portal: {
          black: "#050505",
          gold: "#D4AF37",
          "gold-light": "#F9E498",
        },
      },
    },
  },
  plugins: [],
};