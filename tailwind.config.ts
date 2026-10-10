import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        border: "var(--border)",
        panel: "var(--panel)",
        muted: "var(--muted)",
        'muted-foreground': "var(--muted-foreground)",
        // Semantic Examination Feedback Colors
        gra: {
          DEFAULT: "#DC2626", // Red-600
          light: "#FEF2F2",   // Red-50
          border: "#FECACA",  // Red-200
        },
        lr: {
          DEFAULT: "#D97706", // Amber-600
          light: "#FFFBEB",   // Amber-50
          border: "#FDE68A",  // Amber-200
        },
        cc: {
          DEFAULT: "#4F46E5", // Indigo-600
          light: "#EEF2FF",   // Indigo-50
          border: "#C7D2FE",  // Indigo-200
        },
        tr: {
          DEFAULT: "#0284C7", // Sky-600
          light: "#F0F9FF",   // Sky-50
          border: "#BAE6FD",  // Sky-200
        },
        exc: {
          DEFAULT: "#059669", // Emerald-600
          light: "#ECFDF5",   // Emerald-50
          border: "#A7F3D0",  // Emerald-200
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        mono: ["Consolas", "Courier New", "monospace"],
        serif: ["Georgia", "Cambria", "Times New Roman", "serif"],
        exam: ["Arial", "Helvetica", "sans-serif"],
      },
      boxShadow: {
        xs: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        sm: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)",
      },
    },
  },
  plugins: [],
};
export default config;
