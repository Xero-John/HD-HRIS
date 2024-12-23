import {nextui} from '@nextui-org/theme';
import type { Config } from "tailwindcss"
import plugin from 'tailwindcss/plugin';

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        print: {raw: "print"},
        "2xl": "1400px",
      },
    },
    extend: {
      fontSize: {
        'xs': ['var(--font-size-xs)', { lineHeight: 'var(--line-height-xs)' }],
        'sm': ['var(--font-size-sm)', { lineHeight: 'var(--line-height-sm)' }],
        'base': ['var(--font-size-base)', { lineHeight: 'var(--line-height-base)' }],
        'lg': ['var(--font-size-lg)', { lineHeight: 'var(--line-height-lg)' }],
        'xl': ['var(--font-size-xl)', { lineHeight: 'var(--line-height-xl)' }],
        '2xl': ['var(--font-size-2xl)', { lineHeight: 'var(--line-height-2xl)' }],
        '3xl': ['var(--font-size-3xl)', { lineHeight: 'var(--line-height-3xl)' }],
        '4xl': ['var(--font-size-4xl)', { lineHeight: 'var(--line-height-4xl)' }],
        '5xl': ['var(--font-size-5xl)', { lineHeight: 'var(--line-height-5xl)' }],
        '6xl': ['var(--font-size-6xl)', { lineHeight: 'var(--line-height-6xl)' }],
        '7xl': ['var(--font-size-7xl)', { lineHeight: 'var(--line-height-7xl)' }],
        '8xl': ['var(--font-size-8xl)', { lineHeight: 'var(--line-height-8xl)' }],
        '9xl': ['var(--font-size-9xl)', { lineHeight: 'var(--line-height-9xl)' }],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },

        divider: '#64748b', // Added custom divider color
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },

    },
  },
  plugins: [
      nextui({
        addCommonColors: true,
        themes: {
          light: {
            colors: {
              // background: "#FFFFFF", // or DEFAULT
              // foreground: "#11181C", // or 50 to 900 DEFAULT
              primary: {
               600: "#0f172a",
              },
              secondary: {
               700: "#7828c8"
              },
              success: {
                700: "#17c964"
              },
              danger: {
                600: "#F31260"
              },
              warning: {
                700: "#f5a524"
              },

            }
          }
        },
    layout:{
      radius: {
        small: "0.125rem",
        medium: "0.375rem",
        large: "0.5rem",
      },
      dividerWeight: "1.5px",
      fontSize: {
        tiny: 'var(--font-size-xs)', // text-tiny
        small: 'var(--font-size-sm)', // text-small
        medium: 'var(--font-size-base)', // text-medium
        large: 'var(--font-size-lg)', // text-large
      },
    }
  }),
    require("tailwindcss-animate"),
  plugin(function ({ addUtilities }) {
    addUtilities({
      '.h-fit-navlayout': {
        height: 'calc(100vh - 165px)',
        overflowY: 'auto',
      },
      '.variant-blue': {
        backgroundColor: 'rgba(59, 130, 246)',
        foregroundColor: 'rgb(255,255,255)',
      }
    });
  }),],
} satisfies Config

export default config