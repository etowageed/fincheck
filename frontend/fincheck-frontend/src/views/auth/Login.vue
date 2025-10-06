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
import { useAuthStore } from '@/stores/auth';
import LoginForm from '@/components/auth/LoginForm.vue';

const router = useRouter();
const authStore = useAuthStore();

const handleLogin = (result) => {
    if (result.success) {
        router.push('/transactions');
    }
    // No 'else' block is needed. Errors are handled globally.
};
</script>