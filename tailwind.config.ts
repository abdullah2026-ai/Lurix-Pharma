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
          50:  "#FFF0F0",
          100: "#FFDDDD",
          200: "#FFBEBE",
          300: "#FF9090",
          400: "#FF5555",
          500: "#EF2323",
          600: "#DC2626",
          700: "#B91C1C",
          800: "#991B1B",
          900: "#7F1D1D",
          950: "#450A0A",
        },
        sidebar: {
          DEFAULT: "#140808",
          hover:   "#1F0D0D",
          active:  "#2D1010",
          border:  "#2A0E0E",
          text:    "#B08080",
          textActive: "#FFFFFF",
        },
        surface: {
          bg:       "#F5F2F2",
          card:     "#FFFFFF",
          cardMuted:"#FAF7F7",
          dark:     "#1A0606",
        },
        accent: {
          orange: "#FF6B35",
          lime:   "#84CC16",
          amber:  "#F59E0B",
          rose:   "#F43F5E",
        },
      },
      boxShadow: {
        "neu-sm":       "3px 3px 7px rgba(200, 180, 180, 0.4), -3px -3px 7px rgba(255, 255, 255, 0.95)",
        "neu-flat":     "7px 7px 16px rgba(200, 180, 180, 0.38), -7px -7px 16px rgba(255, 255, 255, 0.95)",
        "neu-elevated": "12px 12px 28px rgba(180, 10, 10, 0.07), -10px -10px 24px rgba(255, 255, 255, 0.95)",
        "neu-pressed":  "inset 3px 3px 6px rgba(200, 180, 180, 0.5), inset -3px -3px 6px rgba(255, 255, 255, 0.95)",
        "neu-button":   "4px 4px 10px rgba(200, 180, 180, 0.48), -4px -4px 10px rgba(255, 255, 255, 0.95)",
      },
      borderRadius: {
        "3xl": "1.75rem",
        "4xl": "2.25rem",
      },
    },
  },
  plugins: [],
};

export default config;
