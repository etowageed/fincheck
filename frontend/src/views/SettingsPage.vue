<template>
    <div class="space-y-6">
        <h1 class="text-2xl md:text-3xl font-extrabold tracking-tight text-primary leading-tight">Settings</h1>
        <div v-if="authStore.userProfile" class="max-w-md space-y-6">
            <div class="bg-primary p-6 rounded-lg shadow-sm border border-default">
                <h2 class="text-xl font-bold tracking-tight text-primary leading-snug mb-4">Profile Management</h2>
                <p class="text-sm text-secondary mb-6">
                    Click the button below to update your name, email, change your password, or delete your account.
                </p>
                <ProfileSettings :user="authStore.userProfile" />
            </div>

            <!-- Subscription Management Section -->
            <div class="bg-primary p-6 rounded-lg shadow-sm border border-default">
                <h2 class="text-xl font-bold tracking-tight text-primary leading-snug mb-4">Subscription</h2>
                <div v-if="authStore.isPremium" class="space-y-4">
                    <p class="text-sm text-secondary">
                        You are currently on the <span class="font-bold text-accent-green">Premium Plan</span>.
                    </p>
                    <SubscriptionCtaButton action="portal" label="Manage Subscription" />
                </div>
                <div v-else class="space-y-4">
                    <p class="text-sm text-secondary">
                        You are on the <span class="font-bold text-accent-blue">Free Plan</span>. Upgrade to unlock all
                        features.
                    </p>
                    <SubscriptionCtaButton action="pricing" label="Upgrade now" severity="warning" />
                </div>
            </div>

            <!-- Data Export Section -->
            <div class="bg-primary p-6 rounded-lg shadow-sm border border-default">
                <h2 class="text-xl font-bold tracking-tight text-primary leading-snug mb-4">Data Export</h2>
                <p class="text-sm text-secondary mb-6">
                    Export your full financial history, including all transactions and budget information, as Excel or
                    PDF.
                </p>
                <ExportButton
                    label="Export All Data"
                    default-type="all"
                    :size="undefined"
                    gate-premium
                />
            </div>
        </div>
        <div v-else>
            <p class="text-secondary">Loading user profile...</p>
        </div>
    </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth';
import ProfileSettings from '@/components/profile/ProfileSettings.vue';
import ExportButton from '@/components/common/ExportButton.vue';
import SubscriptionCtaButton from '@/components/common/SubscriptionCtaButton.vue';

const authStore = useAuthStore();
</script>
