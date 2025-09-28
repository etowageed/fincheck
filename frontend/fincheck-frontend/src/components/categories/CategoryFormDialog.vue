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

            <!-- Add submit error display -->
            <small v-if="errors.submit" class="block text-accent-red mt-2">
                {{ errors.submit }}
            </small>
        </form>

        <template #footer>
            <div class="flex gap-2">
                <Button label="Cancel" severity="secondary" outlined @click="handleCancel" :disabled="isSubmitting" />
                <Button :label="isEdit ? 'Update' : 'Create'" :loading="isSubmitting" @click="handleSubmit" />
            </div>
        </template>
    </Dialog>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import { useCategoriesStore } from '@/stores/categories';

const categoriesStore = useCategoriesStore();

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
const isSubmitting = computed(() => categoriesStore.isLoading);

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

    try {
        const categoryData = {
            name: form.value.name.trim(),
            description: form.value.description?.trim() || undefined
        };

        let result;
        if (props.isEdit) {
            result = await categoriesStore.updateCategory(props.category._id, categoryData);
        } else {
            result = await categoriesStore.createCategory(categoryData);
        }

        // Check both possible success response formats
        if (result.success && (result.data || result.category)) {
            // Emit the category data
            emit('save', result.data || result.category);
            // Close the dialog
            emit('update:visible', false);
            // Reset the form
            resetForm();
            // Refresh the categories list
            await categoriesStore.fetchCategories();
        } else {
            console.error('Category save failed:', result);
            errors.value.submit = result.error || 'Failed to save category';
        }
    } catch (error) {
        console.error('Category save error:', error);
        errors.value.submit = 'Failed to save category';
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
};
</script>