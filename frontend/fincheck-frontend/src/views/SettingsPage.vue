<template>
    <div class="space-y-6">
        <h1 class="text-2xl font-bold text-primary">Settings</h1>
        <div v-if="authStore.userProfile" class="max-w-md space-y-6">
            <div class="bg-primary p-6 rounded-lg shadow-sm border border-default">
                <h2 class="text-lg font-semibold text-primary mb-4">Profile Management</h2>
                <p class="text-sm text-secondary mb-6">
                    Click the button below to update your name, email, change your password, or delete your account.
                </p>
                <ProfileSettings :user="authStore.userProfile" @profile-updated="handleProfileUpdate"
                    @user-logout="handleUserLogout" />
            </div>

            <!-- Subscription Management Section -->
            <div class="bg-primary p-6 rounded-lg shadow-sm border border-default">
                <h2 class="text-lg font-semibold text-primary mb-4">Subscription</h2>
                <div v-if="authStore.isPremium" class="space-y-4">
                    <p class="text-sm text-secondary">
                        You are currently on the <span class="font-bold text-accent-green">Premium Plan</span>.
                    </p>
                    <Button label="Manage Subscription" icon="pi pi-cog" severity="info" :loading="isPortalLoading"
                        @click="handlePortalClick" />
                </div>
                <div v-else class="space-y-4">
                    <p class="text-sm text-secondary">
                        You are on the <span class="font-bold text-accent-blue">Free Plan</span>. Upgrade to unlock all
                        features.
                    </p>
                    <Button label="Upgrade now" icon="pi pi-sparkles" severity="warning"
                        @click="router.push('/pricing')" />
                </div>
            </div>

            <!--  : Data Export Section -->
            <div class="bg-primary p-6 rounded-lg shadow-sm border border-default">
                <h2 class="text-lg font-semibold text-primary mb-4">Data Export</h2>
                <p class="text-sm text-secondary mb-6">
                    Export your full financial history, including all transactions and budget information, as Excel or
                    PDF.
                </p>
                <!-- MODIFIED: Check subscription status to gate the button -->
                <Button :label="authStore.isPremium ? 'Export All Data' : 'Upgrade to Export Data'"
                    :icon="authStore.isPremium ? 'pi pi-download' : 'pi pi-lock'"
                    :severity="authStore.isPremium ? 'help' : 'secondary'" @click="handleExportClick" />
                <!-- END  : Data Export Section -->
            </div>
        </div>
        <div v-else>
            <p class="text-secondary">Loading user profile...</p>
        </div>

        <!--  : Export Modal for All Data -->
        <ExportModal v-model:visible="showExportModal" default-type="all" />
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { useToast } from 'primevue/usetoast';
import { useAuthStore } from '@/stores/auth';
import ProfileSettings from '@/components/profile/ProfileSettings.vue';
import ExportModal from '@/components/common/ExportModal.vue'; //  Import ExportModal

const authStore = useAuthStore();
const router = useRouter();
const toast = useToast();
const showExportModal = ref(false); // State for the export modal
const isPortalLoading = ref(false);

const handlePortalClick = async () => {
    isPortalLoading.value = true;
    try {
        const response = await axios.post(
            `${import.meta.env.VITE_API_BASE_URL}/payment/portal`,
            {},
            { withCredentials: true }
        );
        if (response.data.portalUrl) {
            window.location.href = response.data.portalUrl;
        } else {
            throw new Error("Invalid portal URL");
        }
    } catch (error) {
        console.error("Portal error", error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: error.response?.data?.message || 'Failed to open subscription portal.',
            life: 5000
        });
    } finally {
        isPortalLoading.value = false;
    }
};

const handleExportClick = () => {
    if (authStore.isPremium) {
        showExportModal.value = true;
    } else {
        router.push('/pricing');
    }
};

// These handlers are here to catch the events, though the
// ProfileSettings component and its modal already handle the core logic.
const handleProfileUpdate = () => {
    // You could add a success toast here if desired.
    console.log('Profile updated successfully.');
};

const handleUserLogout = () => {
    // The component handles the actual logout and redirect.
    console.log('User has logged out.');
};
</script>
