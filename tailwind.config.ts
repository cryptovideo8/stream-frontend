import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    screens: {
      xs: '480px',
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'glow-red': '0 0 20px rgba(227,0,0,0.35), 0 0 40px rgba(227,0,0,0.15)',
        'glow-red-lg': '0 0 30px rgba(227,0,0,0.5), 0 0 60px rgba(227,0,0,0.2)',
        'glow-sm': '0 0 12px rgba(227,0,0,0.2)',
        'glow-green': '0 0 12px rgba(34,197,94,0.25)',
        card: 'var(--shadow-card)',
        'card-hover': 'var(--shadow-card-hover)',
        header: 'var(--shadow-header)',
        'bottom-nav': 'var(--shadow-bottom-nav)',
        'input-focus': '0 0 0 3px rgba(227,0,0,0.2)',
      },
      backgroundImage: {
        'gradient-red': 'linear-gradient(135deg, #E30000 0%, #FF3333 100%)',
        'gradient-red-v': 'linear-gradient(180deg, #E30000 0%, #CC0000 100%)',
        'gradient-dark': 'var(--gradient-dark)',
        'gradient-card': 'var(--gradient-card)',
        'gradient-hero': 'var(--gradient-hero)',
        'gradient-mesh':
          'radial-gradient(at 20% 20%, rgba(227,0,0,0.15) 0px, transparent 50%), radial-gradient(at 80% 80%, rgba(227,0,0,0.08) 0px, transparent 50%)',
        shimmer: 'var(--shimmer)',
      },
      animation: {
        shimmer: 'shimmer 2s infinite linear',
        'shimmer-slide': 'shimmerSlide 1.5s infinite linear',
        'fade-in': 'fadeIn 0.25s ease-out',
        'fade-in-up': 'fadeInUp 0.4s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
        'bounce-subtle': 'bounceSubtle 0.4s ease-out',
        float: 'float 6s ease-in-out infinite',
        'float-slow': 'float 10s ease-in-out infinite',
        progress: 'progress 1.5s ease-in-out infinite',
        'count-up': 'countUp 0.6s ease-out',
        wave: 'wave 2.5s ease-in-out infinite',
        'slide-in-bottom': 'slideInBottom 0.35s cubic-bezier(0.32, 0.72, 0, 1)',
        'slide-out-bottom': 'slideOutBottom 0.3s ease-in',
        'spin-slow': 'spin 3s linear infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'icon-press': 'iconPress 0.15s ease-out',
        'number-change': 'numberChange 0.3s ease-out',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-700px 0' },
          '100%': { backgroundPosition: '700px 0' },
        },
        shimmerSlide: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 8px rgba(227,0,0,0.4)' },
          '50%': { boxShadow: '0 0 20px rgba(227,0,0,0.7)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.75', transform: 'scale(1.05)' },
        },
        bounceSubtle: {
          '0%': { transform: 'scale(1)' },
          '40%': { transform: 'scale(0.92)' },
          '70%': { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        progress: {
          '0%': { transform: 'translateX(-100%)' },
          '50%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        countUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        wave: {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '20%': { transform: 'rotate(-20deg)' },
          '40%': { transform: 'rotate(20deg)' },
          '60%': { transform: 'rotate(-10deg)' },
          '80%': { transform: 'rotate(10deg)' },
        },
        slideInBottom: {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        slideOutBottom: {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(100%)' },
        },
        iconPress: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(0.85)' },
          '100%': { transform: 'scale(1)' },
        },
        numberChange: {
          '0%': { opacity: '0', transform: 'translateY(-6px) scale(1.1)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
      },
      colors: {
        white: '#FFFFFF',
        black: '#000000',

        red: {
          45: '#E30000',
          50: '#FF0000',
          55: '#FF1919',
          60: '#FF3333',
          80: '#FF9999',
          90: '#FFCCCC',
          95: '#FFE5E5',
          99: '#FFFAFA',
        },

        green: {
          45: '#16A34A',
          50: '#22C55E',
          55: '#4ADE80',
        },

        amber: {
          45: '#D97706',
          50: '#F59E0B',
          55: '#FCD34D',
        },

        // Theme-aware surface scale (name kept for existing class usage)
        dark: {
          6: 'rgb(var(--color-dark-6) / <alpha-value>)',
          8: 'rgb(var(--color-dark-8) / <alpha-value>)',
          10: 'rgb(var(--color-dark-10) / <alpha-value>)',
          12: 'rgb(var(--color-dark-12) / <alpha-value>)',
          15: 'rgb(var(--color-dark-15) / <alpha-value>)',
          20: 'rgb(var(--color-dark-20) / <alpha-value>)',
          25: 'rgb(var(--color-dark-25) / <alpha-value>)',
          30: 'rgb(var(--color-dark-30) / <alpha-value>)',
        },

        grey: {
          60: 'rgb(var(--color-grey-60) / <alpha-value>)',
          65: 'rgb(var(--color-grey-65) / <alpha-value>)',
          70: 'rgb(var(--color-grey-70) / <alpha-value>)',
          75: 'rgb(var(--color-grey-75) / <alpha-value>)',
          90: 'rgb(var(--color-grey-90) / <alpha-value>)',
          95: 'rgb(var(--color-grey-95) / <alpha-value>)',
          97: 'rgb(var(--color-grey-97) / <alpha-value>)',
          99: 'rgb(var(--color-grey-99) / <alpha-value>)',
        },
      },
      spacing: {
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-top': 'env(safe-area-inset-top)',
        'nav-bottom': '4rem',
      },
      backdropBlur: {
        xs: '2px',
        '2xl': '24px',
        '3xl': '40px',
      },
      transitionTimingFunction: {
        spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      backgroundColor: {
        primary: 'rgb(var(--color-dark-6) / <alpha-value>)',
        secondary: 'rgb(var(--color-dark-10) / <alpha-value>)',
        accent: '#E30000',
      },
      textColor: {
        primary: 'rgb(var(--color-fg) / <alpha-value>)',
        secondary: 'rgb(var(--color-grey-70) / <alpha-value>)',
        accent: '#FF3333',
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};

export default config;
