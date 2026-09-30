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
        card: {
          DEFAULT: 'var(--color-bg-surface)',
        },
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
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          glow: 'rgba(37, 99, 235, 0.15)',
        },
        risk: {
          low: '#16a34a',
          'low-bg': 'rgba(22, 163, 74, 0.08)',
          medium: '#d97706',
          'medium-bg': 'rgba(217, 119, 6, 0.08)',
          high: '#dc2626',
          'high-bg': 'rgba(220, 38, 38, 0.08)',
          critical: '#991b1b',
          'critical-bg': 'rgba(153, 27, 27, 0.10)',
        },
        legal: {
          navy: '#1e3a8a',
          slate: '#1e40af',
          panel: '#eff6ff',
          accent: '#2563eb',
          border: 'var(--color-border)',
          'border-hover': 'var(--color-border-hover)',
          highlight: 'rgba(37, 99, 235, 0.08)',
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
        sm: '0 1px 3px 0 rgba(0, 0, 0, 0.08), 0 1px 2px -1px rgba(0, 0, 0, 0.06)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.07), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -4px rgba(0, 0, 0, 0.04)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)',
        glow: '0 0 0 3px rgba(37, 99, 235, 0.15)',
        'glow-lg': '0 0 0 4px rgba(37, 99, 235, 0.20)',
      },
      animation: {
        'skeleton-pulse': 'skeleton-pulse 1.8s ease-in-out infinite',
      },
      keyframes: {
        'skeleton-pulse': {
          '0%, 100%': { opacity: '0.5' },
          '50%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
