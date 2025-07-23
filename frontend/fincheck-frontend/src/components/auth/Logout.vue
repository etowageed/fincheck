<template>
    <div>
        <button @click="logout">Logout</button>
    </div>
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
