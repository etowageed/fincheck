import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";
import vueDevTools from "vite-plugin-vue-devtools";
import Components from "unplugin-vue-components/vite";
import { PrimeVueResolver } from "@primevue/auto-import-resolver";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    vueDevTools(),
    Components({ resolvers: [PrimeVueResolver()] }),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    // 💡 NEW: Allow the host provided by the tunnelling service (e.g., Ngrok)
    // This host needs to be updated every time Ngrok assigns a new URL.
    allowedHosts: [
      "twana-uncleft-annually.ngrok-free.dev",
      "localhost",
      "127.0.0.1",
    ],
    proxy: {
      "/api": {
        target: "http://localhost:5000", // Change to your backend port if different
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
