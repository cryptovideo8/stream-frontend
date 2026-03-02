import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'glow-red': '0 0 20px rgba(227,0,0,0.35), 0 0 40px rgba(227,0,0,0.15)',
        'glow-sm': '0 0 12px rgba(227,0,0,0.2)',
        'card': '0 4px 24px rgba(0,0,0,0.4)',
        'header': '0 1px 0 rgba(255,255,255,0.06), 0 8px 32px rgba(0,0,0,0.5)',
      },
      backgroundImage: {
        'gradient-red': 'linear-gradient(135deg, #E30000 0%, #FF3333 100%)',
        'gradient-dark': 'linear-gradient(180deg, #1A1A1A 0%, #0F0F0F 100%)',
        'gradient-card': 'linear-gradient(135deg, #1F1F1F 0%, #1A1A1A 100%)',
        'gradient-hero': 'linear-gradient(to right, rgba(15,15,15,0.98), rgba(15,15,15,0.3))',
      },
      animation: {
        'shimmer': 'shimmer 2s infinite linear',
        'fade-in': 'fadeIn 0.25s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-700px 0' },
          '100%': { backgroundPosition: '700px 0' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
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
      backgroundColor: {
        primary: '#0F0F0F',    // Dark background
        secondary: '#1A1A1A',  // Slightly lighter dark
        accent: '#E30000',     // Primary red
      },
      textColor: {
        primary: '#FFFFFF',    // White text
        secondary: '#B3B3B3',  // Grey text
        accent: '#FF3333',     // Light red
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
};

export default config; 