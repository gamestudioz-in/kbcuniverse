/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'kbc-blue': '#0a192f',
        'kbc-gold': '#ffcc00',
        'kbc-gold-hover': '#ffdb4d',
      },
    },
  },
  plugins: [],
}