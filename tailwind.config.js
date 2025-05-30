/** @type {import('tailwindcss').Config} */
import { heroui } from "@heroui/react";

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Primary colors
        primary: {
          50: "rgb(var(--color-primary-50) / <alpha-value>)",
          100: "rgb(var(--color-primary-100) / <alpha-value>)",
          200: "rgb(var(--color-primary-200) / <alpha-value>)",
          300: "rgb(var(--color-primary-300) / <alpha-value>)",
          400: "rgb(var(--color-primary-400) / <alpha-value>)",
          500: "rgb(var(--color-primary-500) / <alpha-value>)",
          600: "rgb(var(--color-primary-600) / <alpha-value>)",
          700: "rgb(var(--color-primary-700) / <alpha-value>)",
          800: "rgb(var(--color-primary-800) / <alpha-value>)",
          900: "rgb(var(--color-primary-900) / <alpha-value>)",
          950: "rgb(var(--color-primary-950) / <alpha-value>)",
          DEFAULT: "rgb(var(--color-primary-500) / <alpha-value>)",
        },
        // Secondary colors
        secondary: {
          50: "rgb(var(--color-secondary-50) / <alpha-value>)",
          100: "rgb(var(--color-secondary-100) / <alpha-value>)",
          200: "rgb(var(--color-secondary-200) / <alpha-value>)",
          300: "rgb(var(--color-secondary-300) / <alpha-value>)",
          400: "rgb(var(--color-secondary-400) / <alpha-value>)",
          500: "rgb(var(--color-secondary-500) / <alpha-value>)",
          600: "rgb(var(--color-secondary-600) / <alpha-value>)",
          700: "rgb(var(--color-secondary-700) / <alpha-value>)",
          800: "rgb(var(--color-secondary-800) / <alpha-value>)",
          900: "rgb(var(--color-secondary-900) / <alpha-value>)",
          950: "rgb(var(--color-secondary-950) / <alpha-value>)",
          DEFAULT: "rgb(var(--color-secondary-500) / <alpha-value>)",
        },
        // Success colors
        success: {
          50: "rgb(var(--color-success-50) / <alpha-value>)",
          100: "rgb(var(--color-success-100) / <alpha-value>)",
          200: "rgb(var(--color-success-200) / <alpha-value>)",
          300: "rgb(var(--color-success-300) / <alpha-value>)",
          400: "rgb(var(--color-success-400) / <alpha-value>)",
          500: "rgb(var(--color-success-500) / <alpha-value>)",
          600: "rgb(var(--color-success-600) / <alpha-value>)",
          700: "rgb(var(--color-success-700) / <alpha-value>)",
          800: "rgb(var(--color-success-800) / <alpha-value>)",
          900: "rgb(var(--color-success-900) / <alpha-value>)",
          950: "rgb(var(--color-success-950) / <alpha-value>)",
          DEFAULT: "rgb(var(--color-success-500) / <alpha-value>)",
        },
        // Warning colors
        warning: {
          50: "rgb(var(--color-warning-50) / <alpha-value>)",
          100: "rgb(var(--color-warning-100) / <alpha-value>)",
          200: "rgb(var(--color-warning-200) / <alpha-value>)",
          300: "rgb(var(--color-warning-300) / <alpha-value>)",
          400: "rgb(var(--color-warning-400) / <alpha-value>)",
          500: "rgb(var(--color-warning-500) / <alpha-value>)",
          600: "rgb(var(--color-warning-600) / <alpha-value>)",
          700: "rgb(var(--color-warning-700) / <alpha-value>)",
          800: "rgb(var(--color-warning-800) / <alpha-value>)",
          900: "rgb(var(--color-warning-900) / <alpha-value>)",
          950: "rgb(var(--color-warning-950) / <alpha-value>)",
          DEFAULT: "rgb(var(--color-warning-500) / <alpha-value>)",
        },
        // Error colors
        error: {
          50: "rgb(var(--color-error-50) / <alpha-value>)",
          100: "rgb(var(--color-error-100) / <alpha-value>)",
          200: "rgb(var(--color-error-200) / <alpha-value>)",
          300: "rgb(var(--color-error-300) / <alpha-value>)",
          400: "rgb(var(--color-error-400) / <alpha-value>)",
          500: "rgb(var(--color-error-500) / <alpha-value>)",
          600: "rgb(var(--color-error-600) / <alpha-value>)",
          700: "rgb(var(--color-error-700) / <alpha-value>)",
          800: "rgb(var(--color-error-800) / <alpha-value>)",
          900: "rgb(var(--color-error-900) / <alpha-value>)",
          950: "rgb(var(--color-error-950) / <alpha-value>)",
          DEFAULT: "rgb(var(--color-error-500) / <alpha-value>)",
        },
        // Neutral colors
        neutral: {
          50: "rgb(var(--color-neutral-50) / <alpha-value>)",
          100: "rgb(var(--color-neutral-100) / <alpha-value>)",
          200: "rgb(var(--color-neutral-200) / <alpha-value>)",
          300: "rgb(var(--color-neutral-300) / <alpha-value>)",
          400: "rgb(var(--color-neutral-400) / <alpha-value>)",
          500: "rgb(var(--color-neutral-500) / <alpha-value>)",
          600: "rgb(var(--color-neutral-600) / <alpha-value>)",
          700: "rgb(var(--color-neutral-700) / <alpha-value>)",
          800: "rgb(var(--color-neutral-800) / <alpha-value>)",
          900: "rgb(var(--color-neutral-900) / <alpha-value>)",
          950: "rgb(var(--color-neutral-950) / <alpha-value>)",
          DEFAULT: "rgb(var(--color-neutral-500) / <alpha-value>)",
        },
        // Background colors
        background: {
          DEFAULT: "rgb(var(--color-background) / <alpha-value>)",
          secondary: "rgb(var(--color-background-secondary) / <alpha-value>)",
          tertiary: "rgb(var(--color-background-tertiary) / <alpha-value>)",
        },
        // Surface colors
        surface: {
          DEFAULT: "rgb(var(--color-surface) / <alpha-value>)",
          secondary: "rgb(var(--color-surface-secondary) / <alpha-value>)",
        },
        // Text colors
        text: {
          primary: "rgb(var(--color-text-primary) / <alpha-value>)",
          secondary: "rgb(var(--color-text-secondary) / <alpha-value>)",
          tertiary: "rgb(var(--color-text-tertiary) / <alpha-value>)",
          inverse: "rgb(var(--color-text-inverse) / <alpha-value>)",
        },
        // Border colors
        border: {
          DEFAULT: "rgb(var(--color-border) / <alpha-value>)",
          secondary: "rgb(var(--color-border-secondary) / <alpha-value>)",
          focus: "rgb(var(--color-border-focus) / <alpha-value>)",
        },
      },
      boxShadow: {
        sm: "var(--shadow-sm)",
        DEFAULT: "var(--shadow)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
        xl: "var(--shadow-xl)",
      },
      fontFamily: {
        sans: [
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
      spacing: {
        18: "4.5rem",
        88: "22rem",
        128: "32rem",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-in-out",
        "slide-in": "slideIn 0.3s ease-out",
        "pulse-slow": "pulse 3s infinite",
      },
      backdropBlur: {
        xs: "2px",
      },
      borderRadius: {
        "4xl": "2rem",
      },
    },
  },
  plugins: [heroui()],
};
