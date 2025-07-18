<!-- src/views/auth/Login.vue -->
<template>
    <div class="min-h-screen flex items-center justify-center bg-gray-100">
        <div>
            <LoginForm @submit="handleLogin" />

        </div>
    </div>
</template>

<script setup>
import LoginForm from '@/components/auth/LoginForm.vue';
import { login } from '@/services/auth'; // If using service API

const handleLogin = async ({ email, password }) => {
    try {
        const res = await login({ email, password });
        console.log('Login success', res.data);
        //TODO Navigate to dashboard or handle session
    } catch (err) {
        console.error('Login failed', err);
        // Show toast or error message
    }
};
</script>
