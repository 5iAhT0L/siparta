import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/contexts/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#f6faf7",
        surface: "#ffffff",
        "surface-2": "#f0fdf4",
        border: "#d1fae5",
        "border-muted": "#e5e7eb",
        primary: {
          DEFAULT: "#16a34a",
          dark: "#15803d",
          light: "#dcfce7",
        },
        text: {
          DEFAULT: "#111827",
          muted: "#6b7280",
          subtle: "#9ca3af",
        },
        danger: "#dc2626",
        warning: "#d97706",
      },
      spacing: {
        "sidebar-w": "224px",
        "bottom-bar-h": "60px",
      },
      height: {
        "bottom-bar": "60px",
      },
      width: {
        sidebar: "224px",
      },
    },
  },
  plugins: [],
};

export default config;
