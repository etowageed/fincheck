<template>
    <Dialog :visible="props.visible" modal :header="getHeaderTitle()" :style="{ width: '500px' }" :closable="true"
        @update:visible="handleVisibilityChange">
        <Toast />

        <div v-if="currentView === 'main'" class="space-y-3">
            <Button label="Update Profile" icon="pi pi-user" @click="currentView = 'profile'"
                class="w-full !justify-start p-button-secondary p-button-text" />
            <Button label="Change Password" icon="pi pi-lock" @click="currentView = 'password'"
                class="w-full !justify-start p-button-secondary p-button-text" />
            <Button label="Delete Account" icon="pi pi-trash" @click="currentView = 'delete'"
                class="w-full !justify-start p-button-danger p-button-text" />
        </div>

        <div v-else-if="currentView === 'profile'" class="space-y-4">
            <div>
                <label for="profileName" class="block text-sm font-medium text-secondary mb-2">Name</label>
                <InputText id="profileName" v-model="profileForm.name" class="w-full" />
            </div>
            <div>
                <label for="profileEmail" class="block text-sm font-medium text-secondary mb-2">Email</label>
                <InputText id="profileEmail" v-model="profileForm.email" type="email" class="w-full" />
            </div>
            <div>
                <label for="preferredCurrency" class="block text-sm font-medium text-secondary mb-2">Preferred
                    Currency</label>
                <Dropdown id="preferredCurrency" v-model="profileForm.preferredCurrency" :options="currencyOptions"
                    optionLabel="label" optionValue="value" placeholder="Select Currency" class="w-full" filter
                    :disabled="authStore.isLoading" />
            </div>
            <div>
                <label for="preferredLocale" class="block text-sm font-medium text-secondary mb-2">Preferred
                    Locale</label>
                <Dropdown id="preferredLocale" v-model="profileForm.preferredLocale" :options="localeOptions"
                    optionLabel="label" optionValue="value" placeholder="Select Locale" class="w-full" filter
                    :disabled="authStore.isLoading" />
            </div>

            <div class="flex justify-end gap-2 pt-4">
                <Button label="Back" @click="currentView = 'main'" severity="secondary" outlined />
                <Button label="Save Changes" @click="handleUpdateProfile" :loading="authStore.isLoading" />
            </div>
        </div>

        <div v-else-if="currentView === 'password'" class="space-y-4">
            <div>
                <label for="currentPassword" class="block text-sm font-medium text-secondary mb-2">Current
                    Password</label>
                <Password id="currentPassword" v-model="passwordForm.currentPassword" class="w-full" :feedback="false"
                    toggleMask inputClass="w-full" />
            </div>
            <div>
                <label for="newPassword" class="block text-sm font-medium text-secondary mb-2">New Password</label>
                <Password id="newPassword" v-model="passwordForm.newPassword" class="w-full" :feedback="true" toggleMask
                    inputClass="w-full" />
            </div>
            <div>
                <label for="confirmNewPassword" class="block text-sm font-medium text-secondary mb-2">Confirm New
                    Password</label>
                <Password id="confirmNewPassword" v-model="passwordForm.confirmNewPassword" class="w-full"
                    :feedback="false" toggleMask inputClass="w-full" />
            </div>
            <div class="flex justify-end gap-2 pt-4">
                <Button label="Back" @click="currentView = 'main'" severity="secondary" outlined />
                <Button label="Change Password" @click="handleChangePassword" :loading="authStore.isLoading" />
            </div>
        </div>

        <div v-else-if="currentView === 'delete'" class="space-y-4">
            <div class="p-3 bg-red-50 border border-red-200 rounded">
                <p class="text-sm text-red-800">
                    <strong>Warning:</strong> This action is irreversible and will permanently delete all your data.
                </p>
            </div>
            <div>
                <label for="deleteConfirm" class="block text-sm font-medium text-secondary mb-2">
                    To confirm, please type <strong>DELETE</strong> into the box below.
                </label>
                <InputText id="deleteConfirm" v-model="deleteConfirmation" class="w-full" />
            </div>
            <div class="flex justify-end gap-2 pt-4">
                <Button label="Back" @click="currentView = 'main'" severity="secondary" outlined />
                <Button label="Delete My Account" @click="handleDeleteAccount" severity="danger"
                    :loading="authStore.isLoading" />
            </div>
        </div>
    </Dialog>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';

