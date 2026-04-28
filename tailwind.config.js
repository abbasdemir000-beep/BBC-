/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#fdf6f0',
          100: '#faeade',
          200: '#f0c9ab',
          300: '#e4a07a',
          400: '#d4834f',
          500: '#c2714f',
          600: '#a85535',
          700: '#8a3e22',
          800: '#6b2e18',
          900: '#4a1e0e',
          950: '#2a0e06',
        },
        paper: {
          parchment: '#faf6f0',
          cream:     '#f5ede2',
          warm:      '#fffdf9',
          espresso:  '#1a0f08',
          dark:      '#261408',
        },
        gold: {
          light: '#f0c860',
          DEFAULT: '#d4a853',
          dark:  '#b8873a',
        },
        neon: {
          blue:   '#38bdf8',
          purple: '#a78bfa',
          pink:   '#f472b6',
          green:  '#34d399',
          gold:   '#d4a853',
          orange: '#c2714f',
        },
      },
      fontFamily: {
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
      },
      backgroundImage: {
        'paper-gradient':     'linear-gradient(135deg, #c2714f 0%, #d4a853 50%, #a85535 100%)',
        'paper-dark':        'linear-gradient(135deg, #1a0f08 0%, #261408 100%)',
        'card-gradient':     'linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
        'gold-gradient':     'linear-gradient(135deg, #d4a853 0%, #f0c860 50%, #b8873a 100%)',
        'terracotta-gradient':'linear-gradient(135deg, #c2714f 0%, #a85535 100%)',
        'hero-light':        'radial-gradient(ellipse at 30% 20%, rgba(194,113,79,0.12) 0%, transparent 60%), radial-gradient(ellipse at 70% 80%, rgba(212,168,83,0.08) 0%, transparent 60%)',
        'hero-dark':         'radial-gradient(ellipse at 30% 20%, rgba(232,149,109,0.20) 0%, transparent 60%), radial-gradient(ellipse at 70% 80%, rgba(212,168,83,0.14) 0%, transparent 60%)',
      },
      boxShadow: {
        'paper':          '0 0 0 1px rgba(194,113,79,0.18), 0 25px 50px -12px rgba(92,61,46,0.2)',
        'paper-hover':    '0 0 0 1px rgba(194,113,79,0.4), 0 0 30px rgba(194,113,79,0.15), 0 25px 50px -12px rgba(92,61,46,0.3)',
        'neon-blue':      '0 0 20px rgba(56,189,248,0.4), 0 0 60px rgba(56,189,248,0.15)',
        'neon-gold':      '0 0 20px rgba(212,168,83,0.4), 0 0 60px rgba(212,168,83,0.15)',
        'neon-terra':     '0 0 20px rgba(194,113,79,0.4), 0 0 60px rgba(194,113,79,0.15)',
        'glass-light':    '0 8px 32px rgba(92,61,46,0.08), 0 2px 8px rgba(92,61,46,0.04), inset 0 1px 0 rgba(255,255,255,0.9)',
        'glass-dark':     '0 8px 32px rgba(0,0,0,0.6), 0 2px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)',
        'card-light':     '0 4px 24px rgba(194,113,79,0.07), 0 1px 4px rgba(92,61,46,0.05)',
        'card-dark':      '0 4px 24px rgba(0,0,0,0.5), 0 1px 4px rgba(0,0,0,0.3)',
        'btn-primary':    '0 4px 15px rgba(194,113,79,0.4), 0 2px 4px rgba(194,113,79,0.2)',
        'btn-hover':      '0 8px 25px rgba(194,113,79,0.5), 0 4px 8px rgba(194,113,79,0.3)',
        'inner-glow':     'inset 0 1px 0 rgba(255,255,255,0.1)',
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'pulse-slow':    'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-in':      'slideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-up':      'slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        'fade-in':       'fadeIn 0.25s ease-out',
        'glow-pulse':    'glowPulse 2.5s ease-in-out infinite',
        'shimmer':       'shimmer 2.5s linear infinite',
        'float':         'float 6s ease-in-out infinite',
        'scale-in':      'scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        slideIn: {
          '0%':   { transform: 'translateX(-16px)', opacity: '0' },
          '100%': { transform: 'translateX(0)',     opacity: '1' },
        },
        slideUp: {
          '0%':   { transform: 'translateY(16px)', opacity: '0' },
          '100%': { transform: 'translateY(0)',    opacity: '1' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%':   { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)',    opacity: '1' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(99,102,241,0.3)' },
          '50%':      { boxShadow: '0 0 40px rgba(99,102,241,0.6), 0 0 80px rgba(99,102,241,0.2)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-8px)' },
        },
      },
    },
  },
  plugins: [],
};
