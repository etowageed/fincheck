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
import LoginForm from '@/components/auth/LoginForm.vue';

const router = useRouter();

const handleLogin = (data) => {
    // On successful login, redirect to /transactions (token is now in httpOnly cookie)
    if (data?.status === 'success') {
        router.push('/transactions');
    } else {
        // Show error or toast
        console.error('Login failed', data);
    }
};
</script>