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
import { useAuthStore } from '@/stores/auth';
import ProfileSettings from '@/components/profile/ProfileSettings.vue';
import ExportModal from '@/components/common/ExportModal.vue'; //  Import ExportModal

const authStore = useAuthStore();
const router = useRouter();
const showExportModal = ref(false); // State for the export modal

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
