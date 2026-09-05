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
          light: "#F2F7FF", // Docshield's soft card blue (lavander)
        },
        accent: {
          DEFAULT: "#1C718A", // Docshield's teal link/CTA accent (base-blue)
          light: "#2389A7",
          dark: "#155D72",
          tint: "rgba(28, 113, 138, 0.06)",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          muted: "#F5F5F5",
          blue: "#F2F7FF",
          orange: "#FFEDE0",
        },
        peach: "#FFEDE0",
        mint: "#CDF1E6",
        "light-blue": "#BFD7FF",
        "skyblue": "#D2E3FF",
        "dark-grey": "#6F7C86",
        "ambient-blue": "#6D88B4",
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
        serif: ["var(--font-merriweather)", "Georgia", "serif"],
      },
      // A single, disciplined type scale used everywhere instead of ad-hoc
      // pixel values, so every screen shares the same rhythm.
      fontSize: {
        hero: ["4.25rem", { lineHeight: "1.04", letterSpacing: "-0.03em" }],       // 68px — Welcome only
        display: ["2.75rem", { lineHeight: "1.08", letterSpacing: "-0.025em" }],   // 44px — main screen headline
        title: ["1.75rem", { lineHeight: "1.2", letterSpacing: "-0.01em" }],       // 28px — section headers
        "body-lg": ["1.25rem", { lineHeight: "1.5" }],                            // 20px — supporting copy under a headline
        body: ["1.0625rem", { lineHeight: "1.5" }],                              // 17px — default UI copy, buttons
        label: ["0.8125rem", { lineHeight: "1.3", letterSpacing: "0.08em" }],     // 13px — small caps meta labels, used sparingly
      },
      letterSpacing: {
        tightest: '-.04em',
        tighter: '-.02em',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
        card: '1.75rem',     // 28px — the one radius every primary kiosk card shares
        'card-sm': '1.125rem', // 18px — nested cards, inputs, chips
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'subtle': '0 4px 20px -2px rgba(0, 11, 51, 0.05)',
        // Navy-tinted ambient shadow — the single elevation every primary
        // card uses, replacing the mix of plain-black shadow values.
        card: '0 24px 60px -12px rgba(0, 11, 51, 0.16), 0 2px 8px -2px rgba(0, 11, 51, 0.06)',
        float: '0 12px 32px -4px rgba(0, 11, 51, 0.14)',
      },
      transitionTimingFunction: {
        premium: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [],
};
export default config;
