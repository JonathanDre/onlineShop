/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {backgroundImage: {
      'girl': "url('/assets/girl1.png')",
    }},
  },
  plugins: [require('tailwind-scrollbar')],
}

