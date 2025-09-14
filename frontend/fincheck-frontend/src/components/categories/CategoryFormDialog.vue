<!-- filepath: /home/gideon-etowa/workspace/code/fincheck/frontend/fincheck-frontend/src/components/categories/CategoryFormDialog.vue -->
<template>
    <Dialog :visible="visible" @update:visible="$emit('update:visible', $event)" modal
        :header="isEdit ? 'Edit Category' : 'Add Category'" :style="{ width: '500px' }">
        <form @submit.prevent="handleSubmit" class="space-y-4">
            <!-- Category Name -->
            <div>
                <label for="categoryName" class="block text-sm font-medium text-secondary mb-2">
                    Category Name *
                </label>
                <InputText id="categoryName" v-model="form.name" placeholder="Enter category name"
                    :class="{ 'p-invalid': errors.name }" class="w-full" />
                <small v-if="errors.name" class="text-accent-red">{{ errors.name }}</small>
            </div>

            <!-- Description -->
            <div>
                <label for="categoryDescription" class="block text-sm font-medium text-secondary mb-2">
                    Description
                </label>
                <Textarea id="categoryDescription" v-model="form.description"
                    placeholder="Enter category description (optional)" rows="3" class="w-full" />
            </div>

            <!-- Override Notice (for global defaults) -->
            <div v-if="isEdit && category?.isGlobalDefault" class="p-3 bg-yellow-50 border border-yellow-200 rounded">
                <div class="flex items-start gap-2">
                    <i class="pi pi-info-circle text-yellow-600 mt-0.5"></i>
                    <div>
                        <p class="text-sm text-yellow-800">
                            <strong>Note:</strong> Editing this default category will create your personal version.
                            The original default will be replaced with your custom version.
                        </p>
                    </div>
                </div>
            </div>
        </form>

        <template #footer>
            <div class="flex gap-2">
                <Button label="Cancel" severity="secondary" outlined @click="handleCancel" />
                <Button :label="isEdit ? 'Update' : 'Create'" :loading="isSubmitting" @click="handleSubmit" />
            </div>
        </template>
    </Dialog>
</template>

<script setup>
import { ref, watch, computed } from 'vue';

const props = defineProps({
    visible: {
        type: Boolean,
        default: false
    },
    category: {
        type: Object,
        default: null
    },
    isEdit: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits(['update:visible', 'save']);

const form = ref({
    name: '',
    description: ''
});

const errors = ref({});
const isSubmitting = ref(false);

// Watch for category changes to populate form
watch(() => props.category, (newCategory) => {
    if (newCategory) {
        form.value = {
            name: newCategory.name || '',
            description: newCategory.description || ''
        };
    }
}, { immediate: true });

// Reset form when dialog closes
watch(() => props.visible, (isVisible) => {
    if (!isVisible) {
        resetForm();
    }
});

const validateForm = () => {
    errors.value = {};

    if (!form.value.name?.trim()) {
        errors.value.name = 'Category name is required';
    } else if (form.value.name.trim().length > 50) {
        errors.value.name = 'Category name must be 50 characters or less';
    }

    return Object.keys(errors.value).length === 0;
};

const handleSubmit = async () => {
    if (!validateForm()) return;

    isSubmitting.value = true;

    try {
        const categoryData = {
            name: form.value.name.trim(),
            description: form.value.description?.trim() || undefined
        };

        emit('save', categoryData);
    } finally {
        isSubmitting.value = false;
    }
};

const handleCancel = () => {
    emit('update:visible', false);
};

const resetForm = () => {
    form.value = {
        name: '',
        description: ''
    };
    errors.value = {};
    isSubmitting.value = false;
};
</script>