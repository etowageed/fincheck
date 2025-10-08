<!-- src/views/auth/Login.vue -->
<template>
    <div class="min-h-screen flex items-center justify-center bg-gray-100">
        <div>
            <LoginForm @submit="handleLogin" />
        </div>
    </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { nextTick } from 'vue'; // <-- 1. Import nextTick
import { useAuthStore } from '@/stores/auth';
import LoginForm from '@/components/auth/LoginForm.vue';

const router = useRouter();
const authStore = useAuthStore();

const handleLogin = (result) => {
    if (result.success) {
        // 2. Wrap the navigation in nextTick
        nextTick(() => {
            router.push('/transactions');
        });
    }
};
</script>