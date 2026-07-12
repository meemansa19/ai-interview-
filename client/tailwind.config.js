/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Core brand accent — electric indigo/violet gradient family
        brand: {
          50: '#f2f0ff',
          100: '#e6e1ff',
          200: '#c9bdff',
          300: '#a893ff',
          400: '#8a67ff',
          500: '#7c3aed',
          600: '#6d28d9',
          700: '#5b21b6',
          800: '#4c1d95',
          900: '#3b1876',
        },
        // Dark surfaces (not pure black — slightly blue-tinted)
        surface: {
          950: '#05050a',
          900: '#0a0a12',
          800: '#12121e',
          700: '#1a1a2a',
          600: '#25253a',
          500: '#33334d',
        },
        accent: {
          teal: '#2dd4bf',
          amber: '#fbbf24',
          rose: '#fb7185',
        },
      },
      fontFamily: {
        display: ['"Clash Display"', '"Space Grotesk"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      backgroundImage: {
        'grid-pattern': "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
        'hero-gradient': 'radial-gradient(ellipse 80% 60% at 50% -20%, rgba(124,58,237,0.35), transparent)',
      },
      backgroundSize: {
        'grid-pattern': '32px 32px',
      },
      animation: {
        'blob': 'blob 12s infinite',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2.5s linear infinite',
        'fade-up': 'fadeUp 0.6s ease-out forwards',
      },
      keyframes: {
        blob: {
          '0%, 100%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      boxShadow: {
        'glow': '0 0 40px rgba(124,58,237,0.25)',
        'glow-sm': '0 0 20px rgba(124,58,237,0.15)',
        'glass': '0 8px 32px rgba(0,0,0,0.35)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}