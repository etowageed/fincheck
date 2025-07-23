<!-- src/components/auth/ForgotPasswordForm.vue -->
<template>
    <div class="min-h-screen flex items-center justify-center bg-gray-100">
        <form @submit.prevent="submitForgotPassword"
            class="space-y-4 w-full max-w-sm mx-auto p-6 bg-white shadow rounded">
            <h2 class="text-xl font-semibold text-center">Reset Password</h2>
            <p class="text-sm text-gray-600 text-center">Enter your email address and we'll send you a link to reset
                your password.</p>

            <div v-if="message" :class="messageClass" class="p-3 rounded text-sm">
                {{ message }}
            </div>

            <div>
                <label for="email" class="block text-sm mb-1">Email Address</label>
                <InputText id="email" v-model="email" type="email" class="w-full" placeholder="you@example.com"
                    :disabled="loading" required />
            </div>

            <Button type="submit" :label="loading ? 'Sending...' : 'Send Reset Link'" class="w-full mt-4"
                :disabled="loading" :loading="loading" />

            <div class="text-center mt-4">
                <router-link to="/login" class="text-sm text-blue-600 hover:text-blue-800">
                    Back to Login
                </router-link>
            </div>
        </form>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { forgotPassword } from '@/services/auth';

const email = ref('');
const loading = ref(false);
const message = ref('');
const messageClass = ref('');

const submitForgotPassword = async () => {
    if (!email.value) {
        setMessage('Please enter your email address', 'error');
        return;
    }

    loading.value = true;
    message.value = '';

    try {
        const res = await forgotPassword(email.value);
        if (res.data?.status === 'success') {
            setMessage('Password reset link sent to your email address. Please check your inbox.', 'success');
            email.value = ''; // Clear the form
        }
    } catch (err) {
        console.error('Forgot password error:', err);
        const errorMessage = err.response?.data?.message || 'Failed to send reset email. Please try again.';
        setMessage(errorMessage, 'error');
    } finally {
        loading.value = false;
    }
};

const setMessage = (text, type) => {
    message.value = text;
    messageClass.value = type === 'success'
        ? 'bg-green-100 text-green-700 border border-green-300'
        : 'bg-red-100 text-red-700 border border-red-300';
};
</script>