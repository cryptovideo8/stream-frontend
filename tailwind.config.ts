import type { Config } from 'tailwindcss';

const config: Config = {
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
        'card': '0 4px 24px rgba(0,0,0,0.4)',
        'card-hover': '0 8px 40px rgba(0,0,0,0.6)',
        'header': '0 1px 0 rgba(255,255,255,0.06), 0 8px 32px rgba(0,0,0,0.5)',
        'bottom-nav': '0 -1px 0 rgba(255,255,255,0.05), 0 -8px 32px rgba(0,0,0,0.5)',
        'input-focus': '0 0 0 3px rgba(227,0,0,0.2)',
      },
      backgroundImage: {
        'gradient-red': 'linear-gradient(135deg, #E30000 0%, #FF3333 100%)',
        'gradient-red-v': 'linear-gradient(180deg, #E30000 0%, #CC0000 100%)',
        'gradient-dark': 'linear-gradient(180deg, #1A1A1A 0%, #0F0F0F 100%)',
        'gradient-card': 'linear-gradient(135deg, #1F1F1F 0%, #1A1A1A 100%)',
        'gradient-hero': 'linear-gradient(to right, rgba(15,15,15,0.98), rgba(15,15,15,0.3))',
        'gradient-mesh': 'radial-gradient(at 20% 20%, rgba(227,0,0,0.15) 0px, transparent 50%), radial-gradient(at 80% 80%, rgba(227,0,0,0.08) 0px, transparent 50%)',
        'shimmer': 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.04) 50%, transparent 100%)',
      },
      animation: {
        'shimmer': 'shimmer 2s infinite linear',
        'shimmer-slide': 'shimmerSlide 1.5s infinite linear',
        'fade-in': 'fadeIn 0.25s ease-out',
        'fade-in-up': 'fadeInUp 0.4s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
        'bounce-subtle': 'bounceSubtle 0.4s ease-out',
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'float 10s ease-in-out infinite',
        'progress': 'progress 1.5s ease-in-out infinite',
        'count-up': 'countUp 0.6s ease-out',
        'wave': 'wave 2.5s ease-in-out infinite',
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
        // Absolute Colors
        white: '#FFFFFF',
        black: '#000000',

        // Red Shades
        red: {
          45: '#E30000',  // Primary red
          50: '#FF0000',
          55: '#FF1919',
          60: '#FF3333',
          80: '#FF9999',
          90: '#FFCCCC',
          95: '#FFE5E5',
          99: '#FFFAFA',
        },

        // Green (positive/like states)
        green: {
          45: '#16A34A',
          50: '#22C55E',
          55: '#4ADE80',
        },

        // Amber (premium/warning)
        amber: {
          45: '#D97706',
          50: '#F59E0B',
          55: '#FCD34D',
        },

        // Black Shades
        dark: {
          6: '#0F0F0F',
          8: '#141414',
          10: '#1A1A1A',
          12: '#1F1F1F',
          15: '#262626',
          20: '#333333',
          25: '#404040',
          30: '#4C4C4C',
        },

        // Grey Shades
        grey: {
          60: '#999999',
          65: '#A6A6A6',
          70: '#B3B3B3',
          75: '#BFBFBF',
          90: '#E4E4E7',
          95: '#F1F1F3',
          97: '#F7F7F8',
          99: '#FCFCFD',
        }
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
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      backgroundColor: {
        primary: '#0F0F0F',
        secondary: '#1A1A1A',
        accent: '#E30000',
      },
      textColor: {
        primary: '#FFFFFF',
        secondary: '#B3B3B3',
        accent: '#FF3333',
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
};

export default config;