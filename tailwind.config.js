/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // use class strategy so we can control .dark via JS/localStorage
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./content/*.{md,mdx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/typography'), // 添加这行
  ],
}