/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          navy: '#0F1B3D',
          white: '#FFFFFF',
          pink: '#FF3D88',
          dark: '#111111',
          // Tonal variations for subtle UI borders, hover states & surfaces
          navyLight: '#182B5C',
          navyDark: '#0A1229',
          pinkHover: '#E02D73',
          pinkLight: '#FFF0F5',
          pinkBorder: '#FFB8D2',
          surface: '#F8FAFC',
          surfaceCard: '#FFFFFF',
          border: '#E2E8F0',
          mutedText: '#64748B',
        },
      },
      fontFamily: {
        heading: ['"Space Grotesk"', 'sans-serif'],
        sans: ['"Inter"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        card: '0 4px 20px -2px rgba(15, 27, 61, 0.05)',
        cardHover: '0 12px 30px -4px rgba(15, 27, 61, 0.12)',
        pinkGlow: '0 0 20px rgba(255, 61, 136, 0.35)',
      },
    },
  },
  plugins: [],
}

