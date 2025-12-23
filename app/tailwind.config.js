/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: {
                    DEFAULT: '#050505',
                    deep: '#050505',
                    glass: 'rgba(5, 5, 5, 0.7)',
                },
                neon: {
                    cyan: '#00f3ff',
                    magenta: '#ff00ff',
                    green: '#0aff00',
                },
                surface: {
                    DEFAULT: '#1a1a1a',
                    hover: '#2a2a2a',
                }
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                mono: ['JetBrains Mono', 'monospace'],
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
            },
            boxShadow: {
                neonCyan: '0 0 15px rgba(0,243,255,0.5)',
                neonMagenta: '0 0 15px rgba(255,0,255,0.5)',
                neonGreen: '0 0 15px rgba(10,255,0,0.5)',
            },
            backdropBlur: {
                xs: '2px',
                sm: '8px',
                md: '12px',
                lg: '16px',
                xl: '24px',
            },
            keyframes: {
                pulseNeon: {
                    '0%, 100%': { boxShadow: '0 0 15px rgba(0,243,255,0.4)' },
                    '50%': { boxShadow: '0 0 25px rgba(0,243,255,0.6)' },
                },
            },
            animation: {
                pulseNeon: 'pulseNeon 2s infinite',
            }
        },
    },
    darkMode: 'class', // Ultra Dark Mode control
    plugins: [],
}
