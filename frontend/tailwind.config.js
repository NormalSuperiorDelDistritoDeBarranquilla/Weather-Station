/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: '#07111f',
        panel: '#0b1528',
        line: '#1d3558',
        neon: '#22d3ee',
        mint: '#34d399',
        violet: '#7c3aed',
        glow: '#0ea5e9',
      },
      boxShadow: {
        panel: '0 22px 70px rgba(5, 12, 27, 0.45)',
        neon: '0 0 0 1px rgba(34, 211, 238, 0.15), 0 16px 40px rgba(14, 165, 233, 0.22)',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        sans: ['Manrope', 'sans-serif'],
      },
      backgroundImage: {
        mesh:
          'radial-gradient(circle at top left, rgba(34, 211, 238, 0.18), transparent 35%), radial-gradient(circle at top right, rgba(124, 58, 237, 0.16), transparent 32%), linear-gradient(180deg, rgba(7,17,31,0.98) 0%, rgba(4,10,20,1) 100%)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 0 1px rgba(34,211,238,0.12), 0 12px 34px rgba(14,165,233,0.16)' },
          '50%': { boxShadow: '0 0 0 1px rgba(52,211,153,0.18), 0 18px 48px rgba(52,211,153,0.22)' },
        },
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
