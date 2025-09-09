/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      keyframes: {
        appear: {
          "0%": {
            opacity: "0",
          },
          "100%": {
            opacity: "1",
          },
        },
        pop: {
          "0%, 100%": { transform: "scale(.90)" },
          "50%": { transform: "scale(1.02)" }
        },
      },
      animation: {
        pop: "pop 200ms ease-in-out",
        appear: "appear 500ms ease-in-out",
      }
    },
    plugins: [],
  }
}

