/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: 'var(--color-bg-default)',
          subtle: 'var(--color-bg-subtle)',
          surface: 'var(--color-bg-surface)',
          elevated: 'var(--color-bg-elevated)',
        },
        foreground: {
          DEFAULT: 'var(--color-fg-default)',
          muted: 'var(--color-fg-muted)',
          subtle: 'var(--color-fg-subtle)',
        },
        brand: {
          50: '#ecfeff',
          100: '#cffaff',
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
          700: '#0e7490',
          800: '#155e75',
          900: '#164e63',
          glow: 'rgba(34, 211, 238, 0.25)',
        },
        risk: {
          low: '#10b981',
          'low-bg': 'rgba(16, 185, 129, 0.12)',
          medium: '#f59e0b',
          'medium-bg': 'rgba(245, 158, 11, 0.12)',
          high: '#f43f5e',
          'high-bg': 'rgba(244, 63, 94, 0.12)',
          critical: '#dc2626',
          'critical-bg': 'rgba(220, 38, 38, 0.15)',
        },
        legal: {
          navy: '#050814',
          slate: '#0a0f24',
          panel: '#0f172a',
          accent: '#6366f1',
          border: 'var(--color-border)',
          'border-hover': 'var(--color-border-hover)',
          highlight: 'rgba(34, 211, 238, 0.12)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      borderRadius: {
        xs: '2px',
        sm: '4px',
        md: '6px',
        lg: '8px',
        xl: '12px',
        '2xl': '16px',
      },
      boxShadow: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -2px rgba(0, 0, 0, 0.3)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -4px rgba(0, 0, 0, 0.4)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.6), 0 8px 10px -6px rgba(0, 0, 0, 0.5)',
        glow: '0 0 15px -3px rgba(34, 211, 238, 0.25)',
        'glow-lg': '0 0 25px -5px rgba(34, 211, 238, 0.35)',
      },
      animation: {
        'skeleton-pulse': 'skeleton-pulse 1.8s ease-in-out infinite',
      },
      keyframes: {
        'skeleton-pulse': {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.8' },
        },
      },
    },
  },
  plugins: [],
};

