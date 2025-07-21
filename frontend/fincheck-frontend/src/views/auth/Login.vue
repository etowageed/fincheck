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
    // Expect data to be the response from LoginForm (res.data)
    if (data?.status === 'success' && data?.token) {
        // Redirect to the same callback page as social login
        router.push(`/social-callback#token=${data.token}`);
    } else {
        // Show error or toast
        console.error('Login failed', data);
    }
};
</script>