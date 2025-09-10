import { preset } from "primevue/themes";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  presets: [preset], // Enables bg-primary, text-primary, etc.
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "rgb(var(--color-bg-primary) / <alpha-value>)",
        secondary: "rgb(var(--color-bg-secondary) / <alpha-value>)",
        tertiary: "rgb(var(--color-bg-tertiary) / <alpha-value>)",
        text: {
          primary: "rgb(var(--color-text-primary) / <alpha-value>)",
          secondary: "rgb(var(--color-text-secondary) / <alpha-value>)",
          muted: "rgb(var(--color-text-muted) / <alpha-value>)",
        },
        accent: {
          blue: "rgb(var(--color-accent-blue) / <alpha-value>)",
          green: "rgb(var(--color-accent-green) / <alpha-value>)",
          red: "rgb(var(--color-accent-red) / <alpha-value>)",
        },
        border: {
          default: "rgb(var(--color-border) / <alpha-value>)",
        },
      },
    },
  },
  plugins: [],
};
