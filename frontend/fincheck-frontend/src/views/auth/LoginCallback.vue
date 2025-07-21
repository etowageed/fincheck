<!-- src/views/auth/SocialCallback.vue -->
<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();
router.replace('/transactions'); // Immediately redirect
</script>

<template>
    <div class="flex items-center justify-center min-h-screen">
        <span>Authenticating...</span>
    </div>
</template>