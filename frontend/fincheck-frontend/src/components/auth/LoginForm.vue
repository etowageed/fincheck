<!-- src/components/auth/LoginForm.vue -->
<template>
    <form @submit.prevent="submitLogin" class="space-y-4 w-full max-w-sm mx-auto p-6 bg-white shadow rounded">
        <h2 class="text-xl font-semibold text-center">Log in</h2>

        <div v-if="authStore.error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {{ authStore.error }}
        </div>

        <div>
            <label for="email" class="block text-sm mb-1">Email</label>
            <InputText id="email" v-model="email" type="email" class="w-full" placeholder="you@example.com"
                :disabled="authStore.isLoading" />
        </div>

        <div>
            <label for="password" class="block text-sm mb-1">Password</label>
            <Password id="password" v-model="password" toggleMask class="w-full" inputClass="w-full"
                :disabled="authStore.isLoading" />
        </div>

        <Button type="submit" :label="authStore.isLoading ? 'Logging in...' : 'Login'" class="w-full mt-10"
            :loading="authStore.isLoading" :disabled="authStore.isLoading" />

        <div class="text-center mt-3">
            <RouterLink to="/forgot-password" class="text-sm text-blue-600 hover:text-blue-800">
                Forgot your password?
            </RouterLink>
        </div>

        <Divider />
        <OAuthButtons />
    </form>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import OAuthButtons from './OAuthButtons.vue';

const emit = defineEmits(['submit']);
const authStore = useAuthStore();

const email = ref('');
const password = ref('');

const submitLogin = async () => {
    try {
        const result = await authStore.login({
            email: email.value,
            password: password.value
        });

        emit('submit', result);

        if (!result.success) {
            console.error('Login error:', result.message);
        }
    } catch (err) {
        console.error('Login submission error:', err);
        emit('submit', {
            success: false,
            message: 'Failed to process login request'
        });
    }
};
</script>
