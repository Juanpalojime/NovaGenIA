/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Design Tokens based on Figma workspace
                brand: {
                    50: '#eef2ff',
                    100: '#e0e7ff',
                    200: '#c7d2fe',
                    300: '#a5b4fc',
                    400: '#818cf8',
                    500: '#6366f1', // Indigo 500
                    600: '#4f46e5',
                    700: '#4338ca',
                    800: '#3730a3',
                    900: '#312e81',
                    950: '#1e1b4b',
                },
                neutral: {
                    50: '#f9fafb',
                    100: '#f3f4f6', // Surface
                    200: '#e5e7eb',
                    300: '#d1d5db',
                    400: '#9ca3af',
                    500: '#6b7280',
                    600: '#4b5563',
                    700: '#374151',
                    800: '#1f2937',
                    900: '#111827',
                    950: '#030712', // Background
                },
                background: {
                    DEFAULT: '#030712',
                    deep: '#000000',
                    subtle: '#111827',
                },
                surface: {
                    DEFAULT: '#1f2937',
                    hover: '#374151',
                    active: '#4b5563',
                    glass: 'rgba(31, 41, 55, 0.7)',
                    'glass-light': 'rgba(255, 255, 255, 0.05)',
                },
                primary: {
                    DEFAULT: '#6366f1',
                    hover: '#4f46e5',
                    light: '#818cf8',
                    glow: 'rgba(99, 102, 241, 0.5)',
                },
                secondary: {
                    DEFAULT: '#ec4899',
                    hover: '#db2777',
                    glow: 'rgba(236, 72, 153, 0.5)',
                },
                accent: {
                    cyan: '#06b6d4',
                    violet: '#8b5cf6',
                    emerald: '#10b981',
                    amber: '#f59e0b',
                },
                border: {
                    DEFAULT: 'rgba(255, 255, 255, 0.1)',
                    hover: 'rgba(255, 255, 255, 0.2)',
                    strong: 'rgba(255, 255, 255, 0.3)',
                }
            },
            spacing: {
                'token-xs': '4px',
                'token-sm': '8px',
                'token-md': '16px',
                'token-lg': '24px',
                'token-xl': '32px',
                'token-2xl': '48px',
                'token-3xl': '64px',
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                mono: ['JetBrains Mono', 'monospace'],
                display: ['Outfit', 'sans-serif'],
            },
            backgroundImage: {
                'gradient-cosmic': 'linear-gradient(to right bottom, #6366f1, #a855f7, #ec4899)',
                'gradient-dark': 'linear-gradient(to bottom, #030712, #111827)',
                'gradient-glass': 'linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)',
                'gradient-mesh': 'radial-gradient(at 0% 0%, hsla(253,16%,7%,1) 0, transparent 50%), radial-gradient(at 50% 0%, hsla(225,39%,30%,1) 0, transparent 50%), radial-gradient(at 100% 0%, hsla(339,49%,30%,1) 0, transparent 50%)',
            },
            boxShadow: {
                'glow-primary': '0 0 20px rgba(99, 102, 241, 0.3)',
                'glow-secondary': '0 0 20px rgba(236, 72, 153, 0.3)',
                'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
                'inner-glass': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.1)',
            },
            backdropBlur: {
                xs: '2px',
                sm: '8px',
                md: '12px',
                lg: '16px',
                xl: '24px',
            },
            animation: {
                'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'float': 'float 6s ease-in-out infinite',
                'shimmer': 'shimmer 2s linear infinite',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
                shimmer: {
                    '0%': { backgroundPosition: '-200% 0' },
                    '100%': { backgroundPosition: '200% 0' },
                }
            },
            borderRadius: {
                'token': '12px',
                'token-lg': '20px',
                'token-full': '9999px',
            }
        },
    },
    darkMode: 'class',
    plugins: [],
}

