import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			fontSize: {
				'xs': ['0.75rem', { lineHeight: '1.4' }],      // 12px with better line height
				'sm': ['0.875rem', { lineHeight: '1.5' }],     // 14px with better line height
				'base': ['1rem', { lineHeight: '1.6' }],       // 16px with improved line height
				'lg': ['1.125rem', { lineHeight: '1.6' }],     // 18px with better line height
				'xl': ['1.25rem', { lineHeight: '1.6' }],      // 20px with better line height
				'2xl': ['1.5rem', { lineHeight: '1.5' }],      // 24px
				'3xl': ['1.875rem', { lineHeight: '1.4' }],    // 30px
				'4xl': ['2.25rem', { lineHeight: '1.3' }],     // 36px
				'5xl': ['3rem', { lineHeight: '1.2' }],        // 48px
				'6xl': ['3.75rem', { lineHeight: '1.1' }],     // 60px
				'7xl': ['4.5rem', { lineHeight: '1' }],        // 72px
				'8xl': ['6rem', { lineHeight: '1' }],          // 96px
				'9xl': ['8rem', { lineHeight: '1' }],          // 128px
			},
			letterSpacing: {
				tighter: '-0.05em',
				tight: '-0.025em',
				normal: '0',
				wide: '0.025em',
				wider: '0.05em',
				widest: '0.1em',
			},
			fontFamily: {
				display: ['var(--font-display)', 'Roboto', 'sans-serif'],
				body: ['var(--font-body)', 'Roboto', 'sans-serif'],
				sans: ['var(--font-body)', 'Roboto', 'sans-serif'],
				serif: ['Playfair Display', 'serif'],
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))',
					hover: 'hsl(var(--primary-hover))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				warning: {
					DEFAULT: 'hsl(var(--warning))',
					foreground: 'hsl(var(--warning-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			borderRadius: {
				lg: 'var(--radius-lg)',
				md: 'var(--radius)',
				sm: 'calc(var(--radius) - 4px)',
				xl: 'var(--radius-xl)',
			},
			backdropBlur: {
				'glass': '16px',
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'fade-in': {
					from: {
						opacity: '0',
						transform: 'translateY(20px)'
					},
					to: {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				'float': {
					'0%, 100%': {
						transform: 'translateY(0px)'
					},
					'50%': {
						transform: 'translateY(-10px)'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.6s ease-out',
				'float': 'float 3s ease-in-out infinite'
			},
			backgroundImage: {
				'gradient-primary': 'var(--gradient-primary)',
				'gradient-secondary': 'var(--gradient-secondary)',
				'gradient-subtle': 'var(--gradient-subtle)',
				'gradient-hero': 'var(--gradient-hero)',
				'gradient-hero-premium': 'var(--gradient-hero-premium)',
				'gradient-glass': 'var(--gradient-glass)',
			},
			boxShadow: {
				'professional': 'var(--shadow-professional)',
				'card': 'var(--shadow-card)',
				'elevation': 'var(--shadow-elevation)',
				'glass': 'var(--shadow-glass)',
				'button': 'var(--shadow-button)',
			}
		}
	},
	plugins: [
		require("tailwindcss-animate"),
		require("@tailwindcss/typography")
	],
} satisfies Config;
