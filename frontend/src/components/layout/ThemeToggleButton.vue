<template>
  <button
    type="button"
    @click="themeStore.toggle()"
    :aria-label="themeStore.isDark ? 'Switch to light mode' : 'Switch to dark mode'"
    :class="
      showLabel
        ? 'flex items-center w-full px-4 py-3 font-medium text-base text-secondary rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-accent-blue transition-colors cursor-pointer'
        : 'w-9 h-9 flex items-center justify-center rounded-lg text-secondary hover:text-primary hover:bg-tertiary transition-colors cursor-pointer'
    "
  >
    <i
      :class="[
        themeStore.isDark ? 'pi pi-sun' : 'pi pi-moon',
        showLabel ? 'mr-3' : 'text-lg',
      ]"
      class="transition-transform duration-300"
    ></i>
    <span v-if="showLabel">{{ themeStore.isDark ? 'Light Mode' : 'Dark Mode' }}</span>
  </button>
</template>

<script setup>
import { useThemeStore } from '@/stores/theme';

defineProps({
  showLabel: {
    type: Boolean,
    default: false,
  },
});

const themeStore = useThemeStore();
</script>
