<!-- src/components/auth/OAuthButtons.vue -->
<template>
    <div class="flex flex-col gap-2">
        <Button icon="pi pi-google" label="Continue with Google" class="p-button-outlined p-button-secondary w-full"
            @click="handleOAuth('google')" />
        <Button icon="pi pi-facebook" label="Continue with Facebook" class="p-button-outlined p-button-secondary w-full"
            @click="handleOAuth('facebook')" />
    </div>
</template>

<script setup>
const backendUrl = import.meta.env.VITE_API_BASE_URL;
const handleOAuth = (provider) => {
    window.location.href = `${backendUrl}/auth/${provider}`;
};
</script>
