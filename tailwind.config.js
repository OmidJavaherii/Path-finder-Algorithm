/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'grid-start': {
          DEFAULT: '#22c55e', // green-500
          dark: '#16a34a',    // green-600
        },
        'grid-end': {
          DEFAULT: '#ef4444', // red-500
          dark: '#dc2626',    // red-600
        },
        'grid-wall': {
          DEFAULT: '#1e293b', // slate-800
          dark: '#0f172a',    // slate-900
        },
        'grid-path': {
          DEFAULT: '#3b82f6', // blue-500
          dark: '#2563eb',    // blue-600
        },
        'grid-visited': {
          DEFAULT: '#94a3b8', // slate-400
          dark: '#64748b',    // slate-500
        },
      },
    },
  },
  plugins: [],
} 