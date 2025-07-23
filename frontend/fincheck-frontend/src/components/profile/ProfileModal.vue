<template>
    <Dialog :visible="visible" modal :header="currentView === 'main' ? 'Profile Settings' : getHeaderTitle()"
        :style="{ width: '500px' }" :closable="true" @update:visible="handleVisibilityChange">

        <!-- Main Profile Menu -->
        <div v-if="currentView === 'main'" class="space-y-4">
            <div class="grid grid-cols-1 gap-4">
                <Button label="Update Profile" icon="pi pi-user" class="w-full justify-start"
                    @click="currentView = 'profile'" severity="secondary" />

                <Button label="Change Password" icon="pi pi-lock" class="w-full justify-start"
                    @click="currentView = 'password'" severity="secondary" />

                <Button label="Delete Account" icon="pi pi-trash" class="w-full justify-start"
                    @click="currentView = 'delete'" severity="danger" />
            </div>
        </div>

        <!-- Update Profile Form -->
        <div v-else-if="currentView === 'profile'" class="space-y-4">
            <div v-if="message" :class="messageClass" class="p-3 rounded text-sm">
                {{ message }}
            </div>

            <div>
                <label for="name" class="block text-sm font-medium mb-1">Name</label>
                <InputText id="name" v-model="profileForm.name" class="w-full" placeholder="Enter your name"
                    :disabled="loading" />
            </div>

            <div>
                <label for="email" class="block text-sm font-medium mb-1">Email</label>
                <InputText id="email" v-model="profileForm.email" type="email" class="w-full"
                    placeholder="Enter your email" :disabled="loading" />
            </div>

            <div class="flex gap-2 pt-4">
                <Button label="Update" @click="handleUpdateProfile" :loading="loading" class="flex-1" />
                <Button label="Back" @click="currentView = 'main'" severity="secondary" />
            </div>
        </div>

        <!-- Change Password Form -->
        <div v-else-if="currentView === 'password'" class="space-y-4">
            <div v-if="message" :class="messageClass" class="p-3 rounded text-sm">
                {{ message }}
            </div>

            <div>
                <label for="currentPassword" class="block text-sm font-medium mb-1">Current Password</label>
                <Password id="currentPassword" v-model="passwordForm.currentPassword" class="w-full"
                    placeholder="Enter current password" :disabled="loading" :feedback="false" toggleMask />
            </div>

            <div>
                <label for="newPassword" class="block text-sm font-medium mb-1">New Password</label>
                <Password id="newPassword" v-model="passwordForm.newPassword" class="w-full"
                    placeholder="Enter new password" :disabled="loading" toggleMask />
            </div>

            <div>
                <label for="confirmNewPassword" class="block text-sm font-medium mb-1">Confirm New Password</label>
                <Password id="confirmNewPassword" v-model="passwordForm.confirmNewPassword" class="w-full"
                    placeholder="Confirm new password" :disabled="loading" :feedback="false" toggleMask />
            </div>

            <div class="flex gap-2 pt-4">
                <Button label="Change Password" @click="handleChangePassword" :loading="loading" class="flex-1" />
                <Button label="Back" @click="currentView = 'main'" severity="secondary" />
            </div>
        </div>

        <!-- Delete Account Confirmation -->
        <div v-else-if="currentView === 'delete'" class="space-y-4">
            <div class="bg-red-50 border border-red-200 p-4 rounded">
                <div class="flex items-center mb-2">
                    <i class="pi pi-exclamation-triangle text-red-600 mr-2"></i>
                    <h4 class="text-red-800 font-semibold">Delete Account</h4>
                </div>
                <p class="text-red-700 text-sm">
                    This action cannot be undone. This will permanently delete your account and all associated data.
                </p>
            </div>

            <div v-if="message" :class="messageClass" class="p-3 rounded text-sm">
                {{ message }}
            </div>

            <div>
                <label for="confirmDelete" class="block text-sm font-medium mb-1">
                    Type "DELETE" to confirm
                </label>
                <InputText id="confirmDelete" v-model="deleteConfirmation" class="w-full" placeholder="DELETE"
                    :disabled="loading" />
            </div>

            <div class="flex gap-2 pt-4">
                <Button label="Delete Account" @click="handleDeleteAccount" :loading="loading"
                    :disabled="deleteConfirmation !== 'DELETE'" severity="danger" class="flex-1" />
                <Button label="Back" @click="currentView = 'main'" severity="secondary" />
            </div>
        </div>
    </Dialog>
</template>

