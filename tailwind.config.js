/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      colors: {
        // Dashboard dark palette
        sidebar: {
          DEFAULT: '#0f0e17',
          light: '#171626',
          hover: '#1f1e30',
          active: '#2a2940',
        },
        surface: {
          DEFAULT: '#16151f',
          card: '#1e1d2b',
          cardHover: '#252438',
          border: '#2a293d',
        },
        accent: {
          DEFAULT: '#7c5cfc',
          light: '#9b7eff',
          dark: '#5a3fd4',
          glow: 'rgba(124, 92, 252, 0.15)',
        },
        // Light mode surfaces
        'surface-light': {
          DEFAULT: '#f4f3f8',
          card: '#ffffff',
          cardHover: '#f8f7fc',
          border: '#e5e3ef',
        },
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
        '3xl': '24px',
      },
      boxShadow: {
        'card': '0 2px 12px rgba(0, 0, 0, 0.25)',
        'card-hover': '0 8px 30px rgba(0, 0, 0, 0.35)',
        'card-light': '0 2px 12px rgba(0, 0, 0, 0.08)',
        'card-light-hover': '0 8px 30px rgba(0, 0, 0, 0.12)',
        'glow': '0 0 20px rgba(124, 92, 252, 0.3)',
      },
      keyframes: {
        appear: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pop: {
          "0%, 100%": { transform: "scale(.95)" },
          "50%": { transform: "scale(1.02)" }
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        pop: "pop 200ms ease-in-out",
        appear: "appear 400ms ease-out",
        shimmer: "shimmer 1.5s ease-in-out infinite",
      }
    },
  },
  plugins: [],
}

