/** @type {import('tailwindcss').Config} */
export default {
  content: [
      "./resources/**/*.blade.php",
      "./resources/**/*.js",
      "./resources/**/*.jsx",
      "./resources/**/*.vue",
  ],
    darkMode: 'class',
    theme: {
        fontFamily: {
            display: ['Work Sans', 'sans-serif'],
            body: ['Work Sans', 'sans-serif'],
        },
        extend: {
            fontSize: {
                14: '14px',
            },
            backgroundColor: {
                'main-bg': '#ffffff',
                'main-dark-bg': '#20232A',
                'secondary-dark-bg': '#33373E',
                'light-gray': '#F7F7F7',
                'half-transparent': 'rgba(243, 228, 228, 0.55)',
                'primary-theme-color': '#F3F4F6',
                'secondary-theme-color': '#ffffff',
                'sidebar-color' : '#1e293b',
            },
            borderWidth: {
                1: '1px',
            },
            borderColor: {
                color: 'rgba(0, 0, 0, 0.1)',
            },
            width: {
                400: '400px',
                760: '760px',
                780: '780px',
                800: '800px',
                1000: '1000px',
                1200: '1200px',
                1400: '1400px',
            },
            height: {
                80: '80px',
            },
            minHeight: {
                590: '590px',
            },
            backgroundImage: {
                'hero-pattern':
                    "url('https://i.ibb.co/MkvLDfb/Rectangle-4389.png')",
            },
        },
    },
  plugins: [],
}

