<template>
    <form @submit.prevent="submitSignup"
        class="space-y-4 w-full max-w-sm mx-auto p-6 bg-primary text-primary shadow rounded border border-default">
        <h2 class="text-xl font-bold text-center">Sign Up</h2>

        <div>
            <label for="userName" class="block text-sm mb-1">Username</label>
            <InputText v-model="name" id="userName" type="text" class="w-full" :disabled="authStore.isLoading" />
        </div>
        <div>
            <label for="email" class="block text-sm mb-1">Email</label>
            <InputText v-model="email" id="email" type="email" class="w-full" :disabled="authStore.isLoading" />
        </div>

        <div>
            <label for="password" class="block text-sm mb-1">Password</label>
            <Password v-model="password" id="password" toggleMask class="w-full" inputClass="w-full"
                :disabled="authStore.isLoading" />
        </div>

        <div>
            <label for="confirm" class="block text-sm mb-1">Confirm Password</label>
            <Password v-model="confirmPassword" id="confirm" toggleMask class="w-full" inputClass="w-full"
                :disabled="authStore.isLoading" />
        </div>

        <Button label="Create Account" class="w-full mt-10" type="submit" :loading="authStore.isLoading"
            :disabled="authStore.isLoading" />

        <div class="text-center mt-4">
            <p class="text-sm text-secondary">
                Already have an account?
                <RouterLink to="/login"
                    class="text-accent-blue hover:text-blue-800 dark:hover:text-blue-400 font-medium">
                    Log in
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
import { useErrorStore } from '@/stores/error'; // Import error store
import OAuthButtons from './OAuthButtons.vue';

const emit = defineEmits(['submit']);
const authStore = useAuthStore();
const errorStore = useErrorStore(); // Use error store

const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const name = ref('');

const submitSignup = async () => {
    if (password.value !== confirmPassword.value) {
        errorStore.setError('Passwords do not match'); // Use global error handler
        return;
    }

    const result = await authStore.signup({
        name: name.value,
        email: email.value,
        password: password.value,
        confirmPassword: confirmPassword.value
    });

    emit('submit', result);
};
</script>