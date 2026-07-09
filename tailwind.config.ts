import type { Config } from "tailwindcss";

const config: Config = {
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
        mint: {
          50: "#F4FBF6",
          100: "#E3F7EA",
          200: "#C9F0D6",
          300: "#A8E6BF",
          400: "#7DD6A0",
          500: "#4CBF7D",
          600: "#379A63",
        },
        cream: {
          50: "#FFFDF8",
          100: "#FDECC8",
          200: "#FBE0A8",
        },
        peach: {
          100: "#FFE4D6",
          200: "#FFCBAE",
        },
        lavender: {
          100: "#EAE5FB",
          200: "#D8CEF7",
        },
        sky: {
          100: "#DCEEFB",
          200: "#B8DEF7",
        },
        rose: {
          100: "#FCE1E9",
          200: "#F8C2D2",
        },
        ink: {
          DEFAULT: "#1F2A24",
          soft: "#5C6B63",
          faint: "#93A39A",
        },
      },
      boxShadow: {
        soft: "0 2px 10px 0 rgb(31 42 36 / 0.05)",
        card: "0 4px 20px 0 rgb(31 42 36 / 0.06)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};
export default config;
