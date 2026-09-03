/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#FFF6F0',
        blush: '#F6A6B4',
        rosy: '#E97B92',
        peach: '#FBD3C4',
        matcha: '#BFD8B8',
        butter: '#FBE9C8',
        cocoa: '#5C4A45',
        cocoaSoft: '#8A726C',
      },
      fontFamily: {
        display: ['"ZCOOL KuaiLe"', '"Baloo 2"', 'cursive'],
        body: ['Nunito', '"PingFang SC"', '"Hiragino Sans GB"', '"Microsoft YaHei"', 'sans-serif'],
      },
      boxShadow: {
        card: '0 6px 20px -6px rgba(233, 123, 146, 0.25)',
        soft: '0 2px 12px -2px rgba(92, 74, 69, 0.12)',
      },
      borderRadius: {
        card: '1.5rem',
      },
      keyframes: {
        floatIn: {
          '0%': { opacity: '0', transform: 'translateY(10px) scale(0.97)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        pop: {
          '0%': { transform: 'scale(0.6)' },
          '60%': { transform: 'scale(1.1)' },
          '100%': { transform: 'scale(1)' },
        },
      },
      animation: {
        floatIn: 'floatIn 0.4s ease-out both',
        pop: 'pop 0.3s ease-out both',
      },
    },
  },
  plugins: [],
}
