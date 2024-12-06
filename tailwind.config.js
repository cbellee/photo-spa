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
        pop: {
          "0%, 100%": { transform: "scale(.90)" },
          "50%": { transform: "scale(1.02)" }
        }
      },
      animation: {
        pop: "pop 200ms ease-in-out"
      }
    }
  },
  plugins: [],
}


