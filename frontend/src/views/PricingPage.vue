<template>
    <div class="min-h-screen flex items-center justify-center bg-tertiary">
        <div class="max-w-xl mx-auto p-8 bg-primary shadow rounded-lg text-center space-y-6 border border-default">
            <h1 class="text-3xl font-bold text-accent-blue">Plete Finance Premium</h1>
            <p class="text-lg text-secondary">Unlock unlimited access to your financial data!</p>

            <!-- Status Indicator -->
            <Message v-if="authStore.isPremium" severity="success" :closable="false">
                🎉 You are currently a **Premium** user! Thank you for your support.
            </Message>
            <Message v-else-if="authStore.isAuthenticated" severity="info" :closable="false">
                Switch to Premium to enjoy unlimited access to your financial data!
            </Message>

            <div class="grid grid-cols-1 gap-4 text-left">
                <div class="p-4 border border-default rounded-lg bg-blue-50 dark:bg-blue-950/30">
                    <h3 class="font-semibold text-accent-blue mb-2">Premium Tier - Unlock Everything</h3>
                    <ul class="text-sm text-secondary space-y-2 mb-4">
                        <li class="flex items-center gap-2"><i class="pi pi-check text-accent-green"></i> Unlimited
                            Historical Data (10+ Years)</li>
                        <li class="flex items-center gap-2"><i class="pi pi-check text-accent-green"></i> **Unlimited
                            Data Export** (PDF/Excel)</li>
                        <li class="flex items-center gap-2"><i class="pi pi-check text-accent-green"></i> Comprehensive
                            Dashboard Metrics</li>
                        <li class="flex items-center gap-2"><i class="pi pi-check text-accent-green"></i> Priority
                            Support</li>
                    </ul>

                    <Button :label="authStore.isPremium ? 'Manage Subscription' : 'Upgrade Now'" icon="pi pi-bolt"
                        size="large" class="w-full" :loading="isLoading"
                        :disabled="!authStore.isAuthenticated || isLoading"
                        @click="handleUpgrade" />
                    <p v-if="!authStore.isAuthenticated" class="text-xs text-muted mt-2">Please log in to upgrade.</p>
                </div>

                <div class="p-4 border border-default rounded-lg">
                    <h3 class="font-semibold text-primary mb-2">Free Tier</h3>
                    <ul class="text-sm text-secondary space-y-1">
                        <li class="flex items-center gap-2"><i class="pi pi-check text-accent-green"></i> Transaction
                            tracking (Current Month Only)</li>
                        <li class="flex items-center gap-2"><i class="pi pi-check text-accent-green"></i> Basic
                            Budgeting</li>
                        <li class="flex items-center gap-2"><i class="pi pi-times text-accent-red"></i> Restricted
                            Historical Trends</li>
                        <li class="flex items-center gap-2"><i class="pi pi-times text-accent-red"></i> No Data Export
                        </li>
                    </ul>
                </div>
            </div>


            <router-link to="/transactions" class="text-sm text-accent-blue hover:text-blue-800 ">
                Back to my dashboard
            </router-link>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import axios from 'axios';
import { useAuthStore } from '@/stores/auth';
import { useToast } from 'primevue/usetoast';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const toast = useToast();

const isLoading = ref(false);

const handleUpgrade = async () => {
    // If user is already premium, route them to the Customer Portal
    if (authStore.isPremium) {
        isLoading.value = true;
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_API_BASE_URL}/payment/portal`,
                {},
                { withCredentials: true }
            );
            
            if (response.data.portalUrl) {
                window.location.href = response.data.portalUrl;
            } else {
                throw new Error("Did not receive a valid portal URL.");
            }
        } catch (error) {
            console.error('Portal error:', error);
            toast.add({
                severity: 'error',
                summary: 'Access Failed',
                detail: error.response?.data?.message || 'Failed to access subscription portal. Please try again.',
                life: 5000
            });
        } finally {
            isLoading.value = false;
        }
        return;
    }

    isLoading.value = true;

    try {
        // Call the backend endpoint to create the session
        const response = await axios.post(
            `${import.meta.env.VITE_API_BASE_URL}/payment/checkout`,
            {},
            { withCredentials: true }
        );

        const sessionUrl = response.data.sessionUrl;

        if (sessionUrl) {
            // Redirect the user to the checkout page
            window.location.href = sessionUrl;
        } else {
            throw new Error("Did not receive a valid session URL.");
        }
    } catch (error) {
        console.error('Checkout error:', error);
        toast.add({
            severity: 'error',
            summary: 'Upgrade Failed',
            detail: error.response?.data?.message || 'Failed to initiate payment. Please try again.',
            life: 5000
        });
    } finally {
        isLoading.value = false;
    }
};

onMounted(() => {
    // Logic for payment success/cancel redirection is now handled in TransactionsPage.vue
});
</script>
