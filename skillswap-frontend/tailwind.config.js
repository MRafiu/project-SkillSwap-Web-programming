/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#061A4D",
          light: "#071A52",
        },
        brand: {
          blue: "#1463E8",
          blueLight: "#2563EB",
          purple: "#6D28D9",
        },
        surface: "#F5F7FB",
        success: "#16A34A",
        textDark: "#111827",
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
        "3xl": "2rem",
      },
      boxShadow: {
        soft: "0 4px 20px rgba(6, 26, 77, 0.08)",
        card: "0 8px 30px rgba(6, 26, 77, 0.10)",
      },
    },
  },
  plugins: [],
};
