module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      boxShadow: {
        soft: '0 25px 80px rgba(15, 23, 42, 0.35)',
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
}
