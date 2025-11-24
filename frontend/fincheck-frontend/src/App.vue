<template>
  <div id="app">
    <GlobalErrorToast />

    <Header @toggle-sidebar="toggleMobileSidebar" />

    <Sidebar 
      v-if="showSidebar" 
      :is-mobile-open="isMobileSidebarOpen"
      @close-mobile="isMobileSidebarOpen = false"
    />

    <!-- Overlay for mobile sidebar -->
    <div 
      v-if="showSidebar && isMobileSidebarOpen" 
      class="fixed inset-0 bg-black/50 z-20 lg:hidden"
      @click="isMobileSidebarOpen = false"
    ></div>

    <main :class="{ 
      'lg:ml-64 pt-20': showSidebar, 
      'pt-20': !showSidebar 
    }">
      <div class="p-6">
        <router-view />
      </div>
    </main>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useCategoriesStore } from '@/stores/categories';
import { useAuthStore } from '@/stores/auth';
import GlobalErrorToast from '@/components/common/GlobalErrorToast.vue';
import Header from '@/components/layout/Header.vue';
import Sidebar from '@/components/layout/Sidebar.vue';

const route = useRoute();
const authStore = useAuthStore();
const categoriesStore = useCategoriesStore();

const isMobileSidebarOpen = ref(false);

// Show sidebar on all routes except login/register
const showSidebar = computed(() => {
  return !route.meta.hideSidebar;
});

const toggleMobileSidebar = () => {
  isMobileSidebarOpen.value = !isMobileSidebarOpen.value;
};

onMounted(async () => {
  if (authStore.isAuthenticated) {
    await categoriesStore.fetchCategories();
  }
});
</script>