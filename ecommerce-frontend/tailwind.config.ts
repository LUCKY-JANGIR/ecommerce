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
  			primary: '#1e3a8a', // deep blue
  			accent: '#DAA520', // gold
  			background: {
  				light: '#f8f8f8',
  				dark: '#18181b',
  			},
  			card: '#fff',
  			muted: '#6b7280',
  		},
  		animation: {
  			'fade-in': 'fadeIn 0.5s ease-in-out',
  			'slide-up': 'slideUp 0.3s ease-out',
  			'glow': 'glow 2s ease-in-out infinite alternate'
  		},
  		keyframes: {
  			fadeIn: {
  				'0%': {
  					opacity: '0'
  				},
  				'100%': {
  					opacity: '1'
  				}
  			},
  			slideUp: {
  				'0%': {
  					transform: 'translateY(10px)',
  					opacity: '0'
  				},
  				'100%': {
  					transform: 'translateY(0)',
  					opacity: '1'
  				}
  			},
  			glow: {
  				'0%': {
  					boxShadow: '0 0 5px #DAA520, 0 0 10px #DAA520, 0 0 15px #DAA520'
  				},
  				'100%': {
  					boxShadow: '0 0 10px #DAA520, 0 0 20px #DAA520, 0 0 30px #DAA520'
  				}
  			}
  		},
  		borderRadius: {
      lg: '0.5rem',
      md: '0.375rem',
      sm: '0.25rem'
  		},
  		fontFamily: {
      display: ['Playfair Display', 'Georgia', 'serif'],
      body: ['Inter', 'system-ui', 'sans-serif'],
      accent: ['Caveat', 'cursive'],
  		}
  	}
  },
  plugins: [
    require("tailwindcss-animate")
  ],
};

export default config; 