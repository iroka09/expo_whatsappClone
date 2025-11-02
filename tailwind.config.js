
/** @type {import('tailwindcss').Config} */

const {
  paddingHorizontal,
  colors: {
    themes: {
      light: {
        primary,
        secondary: secondary,
        background
      },
      dark: {
        primary: dark_primary,
        secondary: dark_secondary,
        background: dark_background
      }
    }
  }
} = require("./src/data/constants.json")




module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/components/**/*.{js,jsx,ts,tsx}",
    "./src/data/constants.json"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: primary,
          dark: dark_primary
        },
        secondary: {
          DEFAULT: secondary,
          dark: dark_secondary
        },
        theme: {
          DEFAULT: background,
          dark: dark_background
        }
      },
    },
  },
  plugins: [],
}