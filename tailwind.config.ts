import type { Config } from "tailwindcss";

// export default {
//   content: [
//     "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
//     "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
//     "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
//   ],
//   theme: {
//     extend: {
//       colors: {
//         background: "var(--background)",
//         foreground: "var(--foreground)",
//       },
//     },
//     screens: {
//       sm: "640px", // Tablet
//       md: "768px", // Large Tablet
//       lg: "1024px", // Desktop
//       xl: "1280px", // Large Desktop
//       "2xl": "1536px", // Extra Large Desktop
//     },
//   },
//   plugins: [],
// } satisfies Config;
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
        serif: ['var(--font-playfair)', 'serif'],
      },
      screens: {
        sm: "640px", // Tablet
        md: "768px", // Large Tablet
        lg: "1024px", // Desktop
        xl: "1280px", // Large Desktop
        "2xl": "1536px", // Extra Large Desktop
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: '#000000',
          light: '#333333',
        },
        secondary: {
          DEFAULT: '#666666',
          light: '#999999',
        },
      },
      spacing: {
        'nav-height': '4rem',
      },
    },
  },
  plugins: [],
};