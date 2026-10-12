/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          dark: '#070b14',
          panel: '#0c1322',
          card: '#101a2e',
          border: '#1e293b',
          glow: '#00f0ff',
          neonGreen: '#10b981',
          neonAmber: '#f59e0b',
          neonRed: '#ef4444',
          neonPurple: '#a855f7'
        }
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scan': 'scan 2.5s ease-in-out infinite',
      },
      keyframes: {
        scan: {
          '0%, 100%': { transform: 'translateY(0%)', opacity: '0.8' },
          '50%': { transform: 'translateY(100%)', opacity: '0.2' },
        }
      }
    },
  },
  plugins: [],
}
