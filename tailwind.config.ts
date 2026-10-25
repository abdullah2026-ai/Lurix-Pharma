import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#ECFDF5",
          100: "#D1FAE5",
          200: "#A7F3D0",
          300: "#6EE7B7",
          400: "#34D399",
          500: "#10B981",
          600: "#059669",
          700: "#047857",
          800: "#0F3D32",
          900: "#0B2E26",
          950: "#071F1A",
        },
        sidebar: {
          DEFAULT: "#0C332A",
          hover: "#15473B",
          active: "#1E5C4E",
          border: "#184539",
          text: "#A3C2B8",
          textActive: "#FFFFFF",
        },
        surface: {
          bg: "#F2F5F3",
          card: "#FFFFFF",
          cardMuted: "#F7FAF8",
          dark: "#0F382C",
        },
        accent: {
          orange: "#FF6B35",
          lime: "#84CC16",
          amber: "#F59E0B",
          rose: "#F43F5E",
        }
      },
      boxShadow: {
        "neu-sm": "3px 3px 7px rgba(180, 195, 185, 0.4), -3px -3px 7px rgba(255, 255, 255, 0.95)",
        "neu-flat": "7px 7px 16px rgba(180, 195, 185, 0.4), -7px -7px 16px rgba(255, 255, 255, 0.95)",
        "neu-elevated": "12px 12px 28px rgba(12, 51, 42, 0.08), -10px -10px 24px rgba(255, 255, 255, 0.95)",
        "neu-pressed": "inset 3px 3px 6px rgba(180, 195, 185, 0.5), inset -3px -3px 6px rgba(255, 255, 255, 0.95)",
        "neu-button": "4px 4px 10px rgba(180, 195, 185, 0.5), -4px -4px 10px rgba(255, 255, 255, 0.95)",
      },
      borderRadius: {
        "3xl": "1.75rem",
        "4xl": "2.25rem",
      }
    },
  },
  plugins: [],
};

export default config;
