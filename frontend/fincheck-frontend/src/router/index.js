// src/router/index.js
import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const routes = [
  {
    path: "/home",
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
    path: "/pricing",
    name: "Pricing",
    component: () => import("@/views/PricingPage.vue"),
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

  // Public routes logic remains the same
  const publicRoutes = [
    "/login",
    "/signup",
    "/forgot-password",
    "/reset-password",
  ];
  const isPublicRoute = publicRoutes.some((path) => to.path.startsWith(path));

  if (isPublicRoute) {
    if (authStore.isAuthenticated) {
      return next("/transactions");
    }
    return next();
  }

  // --- MODIFICATION FOR PROTECTED ROUTES ---
  if (to.meta.requiresAuth) {
    // If the auth store already knows the user is authenticated, just proceed.
    // This prevents the checkAuth() call on every subsequent navigation.
    if (authStore.isAuthenticated) {
      return next();
    }

    // If the store is not authenticated, THEN check with the backend.
    // This typically runs only on the first page load after login or a full refresh.
    try {
      const isStillAuthenticated = await authStore.checkAuth();
      if (isStillAuthenticated) {
        return next();
      }

      // If the backend check fails, redirect to login.
      return next({
        path: "/login",
        query: { redirect: to.fullPath },
      });
    } catch (error) {
      console.error("Auth check failed:", error);
      return next("/login");
    }
  }

  return next();
});

export default router;
