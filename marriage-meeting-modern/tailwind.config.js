/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    // Accent color classes - stronger gradients
    'bg-purple-50', 'bg-purple-100', 'bg-purple-200', 'dark:bg-purple-900/30', 'dark:bg-purple-800/50',
    'bg-green-50', 'bg-green-100', 'bg-green-200', 'dark:bg-green-900/30', 'dark:bg-green-800/50',
    'bg-blue-50', 'bg-blue-100', 'bg-blue-200', 'dark:bg-blue-900/30', 'dark:bg-blue-800/50',
    'bg-slate-50', 'bg-slate-100', 'bg-slate-200', 'dark:bg-slate-800/30', 'dark:bg-slate-700/50',
    'bg-red-50', 'bg-red-100', 'bg-red-200', 'dark:bg-red-900/30', 'dark:bg-red-800/50',
    'bg-orange-50', 'bg-orange-100', 'bg-orange-200', 'dark:bg-orange-900/30', 'dark:bg-orange-800/50',
    'from-purple-50', 'to-purple-200', 'dark:from-purple-900/30', 'dark:to-purple-800/50',
    'from-green-50', 'to-green-200', 'dark:from-green-900/30', 'dark:to-green-800/50',
    'from-blue-50', 'to-blue-200', 'dark:from-blue-900/30', 'dark:to-blue-800/50',
    'from-slate-50', 'to-slate-200', 'dark:from-slate-800/30', 'dark:to-slate-700/50',
    'from-red-50', 'to-red-200', 'dark:from-red-900/30', 'dark:to-red-800/50',
    'from-orange-50', 'to-orange-200', 'dark:from-orange-900/30', 'dark:to-orange-800/50',
    // Settings color picker classes
    'bg-purple-600', 'bg-green-600', 'bg-blue-600', 'bg-slate-600', 'bg-red-600', 'bg-orange-600',
    'bg-purple-100', 'bg-green-100', 'bg-blue-100', 'bg-slate-100', 'bg-red-100', 'bg-orange-100',
    // Dynamic gradient classes for planning components
    'from-purple-600', 'to-purple-600', 'from-green-600', 'to-green-600', 'from-blue-600', 'to-blue-600',
    'from-slate-600', 'to-slate-600', 'from-red-600', 'to-red-600', 'from-orange-600', 'to-orange-600',
    'from-slate-500', 'to-slate-500', 'from-slate-700', 'to-slate-700', 'from-slate-800', 'to-slate-800',
    // Dark mode primary colors for header logo
    'dark:to-purple-500', 'dark:to-green-500', 'dark:to-blue-500', 'dark:to-slate-500', 'dark:to-red-500', 'dark:to-orange-500',
    // Vision component gradient classes
    'to-green-50/40', 'to-blue-50/40', 'to-slate-50/40', 'to-red-50/40', 'to-orange-50/40', 'to-purple-50/40',
    'dark:to-green-900/40', 'dark:to-blue-900/40', 'dark:to-slate-900/40', 'dark:to-red-900/40', 'dark:to-orange-900/40', 'dark:to-purple-900/40',
    'to-green-50/20', 'to-blue-50/20', 'to-slate-50/20', 'to-red-50/20', 'to-orange-50/20', 'to-purple-50/20',
    'dark:to-green-800/20', 'dark:to-blue-800/20', 'dark:to-slate-800/20', 'dark:to-red-800/20', 'dark:to-orange-800/20', 'dark:to-purple-800/20',
    // Additional dynamic classes for layout components
    'border-purple-200', 'border-green-200', 'border-blue-200', 'border-slate-200', 'border-red-200', 'border-orange-200',
    'text-purple-700', 'text-green-700', 'text-blue-700', 'text-slate-700', 'text-red-700', 'text-orange-700',
    'text-purple-600', 'text-green-600', 'text-blue-600', 'text-slate-600', 'text-red-600', 'text-orange-600',
    'hover:bg-purple-50', 'hover:bg-green-50', 'hover:bg-blue-50', 'hover:bg-slate-50', 'hover:bg-red-50', 'hover:bg-orange-50',
    'dark:hover:bg-purple-900/20', 'dark:hover:bg-green-900/20', 'dark:hover:bg-blue-900/20', 'dark:hover:bg-slate-900/20', 'dark:hover:bg-red-900/20', 'dark:hover:bg-orange-900/20',
    // Background colors for vision components
    'bg-purple-50/20', 'bg-green-50/20', 'bg-blue-50/20', 'bg-slate-50/20', 'bg-red-50/20', 'bg-orange-50/20',
    'dark:bg-purple-900/10', 'dark:bg-green-900/10', 'dark:bg-blue-900/10', 'dark:bg-slate-900/10', 'dark:bg-red-900/10', 'dark:bg-orange-900/10',
  ],
  theme: {
    extend: {
      screens: {
        'xs': '475px',
      },
      colors: {
        primary: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
          950: '#022c22',
        },
        silver: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
        lavender: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7c3aed',
          800: '#6b21a8',
          900: '#581c87',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'strong': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms')({
      strategy: 'class',
    }),
  ],
}
