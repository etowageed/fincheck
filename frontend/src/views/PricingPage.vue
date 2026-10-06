<template>
    <div class="min-h-screen flex items-center justify-center bg-tertiary py-12 px-4">
        <div class="max-w-2xl mx-auto p-8 bg-primary shadow rounded-2xl text-center space-y-6 border border-default">
            <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-accent-blue border border-blue-200 dark:border-blue-800">
                <i class="pi pi-sparkles text-amber-500"></i> Google Gemini Powered
            </div>
            <h1 class="text-3xl font-extrabold text-gray-900 dark:text-white">Plete Finance Plans</h1>
            <p class="text-base text-secondary">Compare Free vs Premium plans and unlock unlimited AI financial intelligence.</p>

            <!-- Status Indicator -->
            <Message v-if="authStore.isPremium" severity="success" :closable="false">
                🎉 You are currently a **Premium** subscriber! Thank you for your support.
            </Message>
            <Message v-else-if="authStore.isAuthenticated" severity="info" :closable="false">
                Upgrade to Premium to unlock unlimited AI entries, receipt scans, financial forecasts, and 10+ year data history!
            </Message>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-left pt-2">
                <!-- Premium Card -->
                <div class="p-6 border-2 border-accent-blue rounded-2xl bg-blue-50/40 dark:bg-blue-950/30 flex flex-col justify-between relative shadow-sm">
                    <div class="absolute -top-3 right-4 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-accent-blue text-white">
                        Recommended
                    </div>
                    <div>
                        <h3 class="font-bold text-lg text-accent-blue mb-1">Premium Tier</h3>
                        <p class="text-xs text-secondary mb-4">Unlimited standard usage across all features.</p>
                        <ul class="text-xs text-secondary space-y-2.5 mb-6">
                            <li class="flex items-center gap-2 font-medium text-gray-900 dark:text-white">
                                <i class="pi pi-check text-emerald-500 font-bold"></i> Unlimited AI Quick-Log Entries
                            </li>
                            <li class="flex items-center gap-2 font-medium text-gray-900 dark:text-white">
                                <i class="pi pi-check text-emerald-500 font-bold"></i> Unlimited Receipt & Note Scans
                            </li>
                            <li class="flex items-center gap-2 font-medium text-gray-900 dark:text-white">
                                <i class="pi pi-check text-emerald-500 font-bold"></i> Unlimited AI Coach & Ask Plete
                            </li>
                            <li class="flex items-center gap-2 font-medium text-gray-900 dark:text-white">
                                <i class="pi pi-check text-emerald-500 font-bold"></i> Budget Forecasts & Scenarios
                            </li>
                            <li class="flex items-center gap-2 font-medium text-gray-900 dark:text-white">
                                <i class="pi pi-check text-emerald-500 font-bold"></i> Unlimited History (10+ Years)
                            </li>
                            <li class="flex items-center gap-2 font-medium text-gray-900 dark:text-white">
                                <i class="pi pi-check text-emerald-500 font-bold"></i> Data Export (PDF/Excel)
                            </li>
                        </ul>
                    </div>

                    <Button :label="authStore.isPremium ? 'Manage Subscription' : 'Upgrade to Premium'" icon="pi pi-bolt"
                        size="large" class="w-full font-semibold" :loading="isLoading"
                        :disabled="!authStore.isAuthenticated || isLoading"
                        @click="handleUpgrade" />
                </div>

                <!-- Free Card -->
                <div class="p-6 border border-default rounded-2xl bg-primary flex flex-col justify-between">
                    <div>
                        <h3 class="font-bold text-lg text-gray-900 dark:text-white mb-1">Free Tier</h3>
                        <p class="text-xs text-secondary mb-4">Generous monthly allowances renewed automatically.</p>
                        <ul class="text-xs text-secondary space-y-2.5 mb-6">
                            <li class="flex items-center gap-2">
                                <i class="pi pi-check text-emerald-500"></i> 15 AI Quick-Logs / month
                            </li>
                            <li class="flex items-center gap-2">
                                <i class="pi pi-check text-emerald-500"></i> 3 Receipt Scans / month
                            </li>
                            <li class="flex items-center gap-2">
                                <i class="pi pi-check text-emerald-500"></i> 3 AI Coach Questions / month
                            </li>
                            <li class="flex items-center gap-2">
                                <i class="pi pi-check text-emerald-500"></i> 5 Ask Plete Messages / month
                            </li>
                            <li class="flex items-center gap-2">
                                <i class="pi pi-check text-emerald-500"></i> 1 Forecast & 2 Simulations / month
                            </li>
                            <li class="flex items-center gap-2 text-muted">
                                <i class="pi pi-times text-rose-400"></i> Current Month Data View Only
                            </li>
                        </ul>
                    </div>
                    <div class="text-xs text-secondary text-center p-3 rounded-xl bg-secondary border border-default font-medium">
                        Always free with monthly limits
                    </div>
                </div>
            </div>

            <div class="pt-4">
                <router-link to="/dashboard" class="text-xs font-semibold text-accent-blue hover:underline">
                    &larr; Back to Dashboard
                </router-link>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';
import { useAuthStore } from '@/stores/auth';
import { useToast } from 'primevue/usetoast';

const authStore = useAuthStore();
const toast = useToast();
const isLoading = ref(false);

const handleUpgrade = async () => {
    if (authStore.isPremium) {
        isLoading.value = true;
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_API_BASE_URL}/payment/portal`,
                {},
                { withCredentials: true }
            );
            if (response.data?.portalUrl) {
                window.location.href = response.data.portalUrl;
            } else {
                throw new Error("Did not receive a valid portal URL.");
            }
        } catch (error) {
            console.error('Portal error:', error);
            toast.add({
                severity: 'error',
                summary: 'Access Failed',
                detail: error.response?.data?.message || 'Failed to access subscription portal.',
                life: 5000,
            });
        } finally {
            isLoading.value = false;
        }
        return;
    }

    isLoading.value = true;
    try {
        const response = await axios.post(
            `${import.meta.env.VITE_API_BASE_URL}/payment/checkout`,
            {},
            { withCredentials: true }
        );
        const sessionUrl = response.data?.sessionUrl;
        if (sessionUrl) {
            window.location.href = sessionUrl;
        } else {
            throw new Error("Did not receive a valid session URL.");
        }
    } catch (error) {
        console.error('Checkout error:', error);
        toast.add({
            severity: 'error',
            summary: 'Upgrade Failed',
            detail: error.response?.data?.message || 'Failed to initiate checkout.',
            life: 5000,
        });
    } finally {
        isLoading.value = false;
    }
};
</script>
