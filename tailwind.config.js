/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}', './stories/**/*.stories.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'primary-800': '#0A2FB6',
        'primary-500': '#365ff5',
        'blue-antd': '#4096ff'
      },
      boxShadow: {
        custom: '0 0 0 1px #0A2FB6',
        error: '0 0 0 1px #ff4d4f'
      },
      backgroundImage: {
        'radial-custom':
          'radial-gradient(100% 100% at 91.87% 0%, rgb(251, 235, 235) 3.29%, rgb(249, 250, 251) 9.64%, rgb(249, 250, 251) 100%)'
      }
    },
    keyframes: {
      fadeIn: {
        '0%': { opacity: '0' },
        '100%': { opacity: '1' }
      },
      slideUp: {
        '0%': { transform: 'translateY(20px)' },
        '100%': { transform: 'translateY(0)' }
      }
    },
    animation: {
      fadeIn: 'fadeIn 0.5s ease-in-out',
      slideUp: 'slideUp 0.5s ease-in-out'
    }
  },
  plugins: []
}
