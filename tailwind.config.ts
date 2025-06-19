// tailwind.config.ts
import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        main: "#fde047",
        primary: {
          background: "var(--primary-background)",
          text: "var(--primary-text)",
          border: "var(--primary-border)",
          line: "var(--primary-line)",
          accent: "var(--primary-accent)",
        },
      },
      fontFamily: {
        sans: ['"Roboto Flex"', "sans-serif"],
        display: ['"Playfair Display"', "serif"],
      },
    },
  },
  plugins: [
    require("tailwind-scrollbar-hide"),
    plugin(function ({ addBase }) {
      addBase({
        // Default theme (Sinine - blue) - this is what loads initially
        ":root": {
          "--primary-background": "#000957",
          "--primary-text": "#ffffff",
          "--primary-border": "#ffffff",
          "--primary-line": "#ffffff",
          "--primary-accent": "#577BC1",
        },

        // Kollane (Yellow/Default) theme
        ".theme-default, .theme-kollane": {
          "--primary-background": "#fde047",
          "--primary-text": "#000000",
          "--primary-border": "#000000",
          "--primary-line": "#000000",
          "--primary-accent": "#6b7280",
        },

        // Sinine (Blue) theme
        ".theme-blue, .theme-sinine": {
          "--primary-background": "#000957",
          "--primary-text": "#ffffff",
          "--primary-border": "#ffffff",
          "--primary-line": "#ffffff",
          "--primary-accent": "#577BC1",
        },

        // Roheline (Green) theme
        ".theme-green, .theme-roheline": {
          "--primary-background": "#C5FF95",
          "--primary-text": "#16423C",
          "--primary-border": "#16423C",
          "--primary-line": "#16423C",
          "--primary-accent": "#5CB338",
        },
      });
    }),
  ],
} satisfies Config;
