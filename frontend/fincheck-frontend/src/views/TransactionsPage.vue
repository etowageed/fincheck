<template>
    <div>
        <UserTransactions />
    </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useTransactionsStore } from '@/stores/transactions';
import UserTransactions from '@/components/finances/UserTransactions.vue';
import { useRouter, useRoute } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { useAuthStore } from '@/stores/auth';

// Use the new store
const transactionsStore = useTransactionsStore();

// Fetch transactions when the component is first loaded
// Fetch transactions when the component is first loaded
onMounted(() => {
    // Check for payment success/cancel query params
    const route = useRoute();
    const router = useRouter();
    const toast = useToast();
    const authStore = useAuthStore();

    if (route.query.payment === 'success') {
        toast.add({
            severity: 'success',
            summary: 'Payment Successful',
            detail: 'Welcome to Premium! Your account status will update shortly.',
            life: 5000
        });

        // Background check to sync natively without a full interval.
        // Delayed slightly to allow Polar webhooks time to hit the backend.
        setTimeout(() => {
            authStore.checkAuth();
        }, 3000);

        // Clean the URL
        router.replace({ query: { ...route.query, payment: undefined } });

    } else if (route.query.payment === 'cancel') {
        toast.add({
            severity: 'info',
            summary: 'Payment Canceled',
            detail: 'You canceled the checkout process.',
            life: 3000
        });
        router.replace({ query: { ...route.query, payment: undefined } });
    }
});
</script>