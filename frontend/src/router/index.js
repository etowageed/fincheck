// src/router/index.js
import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const routes = [
  {
    path: "/",
    component: () => import("@/views/LandingPage.vue"),
    meta: {
      hideSidebar: true,
      hideHeader: true,
      title:
        "Plete Finance — Track Spending, Set Budgets & Hit Your Savings Goals",
      description:
        "Plete Finance helps you track spending, set budgets, and reach your savings goals — all in one simple, visual dashboard. Free to start.",
    },
  },
  {
    path: "/login",
    name: "Login",
    component: () => import("@/views/auth/Login.vue"),
    meta: {
      hideSidebar: true,
      title: "Log In — Plete Finance",
      description:
        "Log in to your Plete Finance account to track your spending, budgets, and savings goals.",
    },
  },
  {
    path: "/signup",
    name: "Signup",
    component: () => import("@/views/auth/Signup.vue"),
    meta: {
      hideSidebar: true,
      title: "Sign Up — Plete Finance",
      description:
        "Create your free Plete Finance account and start tracking your income, expenses, and savings goals today.",
    },
  },
  {
    path: "/onboarding",
    name: "Onboarding",
    component: () => import("@/views/auth/OnboardingPage.vue"),
    meta: {
      requiresAuth: true,
      hideSidebar: true,
      title: "Get Started — Plete Finance",
      description:
        "Set up your Plete Finance account with your preferences and categories.",
    },
  },
  {
    path: "/transactions",
    name: "Transactions",
    component: () => import("@/views/TransactionsPage.vue"),
    meta: {
      requiresAuth: true,
      title: "Transactions — Plete Finance",
      description: "View and manage all your income and expense transactions.",
    },
  },
  {
    path: "/dashboard",
    name: "Dashboard",
    component: () => import("@/views/DashboardPage.vue"),
    meta: {
      requiresAuth: true,
      title: "Dashboard — Plete Finance",
      description:
        "Your financial overview — spending insights, category breakdowns, and trends.",
    },
  },
  {
    path: "/budget",
    name: "Budget",
    component: () => import("@/views/BudgetPage.vue"),
    meta: {
      requiresAuth: true,
      title: "Budget — Plete Finance",
      description: "Set and track your monthly budget by category.",
    },
  },
  {
    path: "/categories",
    name: "Categories",
    component: () => import("@/views/CategoriesPage.vue"),
    meta: {
      requiresAuth: true,
      title: "Categories — Plete Finance",
      description:
        "Manage your transaction categories for better spending insights.",
    },
  },
  {
    path: "/goals",
    name: "Goals",
    component: () => import("@/views/GoalsPage.vue"),
    meta: {
      requiresAuth: true,
      title: "Financial Goals — Plete Finance",
      description:
        "Set savings targets and track your progress towards financial goals.",
    },
  },
  {
    path: "/settings",
    name: "Settings",
    component: () => import("@/views/SettingsPage.vue"),
    meta: {
      requiresAuth: true,
      title: "Settings — Plete Finance",
      description:
        "Manage your account settings, preferences, and subscription.",
    },
  },
  {
    path: "/pricing",
    name: "Pricing",
    component: () => import("@/views/PricingPage.vue"),
    meta: {
      requiresAuth: true,
      title: "Pricing — Plete Finance",
      description:
        "Compare free and premium plans. Upgrade to unlock unlimited history, exports, and trend analysis.",
    },
  },
  {
    path: "/forgot-password",
    name: "ForgotPassword",
    component: () => import("@/views/auth/ForgotPassword.vue"),
    meta: {
      hideSidebar: true,
      title: "Forgot Password — Plete Finance",
      description: "Reset your Plete Finance account password.",
    },
  },
  {
    path: "/reset-password/:token",
    name: "ResetPassword",
    component: () => import("@/views/auth/ResetPassword.vue"),
    meta: {
      hideSidebar: true,
      title: "Reset Password — Plete Finance",
      description: "Create a new password for your Plete Finance account.",
    },
  },
  {
    path: "/terms",
    name: "TermsOfService",
    component: () => import("@/views/legal/TermsOfService.vue"),
    meta: {
      hideSidebar: true,
      title: "Terms of Service — Plete Finance",
      description:
        "Read the terms and conditions governing your use of Plete Finance.",
    },
  },
  {
    path: "/privacy",
    name: "PrivacyPolicy",
    component: () => import("@/views/legal/PrivacyPolicy.vue"),
    meta: {
      hideSidebar: true,
      title: "Privacy Policy — Plete Finance",
      description:
        "Learn how Plete Finance collects, uses, and protects your personal data.",
    },
  },
  {
    path: "/admin",
    name: "AdminDashboard",
    component: () => import("@/views/AdminDashboard.vue"),
    meta: {
      requiresAuth: true,
      requiresAdmin: true,
      title: "Admin Dashboard — Plete Finance",
    },
  },

  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: () => import("@/views/NotFoundPage.vue"),
    meta: {
      hideSidebar: true,
      hideHeader: true,
      title: "Page Not Found — Plete Finance",
    },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  // Scroll to top on navigation, or to hash target if present
  scrollBehavior(to, from, savedPosition) {
    if (to.hash) {
      return { el: to.hash, behavior: "smooth" };
    }
    if (savedPosition) {
      return savedPosition;
    }
    return { top: 0 };
  },
});

router.beforeEach(async (to, from, next) => {
  // ── Domain Enforcement Guard ──
  const hostname = window.location.hostname;
  const isProductionMain =
    hostname === "pletefinance.com" || hostname === "www.pletefinance.com";
  const isProductionApp = hostname === "app.pletefinance.com";

  // 1. Force Application logic to the App subdomain
  if (isProductionMain && to.path !== "/") {
    window.location.href = `https://app.pletefinance.com${to.fullPath}`;
    return; // Stop router execution
  }

  // 2. Prevent the App subdomain from showing the Landing Page
  if (isProductionApp && to.path === "/") {
    return next("/dashboard");
  }

  const authStore = useAuthStore();

  // ── Update document title & meta description for EVERY route ──
  if (to.meta.title) {
    document.title = to.meta.title;
  } else {
    document.title = "Plete Finance";
  }

  const descriptionTag = document.querySelector('meta[name="description"]');
  if (descriptionTag && to.meta.description) {
    descriptionTag.setAttribute("content", to.meta.description);
  }

  // Update canonical URL
  let canonicalTag = document.querySelector('link[rel="canonical"]');
  if (canonicalTag) {
    canonicalTag.setAttribute("href", `https://pletefinance.com${to.path}`);
  }

  // ── Auth: Guest-only routes ──
  const guestOnlyRoutes = [
    "/login",
    "/signup",
    "/forgot-password",
    "/reset-password",
  ];
  const isGuestOnlyRoute = guestOnlyRoutes.some((path) =>
    to.path.startsWith(path),
  );

  if (isGuestOnlyRoute) {
    if (authStore.isAuthenticated) {
      return next("/transactions");
    }
    return next();
  }

  // ── Auth: Protected routes ──
  if (to.meta.requiresAuth) {
    if (authStore.isAuthenticated) {
      if (to.meta.requiresAdmin && authStore.user?.role !== "admin") {
        return next("/transactions");
      }
      return next();
    }

    try {
      const isStillAuthenticated = await authStore.checkAuth();
      if (isStillAuthenticated) {
        if (to.meta.requiresAdmin && authStore.user?.role !== "admin") {
          return next("/transactions");
        }
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

  return next();
});

export default router;
