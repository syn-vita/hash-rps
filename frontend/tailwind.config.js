/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        background: "#0f0f23",
        surface: "#27273b",
        primary: "#7c3aed",
        secondary: "#a78bfa",
        accent: "#f43f5e",
        foreground: "#e2e8f0",
        border: "#4c1d95",
        destructive: "#ef4444"
      },
      fontFamily: {
        heading: ["\"Press Start 2P\"", "cursive"],
        body: ["VT323", "monospace"]
      },
      boxShadow: {
        neon: "0 0 24px rgba(124, 58, 237, 0.4)",
        rose: "0 0 24px rgba(244, 63, 94, 0.4)"
      },
      backgroundImage: {
        grid: "linear-gradient(rgba(167,139,250,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(167,139,250,0.1) 1px, transparent 1px)"
      }
    }
  },
  plugins: []
};
