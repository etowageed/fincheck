<template>
    <aside
        class="bg-primary shadow-sm border-r border-default w-64 h-dvh fixed left-0 top-0 pt-20 transition-transform duration-300 z-30"
        :class="[
            isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        ]">
        <div class="flex flex-col h-full overflow-hidden">
            <!-- Navigation Section -->
            <nav class="flex-1 px-4 py-6 overflow-y-auto">
                <div class="space-y-2">
                    <!-- Navigation Links -->


                    <RouterLink to="/transactions"
                        class="flex items-center px-4 py-3 font-medium text-base text-secondary rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-accent-blue transition-colors"
                        active-class="bg-blue-50 dark:bg-blue-950/40 text-accent-blue" @click="$emit('close-mobile')">
                        <i class="pi pi-list mr-3"></i>
                        Transactions
                    </RouterLink>

                    <RouterLink to="/dashboard"
                        class="flex items-center px-4 py-3 font-medium text-base text-secondary rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-accent-blue transition-colors"
                        active-class="bg-blue-50 dark:bg-blue-950/40 text-accent-blue" @click="$emit('close-mobile')">
                        <i class="pi pi-home mr-3"></i>
                        Dashboard
                    </RouterLink>



                    <RouterLink to="/budget"
                        class="flex items-center px-4 py-3 font-medium text-base text-secondary rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-accent-blue transition-colors"
                        active-class="bg-blue-50 dark:bg-blue-950/40 text-accent-blue" @click="$emit('close-mobile')">
                        <i class="pi pi-wallet mr-3"></i>
                        Budget
                    </RouterLink>

                    <RouterLink to="/categories"
                        class="flex items-center px-4 py-3 font-medium text-base text-secondary rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-accent-blue transition-colors"
                        active-class="bg-blue-50 dark:bg-blue-950/40 text-accent-blue" @click="$emit('close-mobile')">
                        <i class="pi pi-tags mr-3"></i>
                        Categories
                    </RouterLink>

                    <RouterLink to="/goals"
                        class="flex items-center px-4 py-3 font-medium text-base text-secondary rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-accent-blue transition-colors"
                        active-class="bg-blue-50 dark:bg-blue-950/40 text-accent-blue" @click="$emit('close-mobile')">
                        <i class="pi pi-star mr-3"></i>
                        Goals
                    </RouterLink>

                    <RouterLink v-if="isAdmin" to="/admin"
                        class="flex items-center px-4 py-3 font-medium text-base text-secondary rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-accent-blue transition-colors"
                        active-class="bg-blue-50 dark:bg-blue-950/40 text-accent-blue" @click="$emit('close-mobile')">
                        <i class="pi pi-users mr-3"></i>
                        Admin
                    </RouterLink>
                </div>
            </nav>

            <!-- Bottom Section -->
            <div class="px-4 py-6 border-t border-default">
                <div class="space-y-2">

                    <!-- Dark Mode Toggle -->
                    <button @click="themeStore.toggle()"
                        class="flex items-center w-full px-4 py-3 font-medium text-base text-secondary rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-accent-blue transition-colors"
                        :aria-label="themeStore.isDark ? 'Switch to light mode' : 'Switch to dark mode'">
                        <i :class="themeStore.isDark ? 'pi pi-sun' : 'pi pi-moon'" class="mr-3 transition-transform duration-300"></i>
                        {{ themeStore.isDark ? 'Light Mode' : 'Dark Mode' }}
                    </button>

                    <!-- Settings Link -->
                    <RouterLink to="/settings"
                        class="flex items-center px-4 py-3 font-medium text-base text-secondary rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-accent-blue transition-colors"
                        active-class="bg-blue-50 dark:bg-blue-950/40 text-accent-blue" @click="$emit('close-mobile')">
                        <i class="pi pi-cog mr-3"></i>
                        Settings
                    </RouterLink>

                    <!-- Logout Button -->
                    <Logout />

                </div>
            </div>
        </div>
    </aside>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useThemeStore } from '@/stores/theme';

const authStore = useAuthStore();
const themeStore = useThemeStore();
const isAdmin = computed(() => authStore.user?.role === 'admin');

const router = useRouter();

onMounted(async () => {
    await authStore.checkAuth();
});

defineProps({
    isMobileOpen: {
        type: Boolean,
        default: false
    }
});

defineEmits(['close-mobile']);
</script>