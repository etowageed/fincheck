<!-- src/components/auth/LoginForm.vue -->
<template>
    <form @submit.prevent="submitForm" class="space-y-4 w-full max-w-sm mx-auto p-6 bg-white shadow rounded">
        <h2 class="text-xl font-semibold text-center">Log in</h2>

        <div>
            <label for="email" class="block text-sm mb-1">Email</label>
            <InputText id="email" v-model="email" type="email" class="w-full" placeholder="you@example.com" />
        </div>

        <div>
            <label for="password" class="block text-sm mb-1">Password</label>
            <Password id="password" v-model="password" toggleMask class="w-full" inputClass="w-full"
                placeholder="••••••••" :feedback="false" />
        </div>

        <Button type="submit" label="Login" class="w-full mt-10" />

        <Divider />
        <OAuthButtons />
    </form>
</template>

<script setup>
import { ref } from 'vue';
import OAuthButtons from './OAuthButtons.vue';

const email = ref('');
const password = ref('');

const emit = defineEmits(['submit']);
// always rememeber to listen for this emit in the parent
const submitForm = () => {
    emit('submit', { email: email.value, password: password.value });
};
</script>
