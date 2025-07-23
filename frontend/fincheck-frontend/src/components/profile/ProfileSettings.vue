<template>
    <div>
        <Button label="Profile Settings" icon="pi pi-cog" @click="showModal = true" severity="secondary" size="small" />

        <ProfileModal :visible="showModal" :user="user" @close="showModal = false" @updated="handleProfileUpdate"
            @logout="handleLogout" />
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { logout } from '@/services/auth';
import ProfileModal from './ProfileModal.vue';

const props = defineProps({
    user: {
        type: Object,
        required: true
    }
});

const emit = defineEmits(['profile-updated', 'user-logout']);

const router = useRouter();
const showModal = ref(false);

const handleProfileUpdate = (updatedUser) => {
    emit('profile-updated', updatedUser);
};

const handleLogout = async () => {
    try {
        await logout();
        emit('user-logout');
        router.push('/login');
        showModal.value = false;
    } catch (err) {
        console.error('Logout error:', err);
        // Even if logout fails, redirect to login
        router.push('/login');
    }
};
</script>