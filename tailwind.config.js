/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      maxWidth: {
        '5xl': '64rem',
        '6xl': '72rem',
        '7xl': '80rem',
        '8xl': '120rem',
      },  
      backgroundColor: {
        'dark-message-background': '#303030',
        'light-message-background': '#f4f4f4',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
} 