import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        stan: '#FF007A',
        botfarm: '#00FF41',
        outraged: '#FF4500',
        journalist: '#FBBF24',
        normie: '#888888',
        cloutchaser: '#A855F7',
        replyguy: '#06B6D4',
        ironypoisoned: '#84CC16',
        maincharacter: '#F97316',
        ratiovulture: '#EF4444',
        tonepolice: '#E2E8F0',
        contextualizer: '#10B981',
        bg: '#0a0a0a',
      },
      fontFamily: {
        mono: ['IBM Plex Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}

export default config
