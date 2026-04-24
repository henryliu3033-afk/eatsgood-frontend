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
          orange:     '#EA580C',
          orange500:  '#F97316',
          orangeSoft: '#FFF1E6',
          bg:         '#FAF7F2',
          ink:        '#1A0F08',
          ink2:       '#5B4E45',
          ink3:       '#9A8D83',
        },
      },
      fontFamily: {
        sans:  ['Geist', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['Instrument Serif', 'ui-serif', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}
