/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        finance: {
          bg: '#0B1220',
          secondary: '#111827',
          card: '#151F30',
          hover: '#1E293B',
          border: '#1E293B',
          borderLight: '#334155',
          primary: '#3B82F6',
          primaryHover: '#2563EB',
          success: '#16A34A',
          successLight: '#22C55E',
          danger: '#DC2626',
          dangerLight: '#EF4444',
          warning: '#F59E0B',
          textPrimary: '#F8FAFC',
          textSecondary: '#94A3B8',
          textMuted: '#64748B',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Consolas', 'Courier New', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

