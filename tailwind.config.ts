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
            primary: "#FFFFFF",
            secondary: "#F5F5F5",
            card: "#F7F7F7",
          },
          text: {
            primary: "#3A3A3A",
            secondary: "#AAAAAA",
          },
          border: "#ECECEC",
          interactive: {
            DEFAULT: "#3A3A3A",
            hover: "#1A1A1A",
          }
        },
        // Legacy Design System Tokens
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
        },
        success: {
          100: "var(--success-100)",
          200: "var(--success-200)",
          300: "var(--success-300)",
        },
        error: {
          100: "var(--error-100)",
          200: "var(--error-200)",
          300: "var(--error-300)",
        },
        warning: {
          100: "var(--warning-100)",
          200: "var(--warning-200)",
          300: "var(--warning-300)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        // Tracking Mode MVP
        "tracking-card": "24px",
        "tracking-button": "9999px",
        "tracking-input": "12px",
      },
      boxShadow: {
        "inside": "var(--shadow-inside-shadow)",
        "m": "var(--shadow-m-shadow)",
        "xl-brand": "var(--shadow-xl-shadow)",
        "blue-btn": "var(--shadow-bluebutton)",
        // Tracking Mode MVP
        "tracking-card": "0px 4px 16px rgba(0, 0, 0, 0.06)",
        "tracking-elevated": "0px 8px 32px rgba(0, 0, 0, 0.08)",
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
