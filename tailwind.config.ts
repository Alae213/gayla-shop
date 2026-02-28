import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
        // Tracking Mode MVP Design System
        tracking: {
          bg: {
            primary: "rgb(var(--tracking-bg-primary) / <alpha-value>)",
            secondary: "rgb(var(--tracking-bg-secondary) / <alpha-value>)",
            card: "rgb(var(--tracking-bg-card) / <alpha-value>)",
          },
          text: {
            primary: "rgb(var(--tracking-text-primary) / <alpha-value>)",
            secondary: "rgb(var(--tracking-text-secondary) / <alpha-value>)",
          },
          border: "rgb(var(--tracking-border) / <alpha-value>)",
          interactive: {
            DEFAULT: "rgb(var(--tracking-interactive) / <alpha-value>)",
            hover: "rgb(var(--tracking-interactive-hover) / <alpha-value>)",
          }
        },
        // Brand Design System Tokens - WCAG AA Compliant
        system: {
          50: "var(--system-50)",
          100: "var(--system-100)",
          200: "var(--system-200)",
          300: "var(--system-300)",
          400: "var(--system-400)",
        },
        brand: {
          50: "var(--primary-50)",
          100: "var(--primary-100)",
          200: "var(--primary-200)",
          300: "var(--primary-300)",
          400: "var(--primary-400)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        "tracking-card": "var(--radius-tracking-card)",
        "tracking-button": "var(--radius-tracking-button)",
        "tracking-input": "var(--radius-tracking-input)",
      },
      boxShadow: {
        "inside": "var(--shadow-inside-shadow)",
        "m": "var(--shadow-m-shadow)",
        "xl-brand": "var(--shadow-xl-shadow)",
        "blue-btn": "var(--shadow-bluebutton)",
        "tracking-card": "var(--shadow-tracking-card)",
        "tracking-elevated": "var(--shadow-tracking-elevated)",
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
          },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
};

export default config;
