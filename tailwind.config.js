/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/renderer/index.html',
    './src/renderer/src/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        background: '#1a1a1a',
        foreground: '#ffffff',
        muted: {
          DEFAULT: '#252525',
          foreground: '#cccccc'
        },
        border: 'rgba(255, 255, 255, 0.1)'
      }
    }
  },
  plugins: []
}
