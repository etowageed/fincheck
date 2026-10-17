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
                    <SidebarNavLink
                        v-for="item in navItems"
                        :key="item.to"
                        :to="item.to"
                        :icon="item.icon"
                        :label="item.label"
                        @click="$emit('close-mobile')"
                    />
                </div>
            </nav>

            <!-- Bottom Section -->
            <div class="px-4 py-6 border-t border-default">
                <div class="space-y-2">
                    <!-- Dark Mode Toggle -->
                    <ThemeToggleButton show-label />

                    <!-- Settings Link -->
                    <SidebarNavLink
                        to="/settings"
                        icon="pi pi-cog"
                        label="Settings"
                        @click="$emit('close-mobile')"
                    />

                    <!-- Logout Button -->
                    <Logout />
                </div>
            </div>
        </div>
    </aside>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import SidebarNavLink from './SidebarNavLink.vue';
import ThemeToggleButton from './ThemeToggleButton.vue';

const authStore = useAuthStore();
const isAdmin = computed(() => authStore.user?.role === 'admin');

const navItems = computed(() => {
    const items = [
        { to: '/transactions', icon: 'pi pi-list', label: 'Transactions' },
        { to: '/dashboard', icon: 'pi pi-home', label: 'Dashboard' },
        { to: '/budget', icon: 'pi pi-wallet', label: 'Budget' },
        { to: '/categories', icon: 'pi pi-tags', label: 'Categories' },
        { to: '/goals', icon: 'pi pi-star', label: 'Goals' },
        { to: '/ai-coach', icon: 'pi pi-sparkles text-accent-blue', label: 'AI Financial Coach' },
    ];
    if (isAdmin.value) {
        items.push({ to: '/admin', icon: 'pi pi-users', label: 'Admin' });
    }
    return items;
});

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