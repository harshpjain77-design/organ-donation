/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      colors: {
        brand: {
          50: '#f0fdfa',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
        },
      },
    },
  },
  plugins: [],
}
