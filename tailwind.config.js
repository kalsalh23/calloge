/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'rgb(var(--color-primary) / <alpha-value>)',
          light: 'rgb(var(--color-primary-light) / <alpha-value>)',
          dark: 'rgb(var(--color-primary-dark) / <alpha-value>)',
          deep: 'rgb(var(--color-primary-deep) / <alpha-value>)',
        },
        accent: {
          gold: 'rgb(var(--color-accent-gold) / <alpha-value>)',
          brown: 'rgb(var(--color-accent-brown) / <alpha-value>)',
          'dark-brown': 'rgb(var(--color-accent-dark-brown) / <alpha-value>)',
          burgundy: 'rgb(var(--color-accent-burgundy) / <alpha-value>)',
          deep: 'rgb(var(--color-accent-deep) / <alpha-value>)',
        },
        ink: {
          DEFAULT: 'rgb(var(--color-text) / <alpha-value>)',
          dark: 'rgb(var(--color-text-dark) / <alpha-value>)',
          light: 'rgb(var(--color-text-light) / <alpha-value>)',
          muted: 'rgb(var(--color-text-muted) / <alpha-value>)',
        },
        surface: {
          DEFAULT: 'rgb(var(--color-bg) / <alpha-value>)',
          alt: 'rgb(var(--color-bg-alt) / <alpha-value>)',
          glass: 'rgb(var(--color-glass) / <alpha-value>)',
          border: 'rgb(var(--color-border) / <alpha-value>)',
        },
      },
      fontFamily: {
        sans: ['Tajawal', 'Cairo', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        display: ['Cairo', 'Tajawal', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      boxShadow: {
        soft: '0 10px 40px -12px rgba(5, 66, 57, 0.15)',
        softer: '0 4px 24px -8px rgba(5, 66, 57, 0.1)',
        glow: '0 0 0 1px rgba(185, 167, 121, 0.12), 0 20px 60px -20px rgba(5, 66, 57, 0.35)',
        card: '0 2px 12px rgba(22, 22, 22, 0.06)',
      },
      backdropBlur: {
        xs: '2px',
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.55' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) both',
        shimmer: 'shimmer 1.5s infinite',
        'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
