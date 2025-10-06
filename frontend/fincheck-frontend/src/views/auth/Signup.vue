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

const handleSignup = (result) => {
    // On successful signup, redirect to the onboarding page
    if (result.success) {
        router.push('/onboarding');
    } else {
        // The error is now displayed within SignupForm.vue,
        // so we just log it here for debugging purposes.
        console.error('Signup failed:', result.error);
    }
};
</script>