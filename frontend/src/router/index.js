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
        "Plete Finance — AI-Powered Expense Tracker, Receipt OCR & Financial Coach",
      description:
        "Track spending, log expenses in plain English, scan receipts with AI, simulate savings scenarios, and master your budget in one visual dashboard. Free to start.",
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
        "Create your free Plete Finance account and start tracking your income, expenses, and savings goals with AI intelligence today.",
    },
  },
  {
    path: "/onboarding",
    name: "Onboarding",
    component: () => import("@/views/auth/OnboardingPage.vue"),
    meta: {
      requiresAuth: true,
      hideSidebar: true,
      title: "Welcome & Account Setup — Plete Finance",
      description:
        "Configure your currency, monthly budget baseline, and explore your Plete AI Financial Co-Pilot.",
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
    path: "/ai-coach",
    name: "AiCoach",
    component: () => import("@/views/AiFinancialCoachPage.vue"),
    meta: {
      requiresAuth: true,
      title: "AI Financial Coach — Plete Finance",
      description:
        "AI-powered financial insights, budget forecasts, savings simulations, and coaching.",
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
  const publicMarketingPaths = ["/", "/privacy", "/terms"];

  // 1. Force Application logic to the App subdomain (keep public marketing/legal routes on main domain)
  if (isProductionMain && !publicMarketingPaths.includes(to.path)) {
    window.location.href = `https://app.pletefinance.com${to.fullPath}`;
    return; // Stop router execution
  }

  // 2. Prevent the App subdomain from showing the Landing Page
  if (isProductionApp && to.path === "/") {
    return next("/dashboard");
  }

  const authStore = useAuthStore();

  // ── Update document title & SEO meta tags for EVERY route ──
  const pageTitle = to.meta.title || "Plete Finance — AI-Powered Expense Tracker, Receipt OCR & Financial Coach";
  document.title = pageTitle;

  const setMetaContent = (selector, content) => {
    const el = document.querySelector(selector);
    if (el && content) {
      el.setAttribute("content", content);
    }
  };

  if (to.meta.description) {
    setMetaContent('meta[name="description"]', to.meta.description);
    setMetaContent('meta[property="og:description"]', to.meta.description);
    setMetaContent('meta[name="twitter:description"]', to.meta.description);
  }
  setMetaContent('meta[property="og:title"]', pageTitle);
  setMetaContent('meta[name="twitter:title"]', pageTitle);

  // Set robots directive: index public marketing/auth entry pages, noindex private app & utility pages
  const isNoIndexRoute =
    Boolean(to.meta.requiresAuth) ||
    to.name === "NotFound" ||
    to.path.startsWith("/forgot-password") ||
    to.path.startsWith("/reset-password");

  setMetaContent(
    'meta[name="robots"]',
    isNoIndexRoute
      ? "noindex, nofollow"
      : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
  );

  // Update canonical & OpenGraph URL
  const canonicalBase = publicMarketingPaths.includes(to.path)
    ? "https://pletefinance.com"
    : "https://app.pletefinance.com";
  const canonicalUrl = `${canonicalBase}${to.path === "/" ? "/" : to.path}`;

  const canonicalTag = document.querySelector('link[rel="canonical"]');
  if (canonicalTag) {
    canonicalTag.setAttribute("href", canonicalUrl);
  }
  setMetaContent('meta[property="og:url"]', canonicalUrl);
  setMetaContent('meta[name="twitter:url"]', canonicalUrl);

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
