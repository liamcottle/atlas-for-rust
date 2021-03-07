const colors = require('tailwindcss/colors')

module.exports = {
  purge: { content: ['./public/**/*.html', './src/**/*.vue'] },
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        primary: colors.blueGray,
        info: colors.gray,
        error: colors.red,
        'rust-team-member-online': '#A6EA33',
        'rust-team-member-offline': '#686B6B',
        'rust-team-member-dead': '#CD412B',
      }
    },
    zIndex: {
      'vending-machine-contents': 998,
      'bottom-bar': 999,
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
