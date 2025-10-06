<template>
    <div class="space-y-6">
        <h1 class="text-2xl font-bold text-primary">Settings</h1>
        <div v-if="authStore.userProfile" class="max-w-md">
            <div class="bg-primary p-6 rounded-lg shadow-sm border border-default">
                <h2 class="text-lg font-semibold text-primary mb-4">Profile Management</h2>
                <p class="text-sm text-secondary mb-6">
                    Click the button below to update your name, email, change your password, or delete your account.
                </p>
                <ProfileSettings :user="authStore.userProfile" @profile-updated="handleProfileUpdate"
                    @user-logout="handleUserLogout" />
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

const authStore = useAuthStore();

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