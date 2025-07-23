<template>
    <header class="bg-white shadow-sm border-b px-6 py-4">
        <div class="flex justify-between items-center">
            <!-- Existing header content -->
            <div class="flex items-center">
                <h1 class="text-xl font-bold text-blue-600">FinCheck</h1>
            </div>

            <!-- Add ProfileSettings here -->
            <div class="flex items-center space-x-4">
                <!-- Always show button for testing -->
                <ProfileSettings :user="testUser" @profile-updated="handleProfileUpdate"
                    @user-logout="handleUserLogout" />

                <!-- Debug button to load user manually -->
                <Button label="Load User" @click="loadUser" size="small" />
            </div>
        </div>
    </header>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import ProfileSettings from '@/components/profile/ProfileSettings.vue';
import { getCurrentUser } from '@/services/auth';

const currentUser = ref({});

// Test user data for debugging
const testUser = ref({
    id: '123',
    name: 'Test User',
    email: 'test@example.com'
});

const handleProfileUpdate = (updatedUser) => {
    currentUser.value = { ...currentUser.value, ...updatedUser };
    console.log('Profile updated:', updatedUser);
};

const handleUserLogout = () => {
    currentUser.value = {};
    console.log('User logged out');
};

const loadUser = async () => {
    try {
        console.log('Manual user load...');
        const res = await getCurrentUser();
        console.log('Response:', res);

        if (res.data?.data?.user) {
            currentUser.value = res.data.data.user;
            testUser.value = res.data.data.user; // Update test user too
        }
    } catch (err) {
        console.error('Load user error:', err);
    }
};

onMounted(async () => {
    await loadUser();
});
</script>