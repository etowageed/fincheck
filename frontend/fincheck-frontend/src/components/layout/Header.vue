<template>
    <header class="bg-white shadow-sm border-b px-6 py-4 fixed top-0 left-0 right-0 z-20">
        <div class="flex justify-between items-center">
            <!-- Existing header content -->
            <div class="flex items-center">
                <h1 class="text-xl font-bold text-blue-600">FinCheck</h1>
            </div>

            <!-- User Profile Section -->
            <div class="flex items-center space-x-4">
                <ProfileSettings :user="authStore.userProfile" @profile-updated="handleProfileUpdate"
                    @user-logout="handleUserLogout" />
            </div>
        </div>
    </header>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth';
import ProfileSettings from '@/components/profile/ProfileSettings.vue';

const authStore = useAuthStore();

const handleProfileUpdate = async (updatedUser) => {
    const result = await authStore.updateProfile(updatedUser);
    if (!result.success) {
        console.error('Profile update failed:', result.error);
    }
};

const handleUserLogout = async () => {
    const result = await authStore.logout();
    if (!result.success) {
        console.error('Logout failed:', result.error);
    }
};
</script>