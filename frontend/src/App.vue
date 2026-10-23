<template>
  <Analytics />
  <div id="app">
    <GlobalErrorToast />

    <!-- Only render Header if user is authenticated and route does not hide it -->
    <Header
      v-if="showShell && !route.meta.hideHeader"
      @toggle-sidebar="toggleMobileSidebar"
    />

    <!-- Only render Sidebar if user is authenticated and route does not hide it -->
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

    <main
      :class="{
        'lg:ml-64 pt-20': showSidebar,
        'pt-20': !showSidebar && showShell && !route.meta.hideHeader,
        'pt-0': !showSidebar && (!showShell || route.meta.hideHeader)
      }"
    >
      <div :class="{ 'p-6': showShell && !route.meta.hideHeader }">
        <router-view />
      </div>
    </main>

    <UpgradePromptModal />
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { Analytics } from "@vercel/analytics/vue";
import { useRoute } from 'vue-router';
import { useCategoriesStore } from '@/stores/categories';
import { useAuthStore } from '@/stores/auth';
import GlobalErrorToast from '@/components/common/GlobalErrorToast.vue';
import Header from '@/components/layout/Header.vue';
import Sidebar from '@/components/layout/Sidebar.vue';
import UpgradePromptModal from '@/components/ai/UpgradePromptModal.vue';

const route = useRoute();
const authStore = useAuthStore();
const categoriesStore = useCategoriesStore();

const isMobileSidebarOpen = ref(false);

// FIX: Determine if the authenticated shell (header/sidebar) should be eligible to display
const showShell = computed(() => {
  return authStore.isAuthenticated && route.meta.requiresAuth;
});

// FIX: The sidebar requires authentication AND must not be hidden by the route
const showSidebar = computed(() => {
  return showShell.value && !route.meta.hideSidebar;
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