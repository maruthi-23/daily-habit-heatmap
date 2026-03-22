/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Sora', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        display: ['Cabinet Grotesk', 'Sora', 'sans-serif'],
      },
      colors: {
        surface: {
          50:  '#f8f7ff',
          100: '#f0eeff',
          200: '#e3dfff',
          900: '#0d0c1a',
          950: '#07060f',
        },
        accent: {
          DEFAULT: '#7c5cfc',
          light: '#9d82fd',
          dark:  '#5b3de8',
        },
        green: {
          400: '#4ade80',
          500: '#22c55e',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease',
        'slide-up': 'slideUp 0.3s cubic-bezier(.16,1,.3,1)',
        'pulse-soft': 'pulseSoft 2s infinite',
      },
      keyframes: {
        fadeIn:     { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp:    { from: { opacity: 0, transform: 'translateY(12px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        pulseSoft:  { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.6 } },
      },
    },
  },
  plugins: [],
}
