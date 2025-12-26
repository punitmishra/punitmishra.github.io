/* eslint-env node */

const plugin = require("tailwindcss/plugin");

module.exports = {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  darkMode: "class", // or 'media' or 'class'
  theme: {
    asideScrollbars: {
      light: "light",
      gray: "gray",
    },
    extend: {
      fontFamily: {
        'display': ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        'mono': ['JetBrains Mono', 'Fira Code', 'monospace'],
        'heading': ['Space Grotesk', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
      // Minimalist color palette - focused on 2-3 accents
      colors: {
        accent: {
          DEFAULT: '#3b82f6', // blue-500
          light: '#60a5fa',   // blue-400
          dark: '#2563eb',    // blue-600
        },
        surface: {
          DEFAULT: '#ffffff',
          muted: '#f8fafc',    // slate-50
          subtle: '#f1f5f9',   // slate-100
        },
      },
      // Extended spacing for generous whitespace
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '26': '6.5rem',
        '30': '7.5rem',
        '34': '8.5rem',
        '38': '9.5rem',
      },
      // Refined typography
      letterSpacing: {
        'tightest': '-0.05em',
        'extra-tight': '-0.025em',
      },
      lineHeight: {
        'relaxed': '1.75',
        'loose': '2',
      },
      // Softer border radius
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      zIndex: {
        "-1": "-1",
      },
      flexGrow: {
        5: "5",
      },
      maxHeight: {
        "screen-menu": "calc(100vh - 3.5rem)",
        modal: "calc(100vh - 160px)",
      },
      transitionProperty: {
        position: "right, left, top, bottom, margin, padding",
        textColor: "color",
      },
      // Subtler, refined keyframes
      keyframes: {
        "fade-out": {
          from: { opacity: 1 },
          to: { opacity: 0 },
        },
        "fade-in": {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
        "fade-up": {
          from: { opacity: 0, transform: 'translateY(8px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
        "pulse-slow": {
          "0%, 100%": { opacity: "0.6" },
          "50%": { opacity: "0.8" },
        },
        "subtle-bounce": {
          "0%, 100%": { transform: 'translateY(0)' },
          "50%": { transform: 'translateY(-4px)' },
        },
      },
      animation: {
        "fade-out": "fade-out 200ms ease-out",
        "fade-in": "fade-in 200ms ease-out",
        "fade-up": "fade-up 400ms ease-out",
        "pulse-slow": "pulse-slow 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "subtle-bounce": "subtle-bounce 3s ease-in-out infinite",
      },
      // Softer box shadows
      boxShadow: {
        'soft': '0 2px 8px -2px rgba(0, 0, 0, 0.05), 0 4px 16px -4px rgba(0, 0, 0, 0.05)',
        'soft-lg': '0 4px 12px -4px rgba(0, 0, 0, 0.05), 0 8px 24px -8px rgba(0, 0, 0, 0.08)',
        'soft-xl': '0 8px 24px -8px rgba(0, 0, 0, 0.06), 0 16px 48px -16px rgba(0, 0, 0, 0.1)',
        'inner-soft': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.02)',
      },
    },
  },
  plugins: [
    require("@tailwindcss/forms"),
    plugin(function ({ matchUtilities, theme }) {
      matchUtilities(
        {
          "aside-scrollbars": (value) => {
            const track = value === "light" ? "100" : "900";
            const thumb = value === "light" ? "300" : "600";
            const color = value === "light" ? "gray" : value;

            return {
              scrollbarWidth: "thin",
              scrollbarColor: `${theme(`colors.${color}.${thumb}`)} ${theme(
                `colors.${color}.${track}`
              )}`,
              "&::-webkit-scrollbar": {
                width: "8px",
                height: "8px",
              },
              "&::-webkit-scrollbar-track": {
                backgroundColor: theme(`colors.${color}.${track}`),
              },
              "&::-webkit-scrollbar-thumb": {
                borderRadius: "0.25rem",
                backgroundColor: theme(`colors.${color}.${thumb}`),
              },
            };
          },
        },
        { values: theme("asideScrollbars") }
      );
    }),
  ],
};
