/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Основний фон — майже чорний з легким зеленим підтоном
        base: "#0A0F0C",
        surface: "#10170F",
        surfaceRaised: "#151E14",
        border: "#22301F",
        // Відтінки зеленого — від глибокого до яскравого
        moss: "#1F3D2B",
        forest: "#2C5F3E",
        chalk: "#3E8E5C",
        mint: "#6FD69A",
        neon: "#8CF5B0",
        // Текст
        paper: "#EAF3EC",
        muted: "#8FA396",
        // Акценти
        flag: "#E0574B",
        gold: "#E0B84B",
      },
      fontFamily: {
        display: ["Georgia", "Cambria", "serif"],
        body: ["-apple-system", "Segoe UI", "sans-serif"],
      },
    },
  },
  plugins: [],
};
