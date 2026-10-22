/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: "#0F172A",
          blue: "#2563EB",
          emerald: "#10B981",
          amber: "#F59E0B",
          red: "#EF4444",
          bg: "#F8FAFC",
          card: "#FFFFFF",
          textPrimary: "#0F172A",
          textSecondary: "#64748B",
          border: "#E2E8F0",
          muted: "#94A3B8",
        },
      },
      borderRadius: {
        DEFAULT: "12px",
        sm: "8px",
        md: "10px",
        lg: "12px",
        xl: "14px",
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 3px 0 rgba(15, 23, 42, 0.06), 0 1px 2px -1px rgba(15, 23, 42, 0.04)",
        dropdown: "0 10px 15px -3px rgba(15, 23, 42, 0.08), 0 4px 6px -4px rgba(15, 23, 42, 0.04)",
      },
    },
  },
  plugins: [],
};
