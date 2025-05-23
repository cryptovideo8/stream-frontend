import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
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