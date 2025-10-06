<template>
  <div id="app">
    <GlobalErrorToast />

    <Header />

    <Sidebar v-if="showSidebar" />

    <main :class="{ 'ml-64 pt-20': showSidebar, 'pt-20': !showSidebar }">
      <div class="p-6">
        <router-view />
      </div>
    </main>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useCategoriesStore } from '@/stores/categories';
import { useAuthStore } from '@/stores/auth';
import GlobalErrorToast from '@/components/common/GlobalErrorToast.vue'; // Import the component
// import Header from '@/components/layout/Header.vue';
// import Sidebar from '@/components/layout/Sidebar.vue';

const route = useRoute();
const authStore = useAuthStore();
const categoriesStore = useCategoriesStore();

// Show sidebar on all routes except login/register
const showSidebar = computed(() => {
  return !route.meta.hideSidebar;
});

onMounted(async () => {
  if (authStore.isAuthenticated) {
    await categoriesStore.fetchCategories();
  }
});
</script>