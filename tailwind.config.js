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
          100: '#faeadc',
          200: '#f0d0b0',
          300: '#e4b080',
          400: '#d4915a',
          500: '#c2714f',
          600: '#a85a3a',
          700: '#8b4513',
          800: '#6b3310',
          900: '#4a220a',
          950: '#2d1508',
        },
        paper: {
          cream:    '#fffcf7',
          parchment:'#faf6f0',
          aged:     '#f2e8d9',
          warm:     '#f5ede0',
          border:   '#d4b896',
          espresso: '#1a0f08',
          sepia:    '#2e1c0e',
          brown:    '#6b4c2a',
        },
        neon: {
          blue:   '#38bdf8',
          green:  '#34d399',
          gold:   '#d4a853',
          orange: '#e8956d',
          red:    '#f87171',
        },
      },
      fontFamily: {
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
      },
      backgroundImage: {
        'italy-gradient':   'linear-gradient(135deg, #c2714f 0%, #d4a853 100%)',
        'paper-gradient':   'linear-gradient(135deg, #faf6f0 0%, #f2e8d9 100%)',
        'card-gradient':    'linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
        'gold-gradient':    'linear-gradient(135deg, #d4a853 0%, #f0c97a 50%, #c2714f 100%)',
        'emerald-gradient': 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
        'hero-light':       'radial-gradient(ellipse at 30% 20%, rgba(194,113,79,0.12) 0%, transparent 60%), radial-gradient(ellipse at 70% 80%, rgba(212,168,83,0.08) 0%, transparent 60%)',
        'hero-dark':        'radial-gradient(ellipse at 30% 20%, rgba(194,113,79,0.22) 0%, transparent 60%), radial-gradient(ellipse at 70% 80%, rgba(212,168,83,0.15) 0%, transparent 60%)',
      },
      boxShadow: {
        'warm':         '0 0 0 1px rgba(194,113,79,0.2), 0 25px 50px -12px rgba(139,90,43,0.3)',
        'warm-hover':   '0 0 0 1px rgba(194,113,79,0.5), 0 0 30px rgba(194,113,79,0.2), 0 25px 50px -12px rgba(139,90,43,0.4)',
        'neon-gold':    '0 0 20px rgba(212,168,83,0.4), 0 0 60px rgba(212,168,83,0.15)',
        'neon-terra':   '0 0 20px rgba(194,113,79,0.4), 0 0 60px rgba(194,113,79,0.15)',
        'glass-light':  '0 8px 32px rgba(139,90,43,0.08), 0 2px 8px rgba(139,90,43,0.04), inset 0 1px 0 rgba(255,255,255,0.9)',
        'glass-dark':   '0 8px 32px rgba(0,0,0,0.6), 0 2px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)',
        'card-light':   '0 4px 24px rgba(194,113,79,0.08), 0 1px 4px rgba(139,90,43,0.04)',
        'card-dark':    '0 4px 24px rgba(0,0,0,0.5), 0 1px 4px rgba(0,0,0,0.3)',
        'btn-primary':  '0 4px 15px rgba(194,113,79,0.4), 0 2px 4px rgba(194,113,79,0.2)',
        'btn-hover':    '0 8px 25px rgba(194,113,79,0.5), 0 4px 8px rgba(194,113,79,0.3)',
        'inner-glow':   'inset 0 1px 0 rgba(255,255,255,0.1)',
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-in':   'slideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-up':   'slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        'fade-in':    'fadeIn 0.25s ease-out',
        'glow-pulse': 'glowPulse 2.5s ease-in-out infinite',
        'shimmer':    'shimmer 2.5s linear infinite',
        'float':      'float 6s ease-in-out infinite',
        'scale-in':   'scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
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
          '0%, 100%': { boxShadow: '0 0 20px rgba(194,113,79,0.3)' },
          '50%':      { boxShadow: '0 0 40px rgba(194,113,79,0.6), 0 0 80px rgba(212,168,83,0.2)' },
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