// 1. Correctly define the props the component receives
const props = defineProps({
    visible: {
        type: Boolean,
        default: false
    },
    user: {
        type: Object,
        default: null
    }
});

const emit = defineEmits(['close', 'updated', 'logout']);
const router = useRouter();
const authStore = useAuthStore();
const toast = useToast();

const currentView = ref('main');
// MODIFIED: Added preferredCurrency and preferredLocale to the form
const profileForm = ref({ name: '', email: '', preferredCurrency: 'USD', preferredLocale: 'en-US' });
const passwordForm = ref({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
const deleteConfirmation = ref('');

// 💰 NEW: Currency and Locale Options (A simplified list)
const currencyOptions = [
    { label: 'US Dollar ($) - USD', value: 'USD' },
    { label: 'Euro (€) - EUR', value: 'EUR' },
    { label: 'Nigerian Naira (₦) - NGN', value: 'NGN' },
    { label: 'British Pound (£) - GBP', value: 'GBP' },
    { label: 'Japanese Yen (¥) - JPY', value: 'JPY' },
];

const localeOptions = [
    { label: 'English (US)', value: 'en-US' },
    { label: 'English (UK)', value: 'en-GB' },
    { label: 'French (France)', value: 'fr-FR' },
    { label: 'German (Germany)', value: 'de-DE' },
];

// 2. Define the missing function to handle the dialog closing
const handleVisibilityChange = (value) => {
    // When the dialog's visibility changes to false (e.g., by clicking the 'X'),
    // we emit the 'close' event to the parent component.
    if (!value) {
        emit('close');
    }
};

// Watch for prop changes to populate form
watch(() => props.user, (newUser) => {
    if (newUser) {
        // MODIFIED: Populate new fields from user prop
        profileForm.value = {
            name: newUser.name,
            email: newUser.email,
            preferredCurrency: newUser.preferredCurrency || 'USD',
            preferredLocale: newUser.preferredLocale || 'en-US'
        };
    }
}, { immediate: true });

// Watch for visibility changes to reset the view
watch(() => props.visible, (isVisible) => {
    if (!isVisible) {
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

const handleUpdateProfile = async () => {
    // VALIDATION: Check for required fields (Name/Email are required by Mongoose, but basic check helps UX)
    if (!profileForm.value.name?.trim() || !profileForm.value.email?.trim()) {
        toast.add({ severity: 'error', summary: 'Validation Error', detail: 'Name and Email are required.', life: 3000 });
        return;
    }

    const result = await authStore.updateProfile(profileForm.value);
    if (result.success) {
        toast.add({ severity: 'success', summary: 'Success', detail: 'Profile updated successfully', life: 3000 });
        emit('updated', profileForm.value);
        setTimeout(() => { currentView.value = 'main'; }, 1500);
    }
};

const handleChangePassword = async () => {
    if (passwordForm.value.newPassword !== passwordForm.value.confirmNewPassword) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'New passwords do not match', life: 3000 });
        return;
    }

    const result = await authStore.updatePassword({
        currentPassword: passwordForm.value.currentPassword,
        newPassword: passwordForm.value.newPassword
    });

    if (result.success) {
        toast.add({ severity: 'success', summary: 'Success', detail: 'Password changed successfully', life: 3000 });
        passwordForm.value = { currentPassword: '', newPassword: '', confirmNewPassword: '' };
        setTimeout(() => { currentView.value = 'main'; }, 1500);
    }
};

const handleDeleteAccount = async () => {
    if (deleteConfirmation.value !== 'DELETE') {
        toast.add({ severity: 'warn', summary: 'Confirmation Needed', detail: 'Please type DELETE to confirm.', life: 3000 });
        return;
    }

    // Call the store action instead of the service directly
    const result = await authStore.deleteAccount();

    if (result.success) {
        toast.add({ severity: 'success', summary: 'Success', detail: 'Account deleted successfully', life: 3000 });
        setTimeout(() => {
            // The user state is already cleared by the store, so we just need to redirect.
            // The emit('logout') and emit('close') are still good practice.
            emit('logout');
            router.push('/login');
            emit('close');
        }, 1500);
    }
    // No 'catch' block is needed, as errors are handled globally and by the store.
};
</script>