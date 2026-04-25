/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: 'var(--brand)',    // 對應 globals.css 的 --brand
          soft: 'var(--brand-soft)',  // 對應 --brand-soft
          orange:     '#EA580C',
          orange500:  '#F97316',
          orangeSoft: '#FFF1E6',
        },
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        overlay: 'var(--overlay)',
        card: 'var(--card)',
        border: 'var(--border)',
        ink: {
          DEFAULT: 'var(--ink)',
          2: 'var(--ink2)',
          3: 'var(--ink3)',
        }
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        lg: 'var(--shadow-lg)',
      },
      fontFamily: {
        sans:  ['Geist', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['Instrument Serif', 'ui-serif', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}
