import type { Config } from "tailwindcss";

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
      },
      fontFamily: {
        serif: [
          "Nicholas",
          "var(--font-playfair)",
          "Playfair Display",
          "serif",
        ],
        sans: [
          "FranklinGothic URW",
          "var(--font-libre-franklin)",
          "Libre Franklin",
          "sans-serif",
        ],
        text: [
          "Nicholas",
          "var(--font-playfair)",
          "Playfair Display",
          "serif",
        ],
      },
    },
    screens: {
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
    },
  },
  plugins: [],
} satisfies Config;
