import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: ["class"],
    content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		colors: {
  			// Heritage Color Palette
  			primary: {
  				50: '#fef2f2',
  				100: '#fee2e2',
  				200: '#fecaca',
  				300: '#fca5a5',
  				400: '#f87171',
  				500: '#dc2626', // Deep Maroon
  				600: '#b91c1c',
  				700: '#991b1b',
  				800: '#7f1d1d',
  				900: '#450a0a',
  			},
  			accent: {
  				50: '#fefce8',
  				100: '#fef9c3',
  				200: '#fef08a',
  				300: '#fde047',
  				400: '#facc15',
  				500: '#d97706', // Heritage Gold
  				600: '#b45309',
  				700: '#92400e',
  				800: '#78350f',
  				900: '#451a03',
  			},
  			heritage: {
  				50: '#fdf8f6',
  				100: '#f2e8e5',
  				200: '#eaddd7',
  				300: '#e0cec7',
  				400: '#d2bab0',
  				500: '#bfa094', // Earthy Beige
  				600: '#a18072',
  				700: '#977669',
  				800: '#846358',
  				900: '#43302b',
  			},
  			background: {
  				light: '#fafaf9',
  				dark: '#18181b',
  				cream: '#fefcf8',
  			},
  			card: '#ffffff',
  			muted: '#6b7280',
  			text: {
  				primary: '#1f2937',
  				secondary: '#4b5563',
  				muted: '#9ca3af',
  			},
  		},
  		animation: {
  			'fade-in': 'fadeIn 0.6s ease-out',
  			'slide-up': 'slideUp 0.4s ease-out',
  			'slide-down': 'slideDown 0.4s ease-out',
  			'glow': 'glow 2s ease-in-out infinite alternate',
  			'float': 'float 3s ease-in-out infinite',
  			'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
  		},
  		keyframes: {
  			fadeIn: {
  				'0%': {
  					opacity: '0',
  					transform: 'translateY(20px)'
  				},
  				'100%': {
  					opacity: '1',
  					transform: 'translateY(0)'
  				}
  			},
  			slideUp: {
  				'0%': {
  					transform: 'translateY(30px)',
  					opacity: '0'
  				},
  				'100%': {
  					transform: 'translateY(0)',
  					opacity: '1'
  				}
  			},
  			slideDown: {
  				'0%': {
  					transform: 'translateY(-30px)',
  					opacity: '0'
  				},
  				'100%': {
  					transform: 'translateY(0)',
  					opacity: '1'
  				}
  			},
  			glow: {
  				'0%': {
  					boxShadow: '0 0 5px #d97706, 0 0 10px #d97706, 0 0 15px #d97706'
  				},
  				'100%': {
  					boxShadow: '0 0 10px #d97706, 0 0 20px #d97706, 0 0 30px #d97706'
  				}
  			},
  			float: {
  				'0%, 100%': {
  					transform: 'translateY(0px)'
  				},
  				'50%': {
  					transform: 'translateY(-10px)'
  				}
  			}
  		},
  		borderRadius: {
      '4xl': '2rem',
      '5xl': '2.5rem',
  		},
  		fontFamily: {
      display: ['Playfair Display', 'Georgia', 'serif'],
      body: ['Inter', 'system-ui', 'sans-serif'],
      accent: ['Caveat', 'cursive'],
      serif: ['DM Serif Display', 'Playfair Display', 'serif'],
  		},
  		spacing: {
  			'18': '4.5rem',
  			'88': '22rem',
  			'128': '32rem',
  		},
  		backgroundImage: {
  			'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
  			'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
  			'hero-pattern': "url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23d97706\" fill-opacity=\"0.05\"%3E%3Ccircle cx=\"30\" cy=\"30\" r=\"2\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')",
  		}
  	}
  },
  plugins: [
    require("tailwindcss-animate")
  ],
};

export default config; 