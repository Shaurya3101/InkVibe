import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: {
          light: "#faf9f6", // warm cream alabaster
          dark: "#0b0b0b",  // deep charcoal onyx
          cardLight: "#ffffff",
          cardDark: "#121212",
        },
        ink: {
          light: "#1a1816", // rich dark charcoal
          dark: "#f4f3ef",  // premium soft cream white
        },
        mutedText: {
          light: "#57534e", // warm gray
          dark: "#a8a29e",  // warm light gray
        },
        borderCol: {
          light: "#e7e5e4", // soft stone border
          dark: "#232323",  // dark divider border
        },
        accent: {
          DEFAULT: "#c5a880", // gold/bronze
          hover: "#b5966d",
          dark: "#d4af37", // bright gold
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        serif: ["var(--font-playfair)", "serif"],
      },
    },
  },
  plugins: [],
};
export default config;
