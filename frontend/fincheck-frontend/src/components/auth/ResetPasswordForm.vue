<!-- src/components/auth/ResetPasswordForm.vue -->
<template>
    <div class="min-h-screen flex items-center justify-center bg-tertiary">
        <form @submit.prevent="submitResetPassword" class="space-y-4 w-full max-w-sm mx-auto p-6 bg-primary text-primary shadow rounded border border-default">
            <h2 class="text-xl font-semibold text-center">Set New Password</h2>
            <p class="text-sm text-secondary text-center">Enter your new password below.</p>

            <div v-if="message" :class="messageClass" class="p-3 rounded text-sm">
                {{ message }}
            </div>

            <div>
                <label for="password" class="block text-sm mb-1">New Password</label>
                <Password 
                    id="password" 
                    v-model="password" 
                    toggleMask 
                    class="w-full" 
                    inputClass="w-full"
                    placeholder="••••••••" 
                    :feedback="true"
                    :disabled="loading"
                    required
                />
            </div>

            <div>
                <label for="confirmPassword" class="block text-sm mb-1">Confirm New Password</label>
                <Password 
                    id="confirmPassword" 
                    v-model="confirmPassword" 
                    toggleMask 
                    class="w-full" 
                    inputClass="w-full"
                    placeholder="••••••••" 
                    :feedback="false"
                    :disabled="loading"
                    required
                />
            </div>

            <Button 
                type="submit" 
                :label="loading ? 'Resetting...' : 'Reset Password'" 
                class="w-full mt-4" 
                :disabled="loading"
                :loading="loading"
            />

            <div class="text-center mt-4">
                <router-link to="/login" class="text-sm text-accent-blue hover:text-blue-800 ">
                    Back to Login
                </router-link>
            </div>
        </form>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { resetPassword } from '@/services/auth';

const route = useRoute();
const router = useRouter();

const password = ref('');
const confirmPassword = ref('');
const loading = ref(false);
const message = ref('');
const messageClass = ref('');
const token = ref('');

onMounted(() => {
    token.value = route.params.token;
    if (!token.value) {
        setMessage('Invalid reset link', 'error');
    }
});

const submitResetPassword = async () => {
    if (!password.value || !confirmPassword.value) {
        setMessage('Please fill in all fields', 'error');
        return;
    }

    if (password.value !== confirmPassword.value) {
        setMessage('Passwords do not match', 'error');
        return;
    }

    if (password.value.length < 8) {
        setMessage('Password must be at least 8 characters long', 'error');
        return;
    }

    loading.value = true;
    message.value = '';

    try {
        const res = await resetPassword(token.value, {
            password: password.value,
            confirmPassword: confirmPassword.value
        });
        
        if (res.data?.status === 'success') {
            setMessage('Password reset successfully! Redirecting to login...', 'success');
            setTimeout(() => {
                router.push('/login');
            }, 2000);
        }
    } catch (err) {
        console.error('Reset password error:', err);
        const errorMessage = err.response?.data?.message || 'Failed to reset password. Please try again.';
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
