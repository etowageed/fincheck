<template>
    <div class="min-h-screen flex items-center justify-center bg-tertiary py-12 px-4">
        <div
            class="max-w-2xl mx-auto p-6 sm:p-8 bg-primary shadow-sm rounded-lg text-center space-y-6 border border-default">
            <h1 class="text-3xl font-extrabold tracking-tight text-primary">Plete Finance Plans</h1>
            <p class="text-base text-secondary">Compare Free vs Premium plans and unlock unlimited AI financial
                intelligence.</p>

            <!-- Status Indicator -->
            <Message v-if="authStore.isPremium" severity="success" :closable="false">
                🎉 You are currently a **Premium** subscriber! Thank you for your support.
            </Message>
            <Message v-else-if="authStore.isAuthenticated" severity="info" :closable="false">
                Upgrade to Premium to unlock unlimited AI entries, receipt scans, financial forecasts, and 10+ year data
                history!
            </Message>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-left pt-2">
                <!-- Premium Card -->
                <div
                    class="p-6 border-2 border-accent-blue rounded-lg bg-secondary flex flex-col justify-between relative shadow-sm">
                    <div
                        class="absolute -top-3 right-4 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-accent-blue text-white">
                        Recommended
                    </div>
                    <div>
                        <h3 class="font-bold tracking-tight text-lg text-accent-blue mb-1">Premium Tier</h3>
                        <p class="text-xs text-secondary mb-4">Unlimited standard usage across all features.</p>
                        <ul class="text-xs text-secondary space-y-2.5 mb-6">
                            <li class="flex items-center gap-2 font-medium text-primary">
                                <i class="pi pi-check-circle text-accent-green font-bold"></i> Unlimited Magic Entries
                            </li>
                            <li class="flex items-center gap-2 font-medium text-primary">
                                <i class="pi pi-check-circle text-accent-green font-bold"></i> Unlimited Receipt &amp;
                                Note Scans
                            </li>
                            <li class="flex items-center gap-2 font-medium text-primary">
                                <i class="pi pi-check-circle text-accent-green font-bold"></i> Unlimited AI Coach &amp;
                                Ask Plete
                            </li>
                            <li class="flex items-center gap-2 font-medium text-primary">
                                <i class="pi pi-check-circle text-accent-green font-bold"></i> Budget Forecasts &amp;
                                Scenarios
                            </li>
                            <li class="flex items-center gap-2 font-medium text-primary">
                                <i class="pi pi-check-circle text-accent-green font-bold"></i> Unlimited History (10+
                                Years)
                            </li>
                            <li class="flex items-center gap-2 font-medium text-primary">
                                <i class="pi pi-check-circle text-accent-green font-bold"></i> Data Export (PDF/Excel)
                            </li>
                        </ul>
                    </div>

                    <SubscriptionCtaButton action="auto" icon="pi pi-sparkles" size="large" class="w-full"
                        :disabled="!authStore.isAuthenticated" />
                </div>

                <!-- Free Card -->
                <div class="p-6 border border-default rounded-lg bg-primary flex flex-col justify-between shadow-sm">
                    <div>
                        <h3 class="font-bold tracking-tight text-lg text-primary mb-1">Free Tier</h3>
                        <p class="text-xs text-secondary mb-4">Generous monthly allowances renewed automatically.</p>
                        <ul class="text-xs text-secondary space-y-2.5 mb-6 font-numeric">
                            <li class="flex items-center gap-2">
                                <i class="pi pi-check-circle text-accent-green"></i> 15 Magic Entries / month
                            </li>
                            <li class="flex items-center gap-2">
                                <i class="pi pi-check-circle text-accent-green"></i> 3 Receipt Scans / month
                            </li>
                            <li class="flex items-center gap-2">
                                <i class="pi pi-check-circle text-accent-green"></i> 3 AI Coach Questions / month
                            </li>
                            <li class="flex items-center gap-2">
                                <i class="pi pi-check-circle text-accent-green"></i> 5 Ask Plete Messages / month
                            </li>
                            <li class="flex items-center gap-2">
                                <i class="pi pi-check-circle text-accent-green"></i> 1 Forecast &amp; 2 Simulations /
                                month
                            </li>
                            <li class="flex items-center gap-2 text-muted">
                                <i class="pi pi-times text-accent-red"></i> Current Month Data View Only
                            </li>
                        </ul>
                    </div>
                    <div
                        class="text-xs text-secondary text-center p-3 rounded-lg bg-secondary border border-default font-medium">
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
import { useAuthStore } from '@/stores/auth';
import SubscriptionCtaButton from '@/components/common/SubscriptionCtaButton.vue';

const authStore = useAuthStore();
</script>
