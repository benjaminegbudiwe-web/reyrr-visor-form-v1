import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        reyrr: {
          bg: '#0b0b0d',
          panel: '#121217',
          'panel-soft': '#17171d',
          'panel-strong': '#1d1d25',
          stroke: 'rgba(255, 255, 255, 0.1)',
          'stroke-strong': 'rgba(255, 255, 255, 0.18)',
          text: '#f7f7f8',
          'text-dim': '#c3c4cc',
          'text-soft': '#8f909a',
          flame: '#ff5a1f',
          'flame-soft': '#ff8a4c',
          gold: '#e8b04c',
          success: '#7dd3a0',
          violet: '#8b5cf6',
        },
      },
      fontFamily: {
        display: ['Archivo Black', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
