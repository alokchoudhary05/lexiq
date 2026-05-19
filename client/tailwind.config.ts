import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          primary:  '#0d0d0d',
          sidebar:  '#171717',
          surface:  '#1e1e1e',
          surface2: '#252525',
          surface3: '#2a2a2a',
        },
        gold: {
          DEFAULT: '#c9a84c',
          light:   '#e8c96d',
          dim:     '#a07830',
          faint:   'rgba(201,168,76,0.10)',
          border:  'rgba(201,168,76,0.22)',
        },
        navy: {
          DEFAULT: '#0a1628',
          mid:     '#112240',
          light:   '#1a3358',
        },
        domain: {
          bns:      '#60a5fa',
          crpc:     '#34d399',
          ipc:      '#f97316',
          ita:      '#fbbf24',
          itr:      '#fb7185',
          criminal: '#a78bfa',
          tax:      '#fbbf24',
          auto:     '#a78bfa',
        },
      },
      fontFamily: {
        sans:  ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Georgia', 'Times New Roman', 'serif'],
      },
      borderRadius: {
        sm:   '6px',
        md:   '8px',
        lg:   '12px',
        xl:   '16px',
        full: '9999px',
      },
    },
  },
  plugins: [],
}

export default config
