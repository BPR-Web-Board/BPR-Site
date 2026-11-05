import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      spacing: Object.fromEntries([1, 2, 3, 4, 5, 6, 7].map(step => [step, `var(--space-${step})`])),
      colors: {
        background: "var(--surface)",
        foreground: "var(--text-primary)",
        muted: "var(--text-muted)",
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
        text: ["Nicholas", "var(--font-playfair)", "Playfair Display", "serif"],
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
