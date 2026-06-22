/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        vision: {
          blue: "#0b3474",
          dark: "#071f49",
          cyan: "#28c7cf",
          light: "#e8fbfd",
        },
      },
    },
  },
  plugins: [],
}
