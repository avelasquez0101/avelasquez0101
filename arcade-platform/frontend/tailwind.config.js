/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        arcade: {
          dark: '#0f172a',
          primary: '#6366f1',
          secondary: '#ec4899',
          success: '#10b981',
          error: '#ef4444',
          surface: '#1e293b'
        }
      }
    },
  },
  plugins: [],
}
