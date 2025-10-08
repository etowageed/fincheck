import "./assets/main.css";

import { createApp } from "vue";
import PrimeVue from "primevue/config";
import Aura from "@primeuix/themes/aura";
import { createPinia } from "pinia";
import router from "./router";
import { useDarkMode } from "./composables/useDarkMode";
import { useAuthStore } from "./stores/auth";
import ToastService from "primevue/toastservice";

import App from "./App.vue";

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);
app.use(PrimeVue, {
  theme: {
    preset: Aura,
  },
});
app.use(ToastService);

// Initialize dark mode
const { initTheme } = useDarkMode();
initTheme();

// Initialize auth before mounting
// const authStore = useAuthStore();
// await authStore.initializeAuth();

app.mount("#app");
