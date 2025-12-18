<template>
    <div class="min-h-screen flex items-center justify-center bg-tertiary">
        <form @submit.prevent="submitForgotPassword"
            class="space-y-4 w-full max-w-sm mx-auto p-6 bg-primary text-primary shadow rounded border border-default">
            <h2 class="text-xl font-semibold text-center">Reset Password</h2>
            <p class="text-sm text-secondary text-center">Enter your email address and we'll send you a link to reset
                your password.</p>

            <div>
                <label for="email" class="block text-sm mb-1">Email Address</label>
                <InputText id="email" v-model="email" type="email" class="w-full" placeholder="you@example.com"
                    :disabled="authStore.isLoading" required />
            </div>

            <Button type="submit" :label="authStore.isLoading ? 'Sending...' : 'Send Reset Link'" class="w-full mt-4"
                :disabled="authStore.isLoading" :loading="authStore.isLoading" />

            <div class="text-center mt-4">
                <router-link to="/login" class="text-sm text-accent-blue hover:text-blue-800 ">
                    Back to Login
                </router-link>
            </div>
        </form>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useToast } from 'primevue/usetoast';

const authStore = useAuthStore();
const toast = useToast();

const email = ref('');

const submitForgotPassword = async () => {
    if (!email.value) {
        // Use the global error handler via the store if needed for client-side validation
        // but for now, we rely on the required attribute
        return;
    }

    const result = await authStore.forgotPassword(email.value);
    if (result.success) {
        toast.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Password reset link sent to your email address. Please check your inbox.',
            life: 3000
        });
        email.value = ''; // Clear the form
    }
    // Errors are now handled globally by the toast
};
</script>