import { preset } from "primevue/themes";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  presets: [preset], // Enables bg-primary, text-primary, etc.
  darkMode: "false",
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
          yellow: "#FCD34D",
        },
        border: {
          default: "rgb(var(--color-border) / <alpha-value>)",
        },
      },
    },
  },
  plugins: [],
};

// /** @type {import('tailwindcss').Config} */
// import { preset } from "primevue/themes";

// export default {
//   content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
//   presets: [preset],
//   darkMode: "class",
//   theme: {
//     extend: {
//       fontFamily: {
//         sans: ['"Plus Jakarta Sans"', "sans-serif"], // Recommend adding this font via Google Fonts in index.html
//       },
//       colors: {
//         // A warmer, creamier background for light mode
//         cream: {
//           50: "#FDFBF7",
//           100: "#F7F4EB",
//           200: "#EBE5D5",
//         },
//         // A deep, rich charcoal for text/dark mode bg
//         ink: {
//           900: "#0F172A", // Deep Navy/Black
//           950: "#020617", // Even darker for contrast
//           800: "#1E293B",
//           400: "#94A3B8",
//           100: "#E2E8F0",
//         },
//         // Vibrant Accents
//         pop: {
//           purple: "#8B5CF6",
//           lime: "#84CC16",
//           pink: "#EC4899",
//           yellow: "#FCD34D",
//           cyan: "#06B6D4",
//         },
//       },
//       animation: {
//         float: "float 6s ease-in-out infinite",
//         "float-delayed": "float 6s ease-in-out 3s infinite",
//         "bounce-slow": "bounce 3s infinite",
//         "spin-slow": "spin 12s linear infinite",
//       },
//       keyframes: {
//         float: {
//           "0%, 100%": { transform: "translateY(0)" },
//           "50%": { transform: "translateY(-20px)" },
//         },
//       },
//     },
//   },
//   plugins: [],
// };
