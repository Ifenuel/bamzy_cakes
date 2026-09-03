/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        lilac: {
          deep: '#6F4AA8',
          DEFAULT: '#A97BD6',
          soft: '#EDE1F8',
          50: '#F8F4FD',
        },
        pink: {
          DEFAULT: '#F04B8A',
          soft: '#FBD7E7',
          light: '#FFF4F8',
          50: '#FFF5F9',
        },
        cream: {
          DEFAULT: '#FFF8F0',
          warm: '#FFF3E4',
          deep: '#FFE8CC',
        },
        gold: {
          DEFAULT: '#D4A853',
          soft: '#F5E6C8',
        },
        lavender: {
          DEFAULT: '#C4B1D9',
          soft: '#E8DFF0',
        },
        ink: {
          DEFAULT: '#24172F',
          muted: '#756B7E',
          light: '#A39BA9',
        },
        success: { DEFAULT: '#22C55E', soft: '#DCFCE7' },
        warning: { DEFAULT: '#F59E0B', soft: '#FEF3C7' },
        error: { DEFAULT: '#EF4444', soft: '#FEE2E2' },
        info: { DEFAULT: '#3B82F6', soft: '#DBEAFE' },
      },
      fontFamily: {
        heading: ['"Playfair Display"', 'Georgia', 'serif'],
        body: ['"Inter"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #A97BD6 0%, #F04B8A 100%)',
        'brand-gradient-soft': 'linear-gradient(135deg, #EDE1F8 0%, #FBD7E7 100%)',
        'brand-gradient-deep': 'linear-gradient(135deg, #6F4AA8 0%, #F04B8A 100%)',
        'brand-gradient-subtle': 'linear-gradient(135deg, #F8F4FD 0%, #FFF5F9 100%)',
        'warm-gradient': 'linear-gradient(135deg, #FFF8F0 0%, #FBD7E7 50%, #EDE1F8 100%)',
        'cream-gradient': 'linear-gradient(180deg, #FFF8F0 0%, #FFFFFF 100%)',
        'lilac-gradient': 'linear-gradient(135deg, #EDE1F8 0%, #C4B1D9 100%)',
      },
      boxShadow: {
        'xs': '0 1px 2px rgba(36, 23, 47, 0.05)',
        'soft': '0 4px 24px -4px rgba(111, 74, 168, 0.12)',
        'card': '0 8px 30px -8px rgba(240, 75, 138, 0.15)',
        'elevated': '0 20px 50px -12px rgba(111, 74, 168, 0.2)',
        'glow': '0 0 40px -10px rgba(169, 123, 214, 0.3)',
        'glow-pink': '0 0 40px -10px rgba(240, 75, 138, 0.3)',
      },
      borderRadius: {
        'xl2': '1rem',
        'xl3': '1.5rem',
        '2xl': '1.25rem',
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: 0, transform: 'translateY(16px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        scaleIn: {
          '0%': { opacity: 0, transform: 'scale(0.95)' },
          '100%': { opacity: 1, transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        countUp: {
          '0%': { opacity: 0, transform: 'translateY(8px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-up': 'fadeUp 0.6s ease-out forwards',
        'fade-in': 'fadeIn 0.4s ease-out forwards',
        'scale-in': 'scaleIn 0.4s ease-out forwards',
        'shimmer': 'shimmer 2s infinite linear',
        'count-up': 'countUp 0.5s ease-out forwards',
      },
    },
  },
  plugins: [],
}
