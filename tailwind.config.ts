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
    },
    screens: {
      sm: "640px", // Tablet
      md: "768px", // Large Tablet
      lg: "1024px", // Desktop
      xl: "1280px", // Large Desktop
      "2xl": "1536px", // Extra Large Desktop
    },
  },
  plugins: [],
} satisfies Config;
