<template>
  <div class="min-h-screen flex flex-col items-center justify-center bg-cream-50 dark:bg-primary text-ink-900 dark:text-primary px-6">
    <div class="text-center max-w-md">
      <div class="text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pop-purple via-pop-pink to-pop-yellow mb-4 select-none">
        404
      </div>
      <h1 class="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">
        Page not found
      </h1>
      <p class="text-ink-400 dark:text-secondary text-lg font-medium mb-10">
        The page you're looking for doesn't exist or has been moved. Let's get you back on track.
      </p>
      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <router-link
          to="/"
          class="px-8 py-3 bg-pop-lime text-ink-900 rounded-2xl font-bold text-base shadow-lg shadow-ink-900/10 hover:-translate-y-0.5 transition-all text-center"
        >
          Go to Homepage
        </router-link>
        <router-link
          to="/login"
          class="px-8 py-3 bg-white dark:bg-tertiary border-2 border-ink-100 dark:border-default text-ink-900 dark:text-primary rounded-2xl font-bold text-base hover:bg-ink-100 dark:hover:bg-secondary transition-colors text-center"
        >
          Log in
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';

onMounted(() => {
  document.title = 'Page Not Found — Plete Finance';
});
</script>
