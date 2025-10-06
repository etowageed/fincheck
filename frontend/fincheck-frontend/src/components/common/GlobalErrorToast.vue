<template>
    <Toast position="top-right" />
</template>

<script setup>
import { watch } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useErrorStore } from '@/stores/error';

const errorStore = useErrorStore();
const toast = useToast();

watch(() => errorStore.error, (newMessage) => {
    if (newMessage) {
        toast.add({
            severity: 'error',
            summary: 'An Error Occurred',
            detail: newMessage,
            life: 5000 // Display for 5 seconds
        });
        // Clear the error after displaying it
        errorStore.clearError();
    }
});
</script>