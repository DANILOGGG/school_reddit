/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: "#F7F5F0",
        ink: "#1F2A24",
        chalk: "#2F6B4F",
        chalkLight: "#E7F1EB",
        board: "#16321F",
        flag: "#C1442E",
      },
      fontFamily: {
        display: ["Georgia", "Cambria", "serif"],
        body: ["-apple-system", "Segoe UI", "sans-serif"],
      },
    },
  },
  plugins: [],
};
