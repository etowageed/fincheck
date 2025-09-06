<template>
    <button @click="toggleDarkMode" class="p-2 rounded-md bg-secondary hover:bg-tertiary transition-colors">
        <i :class="isDark ? 'pi pi-sun' : 'pi pi-moon'" class="text-primary"></i>
    </button>
</template>

<script setup>
import { useDarkMode } from '@/composables/useDarkMode'

const { isDark, toggleDarkMode } = useDarkMode()
</script>