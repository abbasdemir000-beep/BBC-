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
          50:  '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        cinema: {
          black:  '#05050a',
          deep:   '#080d1a',
          navy:   '#0d1528',
          card:   '#111827',
          border: '#1e2d45',
          muted:  '#2a3a52',
          text:   '#94a3b8',
          bright: '#e2e8f0',
        },
        neon: {
          blue:   '#38bdf8',
          purple: '#a78bfa',
          pink:   '#f472b6',
          green:  '#34d399',
          gold:   '#fbbf24',
          orange: '#fb923c',
        },
      },
      fontFamily: {
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
      },
      backgroundImage: {
        'cinema-gradient':    'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)',
        'cinema-dark':        'linear-gradient(135deg, #05050a 0%, #0d1528 100%)',
        'card-gradient':      'linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
        'gold-gradient':      'linear-gradient(135deg, #f59e0b 0%, #fbbf24 50%, #f97316 100%)',
        'emerald-gradient':   'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
        'hero-light':         'radial-gradient(ellipse at 30% 20%, rgba(99,102,241,0.15) 0%, transparent 60%), radial-gradient(ellipse at 70% 80%, rgba(139,92,246,0.10) 0%, transparent 60%)',
        'hero-dark':          'radial-gradient(ellipse at 30% 20%, rgba(99,102,241,0.25) 0%, transparent 60%), radial-gradient(ellipse at 70% 80%, rgba(139,92,246,0.20) 0%, transparent 60%)',
      },
      boxShadow: {
        'cinema':         '0 0 0 1px rgba(99,102,241,0.2), 0 25px 50px -12px rgba(0,0,0,0.4)',
        'cinema-hover':   '0 0 0 1px rgba(99,102,241,0.5), 0 0 30px rgba(99,102,241,0.2), 0 25px 50px -12px rgba(0,0,0,0.5)',
        'neon-blue':      '0 0 20px rgba(56,189,248,0.4), 0 0 60px rgba(56,189,248,0.15)',
        'neon-purple':    '0 0 20px rgba(167,139,250,0.4), 0 0 60px rgba(167,139,250,0.15)',
        'neon-gold':      '0 0 20px rgba(251,191,36,0.4), 0 0 60px rgba(251,191,36,0.15)',
        'glass-light':    '0 8px 32px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.9)',
        'glass-dark':     '0 8px 32px rgba(0,0,0,0.6), 0 2px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)',
        'card-light':     '0 4px 24px rgba(99,102,241,0.08), 0 1px 4px rgba(0,0,0,0.04)',
        'card-dark':      '0 4px 24px rgba(0,0,0,0.5), 0 1px 4px rgba(0,0,0,0.3)',
        'btn-primary':    '0 4px 15px rgba(99,102,241,0.4), 0 2px 4px rgba(99,102,241,0.2)',
        'btn-hover':      '0 8px 25px rgba(99,102,241,0.5), 0 4px 8px rgba(99,102,241,0.3)',
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
