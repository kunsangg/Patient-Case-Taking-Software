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
        background: "#FFFFFF",
        foreground: "#000B33", // Docshield's signature dark navy
        primary: {
          DEFAULT: "#000B33", 
          hover: "#000000",
          light: "#F2F7FF", // Docshield's soft card blue
        },
        surface: {
          DEFAULT: "#FFFFFF",
          muted: "#F5F5F5",
          blue: "#F2F7FF",
          orange: "#FFEDE0",
        },
        peach: "#FFEDE0",
        "light-blue": "#E5EFFF",
        "skyblue": "#D9E7FF",
        "dark-grey": "#6F7C86",
        "ambient-blue": "#6E88B5",
        border: {
          DEFAULT: "rgba(0, 11, 51, 0.1)",
          light: "rgba(255, 255, 255, 0.4)",
        },
        muted: {
          DEFAULT: "#6F7C86", // Docshield secondary text
        }
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
      },
      letterSpacing: {
        tightest: '-.04em',
        tighter: '-.02em',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'subtle': '0 4px 20px -2px rgba(0, 11, 51, 0.05)',
      }
    },
  },
  plugins: [],
};
export default config;
