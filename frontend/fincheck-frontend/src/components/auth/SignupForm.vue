<template>
    <form class="space-y-4 w-full max-w-sm mx-auto p-6 bg-white shadow rounded">

        <h2 class="text-xl font-bold text-center">Sign Up</h2>

        <div>
            <label for="email" class="block text-sm mb-1">Username</label>
            <InputText v-model="name" id="userName" type="text" class="w-full" />
        </div>
        <div>
            <label for="email" class="block text-sm mb-1">Email</label>
            <InputText v-model="email" id="email" type="email" class="w-full" />
        </div>

        <div>
            <label for="password" class="block text-sm mb-1">Password</label>
            <Password v-model="password" id="password" toggleMask class="w-full" inputClass="w-full" />
        </div>

        <div>
            <label for="confirm" class="block text-sm mb-1">Confirm Password</label>
            <Password v-model="confirmPassword" id="confirm" toggleMask class="w-full" inputClass="w-full" />
        </div>

        <Button label="Create Account" class="w-full mt-10" @click="submitSignup" />

        <Divider />
        <OAuthButtons />

    </form>

</template>

<script setup>
import { ref } from 'vue';
import { signup } from '@/services/auth';
import OAuthButtons from './OAuthButtons.vue';

const emit = defineEmits(['submit']);

const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const name = ref('');

const submitSignup = async () => {
    if (password.value !== confirmPassword.value) {
        alert('Passwords do not match');
        return;
    }

    try {
        const result = await signup({ name: name.value, email: email.value, password: password.value, confirmPassword: confirmPassword.value });
        alert('Signup successful!');
        // Emit the success event to parent component
        emit('submit', result);
    } catch (err) {
        alert('Signup failed');
        console.error(err);
        // Emit the failure event to parent component
        emit('submit', { status: 'error', error: err });
    }
};
</script>
