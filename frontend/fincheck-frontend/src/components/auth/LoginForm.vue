<template>
    <form @submit.prevent="submitLogin"
        class="space-y-4 w-full max-w-sm mx-auto p-6 bg-primary text-primary shadow rounded border border-default">
        <h2 class="text-xl font-semibold text-center">Log in</h2>

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

        <div class="text-center mt-3 space-y-2">
            <RouterLink to="/forgot-password"
                class="block text-sm text-accent-blue hover:text-blue-800 ">
                Forgot your password?
            </RouterLink>
            <p class="text-sm text-secondary">
                Don't have an account?
                <RouterLink to="/signup"
                    class="text-accent-blue hover:text-blue-800  font-medium">
                    Sign up
                </RouterLink>
            </p>
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
    const result = await authStore.login({
        email: email.value,
        password: password.value
    });

    // The component still emits the result for the parent view to handle routing
    emit('submit', result);
};
</script>