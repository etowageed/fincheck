import "./assets/main.css";

import { createApp } from "vue";
import PrimeVue from "primevue/config";
import Aura from "@primeuix/themes/aura";
import { createPinia } from "pinia";
import router from "./router";
import { useDarkMode } from "./composables/useDarkMode";

import App from "./App.vue";

const app = createApp(App);

app.use(router);
app.use(PrimeVue, {
  theme: {
    preset: Aura,
  },
});

app.use(createPinia());

// Initialize dark mode
const { initTheme } = useDarkMode();
initTheme();

app.mount("#app");
