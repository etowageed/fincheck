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
    path: "/transactions",
    name: "Transactions",
    component: () => import("@/views/TransactionsPage.vue"),
  },
  {
    path: "/forgot-password",
    name: "ForgotPassword",
    component: () => import("@/components/auth/ForgotPasswordForm.vue"),
  },
  {
    path: "/social-callback",
    component: () => import("@/views/auth/SocialCallback.vue"),
  },
  // {
  //   path: "/dashboard",
  //   name: "Dashboard",
  //   component: { template: "<div>Dashboard (simulated protected route)</div>" },
  // },
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

// Global navigation guard to protect routes
router.beforeEach(async (to, from, next) => {
  // Check if the route requires authentication
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    try {
      const response = await isLoggedIn();
      // If user is logged in, proceed
      if (response.data.isLoggedIn) {
        next();
      } else {
        // If not logged in, redirect to login page
        next({ name: "Login" });
      }
    } catch (error) {
      // If there's an error (e.g., network issue, invalid token), redirect to login
      next({ name: "Login" });
    }
  } else {
    // If the route doesn't require auth, always let them through
    next();
  }
});

export default router;
