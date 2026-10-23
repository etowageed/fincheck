import "./assets/main.css";

import { createApp } from "vue";
import PrimeVue from "primevue/config";
import Aura from "@primeuix/themes/aura";
import { definePreset } from "@primeuix/themes";
import { createPinia } from "pinia";
import router from "./router";

import ToastService from "primevue/toastservice";
import App from "./App.vue";
import { useThemeStore } from "./stores/theme";

const MyPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: "#f7fee7",
      100: "#ecfccb",
      200: "#d9f99d",
      300: "#bef264",
      400: "#a3e635",
      500: "#84cc16",
      600: "#65a30d",
      700: "#4d7c0f",
      800: "#3f6212",
      900: "#365314",
      950: "#1a2e05",
    },
  },
  components: {
    toast: {
      colorScheme: {
        light: {
          blur: "0px",
          info: {
            background: "#3b82f6",
            color: "#ffffff",
            detailColor: "#ffffff",
            borderColor: "#2563eb",
          },
          success: {
            background: "#1e820e",
            color: "#ffffff",
            detailColor: "#ffffff",
            borderColor: "#65a30d",
          },
          warn: {
            background: "#f59e0b",
            color: "#ffffff",
            detailColor: "#ffffff",
            borderColor: "#d97706",
          },
          error: {
            background: "#a2352e",
            color: "#ffffff",
            detailColor: "#ffffff",
            borderColor: "#b91c1c",
          },
        },
        dark: {
          blur: "0px",
          info: {
            background: "#3b82f6",
            color: "#ffffff",
            detailColor: "#ffffff",
            borderColor: "#2563eb",
          },
          success: {
            background: "#1e820e",
            color: "#ffffff",
            detailColor: "#ffffff",
            borderColor: "#65a30d",
          },
          warn: {
            background: "#f59e0b",
            color: "#ffffff",
            detailColor: "#ffffff",
            borderColor: "#d97706",
          },
          error: {
            background: "#a2352e",
            color: "#ffffff",
            detailColor: "#ffffff",
            borderColor: "#b91c1c",
          },
        },
      },
    },
  },
});

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);
app.use(PrimeVue, {
  theme: {
    preset: MyPreset,
    options: {
      darkModeSelector: ".dark",
    },
  },
});
app.use(ToastService);

const themeStore = useThemeStore();

// Keep <html> .dark class synced with routes that force light mode (e.g., "/")
router.afterEach((to) => {
  themeStore.setForceLightRoute(Boolean(to.meta.forceLight));
});

// FIX: Wait for router to resolve initial route before applying route-aware theme and mounting DOM
router.isReady().then(() => {
  themeStore.initTheme(Boolean(router.currentRoute.value.meta.forceLight));
  app.mount("#app");
});
