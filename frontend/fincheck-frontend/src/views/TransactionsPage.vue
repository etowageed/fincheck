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
import * as authService from '@/services/auth';

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

        // 1. Optimistic Update: Immediately show Premium status
        if (authStore.user) {
            authStore.user.subscriptionStatus = 'premium';
            // Set a fake expiry date or null to ensure isPremium computed property works
            authStore.user.subscriptionExpires = null; 
        }

        // 2. Background Polling to sync with server
        let attempts = 0;
        const maxAttempts = 20; // 20 * 3s = 60s max
        
        const pollInterval = setInterval(async () => {
            attempts++;
            try {
                // Fetch user data directly without updating store yet
                const response = await authService.getCurrentUser();
                if (response.data?.status === 'success') {
                    const serverUser = response.data.data.user;
                    
                    // If server now says premium, we can safely sync the store and stop polling
                    if (serverUser.subscriptionStatus === 'premium') {
                        authStore.user = serverUser;
                        clearInterval(pollInterval);
                        toast.add({
                            severity: 'info',
                            summary: 'Subscription Confirmed',
                            detail: 'Your premium status is fully active.',
                            life: 3000
                        });
                    }
                }
            } catch (err) {
                console.error("Polling auth status failed", err);
            }

            if (attempts >= maxAttempts) {
                clearInterval(pollInterval);
                // Final sync attempt - if it's still free, it will revert the UI, 
                // but at least we gave it 60s of optimistic grace.
                authStore.checkAuth(); 
            }
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