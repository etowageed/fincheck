// src/router/index.js
import { createRouter, createWebHistory } from "vue-router";

const routes = [
  {
    path: "/",
    component: () => import("@/views/Home.vue"), // Add this to redirect root to login, later make it the route for the landing page
  },
  {
    path: "/login",
    name: "Login",
    component: () => import("@/views/auth/Login.vue"),
  },
  {
    path: "/signup",
    name: "Signup",
    component: () => import("@/views/auth/Signup.vue"),
  },
  {
    path: "/forgot-password",
    name: "ForgotPassword",
    component: () => import("@/views/auth/ForgotPassword.vue"),
  },
  {
    path: "/dashboard",
    name: "Dashboard",
    component: { template: "<div>Dashboard (simulated protected route)</div>" },
  },
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: { template: "<div>404 - Page Not Found</div>" },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
