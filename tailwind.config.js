/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/index.template.html",
    "./public/index.html",
    "./src/pages/**/*.html",
    "./src/components/**/*.tsx",
    "./src/**/*.js",
    "./public/assets/js/main.js"
  ],
  // preflight: false preserves existing style.css resets and prevent unintended overrides
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {
      colors: {
        brand: {
          white: 'var(--brand-white, #ffffff)',
          blue: 'var(--brand-blue, #8da9fb)',
          'blue-hover': 'var(--brand-blue-hover, #7496f7)',
          'blue-light': 'var(--brand-blue-light, rgba(141, 169, 251, 0.12))',
          lime: 'var(--brand-lime, #ccff00)',
          'lime-hover': 'var(--brand-lime-hover, #b8e600)',
          'lime-light': 'var(--brand-lime-light, rgba(204, 255, 0, 0.18))',
          dark: 'var(--brand-dark, #0f172a)',
        },
        primary: {
          DEFAULT: 'var(--primary-color, #8da9fb)',
          purple: 'var(--primary-purple, #8da9fb)',
          hover: 'var(--primary-purple-hover, #7496f7)',
          light: 'var(--primary-purple-light, rgba(141, 169, 251, 0.12))',
          active: 'var(--primary-purple-active, rgba(141, 169, 251, 0.22))',
        },
        bg: {
          main: 'var(--bg-main, #f1f4f8)',
          card: 'var(--bg-card, #ffffff)',
        },
        text: {
          main: 'var(--text-main, #0f172a)',
          muted: 'var(--text-muted, #64748b)',
          light: 'var(--text-light, #ffffff)',
        },
        border: 'var(--border-color, #e2e8f0)',
        accent: {
          blue: 'var(--accent-blue, #8da9fb)',
          'blue-light': 'var(--accent-blue-light, #f0f4ff)',
          red: 'var(--accent-red, #dc2626)',
          'red-light': 'var(--accent-red-light, #fef2f2)',
          orange: 'var(--accent-orange, #ea580c)',
          'orange-light': 'var(--accent-orange-light, #fff7ed)',
          yellow: 'var(--accent-yellow, #ca8a04)',
          'yellow-light': 'var(--accent-yellow-light, #fef3c7)',
          green: 'var(--accent-green, #10b981)',
          'green-light': 'var(--accent-green-light, #ecfdf5)',
        }
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'IBM Plex Sans Thai', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['var(--font-sans)', 'IBM Plex Sans Thai', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        border: 'var(--shadow-border)',
        'border-hover': 'var(--shadow-border-hover)',
        modal: 'var(--shadow-modal)',
        soft: 'var(--soft-shadow)',
        'soft-hover': 'var(--soft-shadow-hover)',
      },
      borderRadius: {
        xl: 'var(--border-radius-xl, 20px)',
        lg: 'var(--border-radius-lg, 16px)',
        md: 'var(--border-radius-md, 12px)',
        sm: 'var(--border-radius-sm, 8px)',
      }
    },
  },
  plugins: [],
}
