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
			// Hastkari Brand Color Palette - Authentic Indian Handloom
			primary: {
				50: '#fef7f7',
				100: '#fdeaea',
				200: '#fad5d5',
				300: '#f6b3b3',
				400: '#f08888',
				500: '#e85d5d', // Warm Terracotta - Handloom Red
				600: '#d63384',
				700: '#b91c1c',
				800: '#991b1b',
				900: '#7f1d1d',
			},
			accent: {
				50: '#fefce8',
				100: '#fef9c3',
				200: '#fef08a',
				300: '#fde047',
				400: '#facc15',
				500: '#d97706', // Heritage Gold - Saffron
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
				500: '#bfa094', // Earthy Beige - Natural Cotton
				600: '#a18072',
				700: '#977669',
				800: '#846358',
				900: '#43302b',
			},
			// New Hastkari-specific colors
			indigo: {
				50: '#f0f4ff',
				100: '#e0e7ff',
				200: '#c7d2fe',
				300: '#a5b4fc',
				400: '#818cf8',
				500: '#6366f1', // Royal Blue - Traditional Indigo
				600: '#4f46e5',
				700: '#4338ca',
				800: '#3730a3',
				900: '#312e81',
			},
			earth: {
				50: '#fafaf9',
				100: '#f5f5f4',
				200: '#e7e5e4',
				300: '#d6d3d1',
				400: '#a8a29e',
				500: '#78716c', // Earth Brown - Clay Pot
				600: '#57534e',
				700: '#44403c',
				800: '#292524',
				900: '#1c1917',
			},
  			background: {
  				light: '#fafaf9',
  				dark: '#0a0a0a',
  				cream: '#fefcf8',
  			},
  			card: {
  				light: '#ffffff',
  				dark: '#1a1a1a',
  			},
  			muted: {
  				light: '#6b7280',
  				dark: '#9ca3af',
  			},
  			text: {
  				primary: {
  					light: '#1f2937',
  					dark: '#f9fafb',
  				},
  				secondary: {
  					light: '#4b5563',
  					dark: '#d1d5db',
  				},
  				muted: {
  					light: '#9ca3af',
  					dark: '#6b7280',
  				},
  			},
  			// Dark theme specific colors
  			dark: {
  				bg: {
  					primary: '#0a0a0a',
  					secondary: '#1a1a1a',
  					tertiary: '#2a2a2a',
  					card: '#1a1a1a',
  					hover: '#2a2a2a',
  				},
  				text: {
  					primary: '#f9fafb',
  					secondary: '#d1d5db',
  					muted: '#9ca3af',
  					accent: '#d97706',
  				},
  				border: {
  					primary: '#374151',
  					secondary: '#4b5563',
  					accent: '#d97706',
  				},
  			},
  		},
		animation: {
			'fade-in': 'fadeIn 0.6s ease-out',
			'slide-up': 'slideUp 0.4s ease-out',
			'slide-down': 'slideDown 0.4s ease-out',
			'glow': 'glow 2s ease-in-out infinite alternate',
			'float': 'float 3s ease-in-out infinite',
			'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
			'handwoven': 'handwoven 4s ease-in-out infinite',
			'gentle-bounce': 'gentleBounce 2s ease-in-out infinite',
			'texture-shift': 'textureShift 6s ease-in-out infinite',
			'warm-glow': 'warmGlow 3s ease-in-out infinite alternate',
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
			},
			handwoven: {
				'0%, 100%': {
					transform: 'translateY(0px) rotate(0deg)',
					filter: 'brightness(1)'
				},
				'25%': {
					transform: 'translateY(-2px) rotate(0.5deg)',
					filter: 'brightness(1.02)'
				},
				'75%': {
					transform: 'translateY(1px) rotate(-0.3deg)',
					filter: 'brightness(0.98)'
				}
			},
			gentleBounce: {
				'0%, 100%': {
					transform: 'translateY(0px)',
					animationTimingFunction: 'cubic-bezier(0.8, 0, 1, 1)'
				},
				'50%': {
					transform: 'translateY(-5px)',
					animationTimingFunction: 'cubic-bezier(0, 0, 0.2, 1)'
				}
			},
			textureShift: {
				'0%, 100%': {
					backgroundPosition: '0% 0%'
				},
				'50%': {
					backgroundPosition: '100% 100%'
				}
			},
			warmGlow: {
				'0%': {
					boxShadow: '0 0 5px #d97706, 0 0 10px #d97706, 0 0 15px #d97706, inset 0 0 5px rgba(217, 119, 6, 0.1)'
				},
				'100%': {
					boxShadow: '0 0 10px #d97706, 0 0 20px #d97706, 0 0 30px #d97706, inset 0 0 10px rgba(217, 119, 6, 0.2)'
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
      handcrafted: ['Dancing Script', 'cursive'],
      traditional: ['Noto Serif Devanagari', 'serif'],
      samarkan: ['Samarkan', 'serif'],
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
			'handloom-pattern': "url('data:image/svg+xml,%3Csvg width=\"40\" height=\"40\" viewBox=\"0 0 40 40\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"%23bfa094\" fill-opacity=\"0.1\"%3E%3Cpath d=\"M20 20c0-11.046-8.954-20-20-20v20h20zM20 20c0 11.046 8.954 20 20 20V20H20zM20 20c-11.046 0-20-8.954-20-20h20v20zM20 20c11.046 0 20 8.954 20 20H20V20z\"/%3E%3C/g%3E%3C/svg%3E')",
			'texture-pattern': "url('data:image/svg+xml,%3Csvg width=\"100\" height=\"100\" viewBox=\"0 0 100 100\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" stroke=\"%23d97706\" stroke-width=\"0.5\" stroke-opacity=\"0.1\"%3E%3Cpath d=\"M0 0h100v100M0 20h100M0 40h100M0 60h100M0 80h100M20 0v100M40 0v100M60 0v100M80 0v100\"/%3E%3C/g%3E%3C/svg%3E')",
			'weave-pattern': "url('data:image/svg+xml,%3Csvg width=\"80\" height=\"80\" viewBox=\"0 0 80 80\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"%23e85d5d\" fill-opacity=\"0.08\"%3E%3Ccircle cx=\"40\" cy=\"40\" r=\"1\"/%3E%3Ccircle cx=\"0\" cy=\"0\" r=\"1\"/%3E%3Ccircle cx=\"80\" cy=\"0\" r=\"1\"/%3E%3Ccircle cx=\"0\" cy=\"80\" r=\"1\"/%3E%3Ccircle cx=\"80\" cy=\"80\" r=\"1\"/%3E%3C/g%3E%3C/svg%3E')",
		}
  	}
  },
  plugins: [
    require("tailwindcss-animate")
  ],
};

export default config; 