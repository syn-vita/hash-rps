/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        background: "#0c0c0c",
        surface: "rgba(255,255,255,0.03)",
        "surface-raised": "rgba(255,255,255,0.06)",
        foreground: "#ffffff",
        "foreground-muted": "rgba(255,255,255,0.45)",
        "foreground-subtle": "rgba(255,255,255,0.30)",
        border: "rgba(255,255,255,0.08)",
        "border-strong": "rgba(255,255,255,0.14)",
        primary: "#22c55e",
        "primary-on": "#000000",
        "primary-glow": "rgba(34,197,94,0.15)",
        destructive: "#ef4444"
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"]
      },
      boxShadow: {
        "live-dot": "0 0 6px rgba(34,197,94,0.6)"
      },
      borderRadius: {
        card: "8px",
        btn: "6px",
        input: "6px",
        pill: "7px"
      }
    }
  },
  plugins: []
};