<script setup>
import { ref, watch } from 'vue';
import { updatePassword, updateProfile as updateUserProfile, deleteAccount as deleteUserAccount } from '@/services/auth';
import { useRouter } from 'vue-router';

const props = defineProps({
    visible: {
        type: Boolean,
        default: false
    },
    user: {
        type: Object,
        default: () => ({})
    }
});

const emit = defineEmits(['close', 'updated', 'logout']);

const router = useRouter();

const currentView = ref('main');
const loading = ref(false);
const message = ref('');
const messageClass = ref('');

// Form data
const profileForm = ref({
    name: '',
    email: ''
});

const passwordForm = ref({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
});

const deleteConfirmation = ref('');

// Handle dialog visibility changes
const handleVisibilityChange = (newVisible) => {
    if (!newVisible) {
        emit('close');
    }
};

// Watch for user prop changes to populate form
watch(() => props.user, (newUser) => {
    if (newUser) {
        profileForm.value.name = newUser.name || '';
        profileForm.value.email = newUser.email || '';
    }
}, { immediate: true });

// Reset forms when modal is closed
watch(() => props.visible, (newVisible) => {
    if (!newVisible) {
        resetForms();
        currentView.value = 'main';
    }
});

const getHeaderTitle = () => {
    switch (currentView.value) {
        case 'profile': return 'Update Profile';
        case 'password': return 'Change Password';
        case 'delete': return 'Delete Account';
        default: return 'Profile Settings';
    }
};

const setMessage = (text, type) => {
    message.value = text;
    messageClass.value = type === 'success'
        ? 'bg-green-100 text-green-700 border border-green-300'
        : 'bg-red-100 text-red-700 border border-red-300';
};

const resetForms = () => {
    profileForm.value = { name: '', email: '' };
    passwordForm.value = { currentPassword: '', newPassword: '', confirmNewPassword: '' };
    deleteConfirmation.value = '';
    message.value = '';
    messageClass.value = '';
};

const handleUpdateProfile = async () => {
    if (!profileForm.value.name || !profileForm.value.email) {
        setMessage('Please fill in all fields', 'error');
        return;
    }

    loading.value = true;
    message.value = '';

    try {
        const res = await updateUserProfile(profileForm.value);
        if (res.data?.success) {
            setMessage('Profile updated successfully', 'success');
            emit('updated', res.data.data);
            setTimeout(() => {
                currentView.value = 'main';
            }, 1500);
        }
    } catch (err) {
        console.error('Profile update error:', err);
        const errorMessage = err.response?.data?.message || 'Failed to update profile';
        setMessage(errorMessage, 'error');
    } finally {
        loading.value = false;
    }
};

const handleChangePassword = async () => {
    if (!passwordForm.value.currentPassword || !passwordForm.value.newPassword || !passwordForm.value.confirmNewPassword) {
        setMessage('Please fill in all fields', 'error');
        return;
    }

    if (passwordForm.value.newPassword !== passwordForm.value.confirmNewPassword) {
        setMessage('New passwords do not match', 'error');
        return;
    }

    if (passwordForm.value.newPassword.length < 8) {
        setMessage('New password must be at least 8 characters long', 'error');
        return;
    }

    loading.value = true;
    message.value = '';

    try {
        const res = await updatePassword(props.user.id, {
            currentPassword: passwordForm.value.currentPassword,
            newPassword: passwordForm.value.newPassword
        });

        if (res.data?.success) {
            setMessage('Password changed successfully', 'success');
            passwordForm.value = { currentPassword: '', newPassword: '', confirmNewPassword: '' };
            setTimeout(() => {
                currentView.value = 'main';
            }, 1500);
        }
    } catch (err) {
        console.error('Password change error:', err);
        const errorMessage = err.response?.data?.message || 'Failed to change password';
        setMessage(errorMessage, 'error');
    } finally {
        loading.value = false;
    }
};

const handleDeleteAccount = async () => {
    if (deleteConfirmation.value !== 'DELETE') {
        setMessage('Please type "DELETE" to confirm', 'error');
        return;
    }

    loading.value = true;
    message.value = '';

    try {
        const res = await deleteUserAccount(props.user.id);
        if (res.data?.success) {
            setMessage('Account deleted successfully', 'success');
            setTimeout(() => {
                // Emit logout event for parent component to handle
                emit('logout');
                router.push('/login');
                emit('close');
            }, 1500);
        }
    } catch (err) {
        console.error('Account deletion error:', err);
        const errorMessage = err.response?.data?.message || 'Failed to delete account';
        setMessage(errorMessage, 'error');
    } finally {
        loading.value = false;
    }
};
</script>