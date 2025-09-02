<template>
    <Button @click="logout" icon="pi pi-sign-out" label="Logout"
        class="w-full !justify-start !text-left text-gray-700 hover:bg-blue-50 hover:text-blue-600" severity="secondary"
        text />
</template>

<script setup>
import api from '@/services/api';
import { useRouter } from 'vue-router';

const router = useRouter();

const logout = async () => {
    try {
        await api.get('/auth/logout'); // Use GET to match your backend
        router.push('/login');
    } catch (error) {
        // Optionally show an error message
        console.error('Logout failed', error);
    }
};
</script>
