<template>
    <header class="bg-primary shadow-sm border-b border-default px-6 py-4 fixed top-0 left-0 right-0 z-20">
        <div class="flex justify-between items-center">
            <div class="flex items-center">
                <button class="mr-4 text-secondary hover:text-primary lg:hidden" @click="$emit('toggle-sidebar')" aria-label="Toggle navigation menu">
                    <i class="pi pi-bars text-xl"></i>
                </button>
                <span class="text-xl md:text-2xl font-bold tracking-tight text-primary leading-snug">Plete Finance</span>
            </div>

            <!-- Dark Mode Toggle -->
            <button @click="themeStore.toggle()"
                class="w-9 h-9 flex items-center justify-center rounded-lg text-secondary hover:text-primary hover:bg-tertiary transition-colors"
                :aria-label="themeStore.isDark ? 'Switch to light mode' : 'Switch to dark mode'">
                <i :class="themeStore.isDark ? 'pi pi-sun' : 'pi pi-moon'" class="text-lg transition-transform duration-300"></i>
            </button>
        </div>
    </header>
</template>

<script setup>
import { useThemeStore } from '@/stores/theme';

const themeStore = useThemeStore();

defineEmits(['toggle-sidebar']);
</script>