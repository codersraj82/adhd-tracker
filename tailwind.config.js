/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "./services/**/*.{js,jsx}",
    "./utils/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      animation: {
        softPulse: "softPulse 2s ease-in-out infinite",
      },
      keyframes: {
        softPulse: {
          "0%, 100%": {
            boxShadow: "0 0 6px rgba(255,215,0,0.4)",
          },
          "50%": {
            boxShadow: "0 0 14px rgba(255,215,0,0.8)",
          },
        },
      },
    },
  },
  plugins: [],
};
