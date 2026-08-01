/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        mono: ['ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      colors: {
        phase: {
          prepare: '#FFE600',
          work:    '#AAEE00',
          rest:    '#FF3B30',
          cooldown:'#4A90E2',
          cycle:   '#FFE600',
        },
      },
    },
  },
  plugins: [],
}
