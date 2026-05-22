<template>
    <Button @click="handleLogout" icon="pi pi-sign-out" label="Logout"
        class="w-full !justify-start !text-left text-secondary hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-accent-blue" severity="secondary"
        :loading="authStore.isLoading" text />
</template>

<script setup>
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const handleLogout = async () => {
    try {
        await authStore.logout();
        router.replace('/login');
    } catch (error) {
        console.error('Logout failed:', error);
    }
};
</script>
