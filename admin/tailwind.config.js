/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx,css}",
    "./src/**/*.css",
  ],
  theme: {
    extend: {
      colors: {
        'bg-primary': '#fbfbfa',
        'bg-secondary': '#f5f5f2',
        'bg-tertiary': '#ededeb',
        'bg-card': '#ffffff',
        'surface': '#ffffff',
        'surface-hover': '#fafafa',
        'border': '#e3e3df',
        'border-hover': '#c7c7c0',
        'accent': '#244235',
        'accent-light': '#3b6653',
        'accent-dark': '#182d24',
        'cyan': '#4c5851',
        'cyan-light': '#67766d',
        'text-primary': '#1c1c1c',
        'text-secondary': '#4a4a4a',
        'text-muted': '#787875',
        'green': '#2d5e3f',
        'amber': '#c27c00',
        'blue': '#2b5797',
        'rose': '#a32a3f',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Lora', 'serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
