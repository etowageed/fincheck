<!-- src/views/auth/SocialCallback.vue -->
<script setup>
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

// const token = route.query.token;
const token = window.location.hash.replace('#token=', '');
if (token) {
    localStorage.setItem('jwt', token); // or use cookies if preferred
    router.push('/transactions'); // redirect to transactions
}
</script>

<template>
    <div class="flex items-center justify-center min-h-screen">
        <span v-if="!token">Authenticating...</span>
    </div>
</template>