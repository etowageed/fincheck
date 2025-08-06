<template>
    <div>
        <div class="min-h-screen flex items-center justify-center bg-gray-100">

            <SignupForm @submit="handleSignup" />

        </div>

    </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import SignupForm from '@/components/auth/SignupForm.vue';

const router = useRouter();

const handleSignup = (data) => {
    // On successful signup, redirect to welcome page for first-time users
    if (data?.data?.status === 'success') {
        // New users should go through onboarding
        router.push('/onboarding');
    } else {
        // Show error or toast
        console.error('Signup failed', data);
    }
};
</script>
