import "./assets/main.css";

import { createApp } from "vue";
import PrimeVue from "primevue/config";
import Aura from "@primeuix/themes/aura";
import { definePreset } from "@primeuix/themes";
import { createPinia } from "pinia";
import router from "./router";

import { useAuthStore } from "./stores/auth";
import ToastService from "primevue/toastservice";

import App from "./App.vue";

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
            blur: '0px',
            info: { background: '#eff6ff', color: '#1e40af', detailColor: '#1e40af', borderColor: '#bfdbfe' },
            success: { background: '#f0fdf4', color: '#166534', detailColor: '#166534', borderColor: '#bbf7d0' },
            warn: { background: '#fefce8', color: '#854d0e', detailColor: '#854d0e', borderColor: '#fef08a' },
            error: { background: '#fef2f2', color: '#991b1b', detailColor: '#991b1b', borderColor: '#fecaca' }
          },
          dark: {
            blur: '0px',
            info: { background: '#1e3a8a', color: '#bfdbfe', detailColor: '#bfdbfe', borderColor: '#1e3a8a' },
            success: { background: '#14532d', color: '#bbf7d0', detailColor: '#bbf7d0', borderColor: '#14532d' },
            warn: { background: '#713f12', color: '#fef08a', detailColor: '#fef08a', borderColor: '#713f12' },
            error: { background: '#7f1d1d', color: '#fecaca', detailColor: '#fecaca', borderColor: '#7f1d1d' }
          }
        }
      }
    }
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

// Initialize auth before mounting
// const authStore = useAuthStore();
// await authStore.initializeAuth();

app.mount("#app");
