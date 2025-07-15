import "./assets/main.css";

import { createApp } from "vue";
import PrimeVue from "primevue/config";
import Aura from "@primeuix/themes/aura";
import ToastService from "primevue/toastservice";
import ConfirmationService from "primevue/confirmationservice";
import { createPinia } from "pinia";

// import Button from "primevue/button";
// import InputText from "primevue/inputtext";
// import Password from "primevue/password";
// import Divider from "primevue/divider";
import router from "./router";

import App from "./App.vue";

const app = createApp(App);

app.use(router);
app.use(PrimeVue, {
  theme: {
    preset: Aura,
  },
});
app.use(ToastService);
app.use(ConfirmationService);
app.use(createPinia());

app.mount("#app");
