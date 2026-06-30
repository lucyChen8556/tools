import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'SFMono-Regular', 'Consolas', 'monospace'],
      },
      colors: {
        ink: {
          950: '#111827',
          800: '#1f2937',
          700: '#374151',
          600: '#4b5563',
          500: '#6b7280',
          300: '#d1d5db',
          200: '#e5e7eb',
          100: '#f3f4f6',
          50: '#f9fafb',
        },
        teal: {
          700: '#16756f',
          600: '#1b8a82',
          500: '#23a399',
          50: '#eaf7f6',
        },
      },
      boxShadow: {
        soft: '0 18px 60px rgba(17, 24, 39, 0.08)',
      },
    },
  },
  plugins: [],
} satisfies Config;
