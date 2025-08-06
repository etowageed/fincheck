// src/router/index.js
import { createRouter, createWebHistory } from "vue-router";
import { isLoggedIn } from "@/services/auth"; // import the function

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
    path: "/onboarding",
    name: "Onboarding",
    component: () => import("@/views/auth/OnboardingPage.vue"),
    meta: { requiresAuth: true },
  },

  {
    path: "/transactions",
    name: "Transactions",
    component: () => import("@/views/TransactionsPage.vue"),
    meta: { requiresAuth: true }, // Add meta field to indicate this route requires authentication
  },
  {
    path: "/dashboard",
    name: "Dashboard",
    component: () => import("@/views/DashboardPage.vue"),
    meta: { requiresAuth: true }, // Add meta field to indicate this route requires authentication
  },
  {
    path: "/forgot-password",
    name: "ForgotPassword",
    component: () => import("@/views/auth/ForgotPassword.vue"),
  },
  {
    path: "/reset-password/:token",
    name: "ResetPassword",
    component: () => import("@/views/auth/ResetPassword.vue"),
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

router.beforeEach(async (to, from, next) => {
  if (to.meta.requiresAuth) {
    // Allow navigation if coming directly from login after successful login
    if (from.name === "Login" && from.fullPath === "/login") {
      return next();
    }
    const loggedIn = await isLoggedIn();
    if (!loggedIn) {
      return next("/login");
    }
  }
  next();
});

export default router;
