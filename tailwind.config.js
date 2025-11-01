/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./prototype/**/*.{html,js}",
    "./prototype/src/**/*.{html,js}",
  ],
  theme: {
    extend: {},
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: [
      {
        light: {
          ...require("daisyui/src/theming/themes")["light"],
          primary: "#4a90e2",
          secondary: "#64b5f6",
          accent: "#81c784",
          neutral: "#3d4451",
          "base-100": "#ffffff",
        },
      },
      "dark",
      "cupcake",
    ],
  },
}
