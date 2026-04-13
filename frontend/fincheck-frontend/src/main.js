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
            info: { background: '#3b82f6', color: '#ffffff', detailColor: '#ffffff', borderColor: '#2563eb' },
            success: { background: '#84cc16', color: '#ffffff', detailColor: '#ffffff', borderColor: '#65a30d' },
            warn: { background: '#f59e0b', color: '#ffffff', detailColor: '#ffffff', borderColor: '#d97706' },
            error: { background: '#dc2626', color: '#ffffff', detailColor: '#ffffff', borderColor: '#b91c1c' }
          },
          dark: {
            blur: '0px',
            info: { background: '#3b82f6', color: '#ffffff', detailColor: '#ffffff', borderColor: '#2563eb' },
            success: { background: '#84cc16', color: '#ffffff', detailColor: '#ffffff', borderColor: '#65a30d' },
            warn: { background: '#f59e0b', color: '#ffffff', detailColor: '#ffffff', borderColor: '#d97706' },
            error: { background: '#dc2626', color: '#ffffff', detailColor: '#ffffff', borderColor: '#b91c1c' }
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
