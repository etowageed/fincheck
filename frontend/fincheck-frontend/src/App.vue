<template>
  <div id="app">
    <!-- Header -->
    <Header />

    <!-- Sidebar (only show on authenticated routes) -->
    <Sidebar v-if="showSidebar" />

    <!-- Main Content -->
    <main :class="{ 'ml-64 pt-20': showSidebar, 'pt-20': !showSidebar }">
      <div class="p-6">
        <router-view />
      </div>
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
// import Header from '@/components/layout/Header.vue';
// import Sidebar from '@/components/layout/Sidebar.vue';

const route = useRoute();

// Show sidebar on all routes except login/register
const showSidebar = computed(() => {
  const publicRoutes = ['/login', '/register', '/'];
  return !publicRoutes.includes(route.path);
});
</script>
