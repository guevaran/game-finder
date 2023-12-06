/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./app.vue",
    "./error.vue",
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#FCA311',
        'background': '#14213d',
        'text': '#E2E9FA',
        // '': '#E2E9FA',
        'secondary': '#5d4c65',
        'accent': '#dc2954',
      },
    },
  },
  plugins: [],
}

