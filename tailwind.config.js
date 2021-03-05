module.exports = {
  purge: { content: ['./public/**/*.html', './src/**/*.vue'] },
  darkMode: false, // or 'media' or 'class'
  theme: {
    zIndex: {
      'modal': 1000,
      'tooltip': 1001,
      'auto': 'auto',
    }
  },
  variants: {
    extend: {
      opacity: ['disabled'],
    },
  },
  plugins: [
      require('@tailwindcss/forms'),
  ],
}
