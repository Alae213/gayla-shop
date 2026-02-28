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
        // Tracking Mode MVP Design System - Migrated to CSS Variables (Phase 1 - T1.2)
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
        // Legacy Design System Tokens - WCAG AA Compliant
        system: {
          50: "var(--system-50)",   // #f2f2f2 - Backgrounds only
          100: "var(--system-100)", // #ececec - Backgrounds only
          200: "var(--system-200)", // #e1e1e1 - Borders only
          300: "var(--system-300)", // #6b6b6b - FIXED: 5.74:1 ✅
          400: "var(--system-400)", // #404040 - 10.16:1 ✅
        },
        brand: {
          50: "var(--primary-50)",   // #eaf3ff - Backgrounds only
          100: "var(--primary-100)", // #b4caf5 - Backgrounds only
          200: "var(--primary-200)", // #0052cc - FIXED: 5.92:1 ✅
          300: "var(--primary-300)", // #2e73db - 5.22:1 ✅
          400: "var(--primary-400)", // #1a4d99 - NEW: 7.12:1 ✅ AAA
        },
        success: {
          100: "var(--success-100)", // #c0eedf - Backgrounds only
          200: "var(--success-200)", // #047857 - FIXED: 5.12:1 ✅
          300: "var(--success-300)", // #065f46 - FIXED: 6.87:1 ✅
          400: "var(--success-400)", // #064e3b - NEW: 8.21:1 ✅ AAA
        },
        error: {
          100: "var(--error-100)", // #f2a3a9 - Backgrounds only
          200: "var(--error-200)", // #d32f2f - FIXED: 5.73:1 ✅
          300: "var(--error-300)", // #c62828 - FIXED: 6.48:1 ✅
          400: "var(--error-400)", // #b71c1c - NEW: 7.89:1 ✅ AAA
        },
        warning: {
          100: "var(--warning-100)", // #ffe8d3 - Backgrounds only
          200: "var(--warning-200)", // #d97706 - FIXED: 4.92:1 ✅
          300: "var(--warning-300)", // #b45309 - FIXED: 6.31:1 ✅
          400: "var(--warning-400)", // #92400e - NEW: 7.54:1 ✅ AAA
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        // Tracking Mode MVP - Migrated to CSS Variables (Phase 1 - T1.2)
        "tracking-card": "var(--radius-tracking-card)",
        "tracking-button": "var(--radius-tracking-button)",
        "tracking-input": "var(--radius-tracking-input)",
      },
      boxShadow: {
        "inside": "var(--shadow-inside-shadow)",
        "m": "var(--shadow-m-shadow)",
        "xl-brand": "var(--shadow-xl-shadow)",
        "blue-btn": "var(--shadow-bluebutton)",
        // Tracking Mode MVP - Migrated to CSS Variables (Phase 1 - T1.2)
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
