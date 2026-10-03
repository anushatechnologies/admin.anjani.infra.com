const path = require('path');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    path.join(__dirname, 'pages/**/*.{js,ts,jsx,tsx,mdx}'),
    path.join(__dirname, 'components/**/*.{js,ts,jsx,tsx,mdx}'),
    path.join(__dirname, 'app/**/*.{js,ts,jsx,tsx,mdx}'),
  ],
  theme: {
    extend: {
      colors: {
        anj: {
          linen:     '#F6F4EE',
          ivory:     '#FCF9EB',
          navy:      '#2B5573',
          navydark:  '#1A374D',
          charcoal:  '#383735',
          dark:      '#1C1B1A',
          gold:      '#C5A059',
          goldlight: '#DFBA73',
          border:    '#BFBFBF',
          card:      '#ECE9DF',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
