// src/router/index.js
import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const routes = [
  {
    path: "/",
    component: () => import("@/views/Home.vue"), // Add this to redirect root to login, later make it the route for the landing page
    meta: { hideSidebar: true },
  },
  {
    path: "/login",
    name: "Login",
    component: () => import("@/views/auth/Login.vue"),
    meta: { hideSidebar: true },
  },
  {
    path: "/signup",
    name: "Signup",
    component: () => import("@/views/auth/Signup.vue"),
    meta: { hideSidebar: true },
  },

  {
    path: "/onboarding",
    name: "Onboarding",
    component: () => import("@/views/auth/OnboardingPage.vue"),
    meta: { requiresAuth: true, hideSidebar: true }, // Add meta field to indicate this route requires authentication
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
    path: "/budget",
    name: "Budget",
    component: () => import("@/views/BudgetPage.vue"),
    meta: { requiresAuth: true }, // Add meta field to indicate this route requires authentication
  },
  {
    path: "/categories",
    name: "Categories",
    component: () => import("@/views/CategoriesPage.vue"),
    meta: { requiresAuth: true }, // Add meta field to indicate this route requires authentication
  },
  {
    path: "/settings",
    name: "Settings",
    component: () => import("@/views/SettingsPage.vue"),
    meta: { requiresAuth: true },
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
  const authStore = useAuthStore();

  // Skip auth check for public routes
  const publicRoutes = [
    "/login",
    "/signup",
    "/forgot-password",
    "/reset-password",
  ];
  if (publicRoutes.includes(to.path)) {
    if (authStore.isAuthenticated) {
      return next("/transactions");
    }
    return next();
  }

  // For protected routes
  if (to.meta.requiresAuth) {
    try {
      // Always check with backend first
      const isAuthenticated = await authStore.checkAuth();
      if (isAuthenticated) {
        return next();
      }

      return next({
        path: "/login",
        query: { redirect: to.fullPath },
      });
    } catch (error) {
      console.error("Auth check failed:", error);
      return next("/login");
    }
  }

  next();
});

export default router;
