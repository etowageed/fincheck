<template>
    <div class="space-y-6">
        <div class="flex justify-between items-center">
            <h1 class="text-2xl font-bold text-gray-800">Categories</h1>
            <Button label="Add Category" icon="pi pi-plus" @click="showAddCategoryDialog = true"
                class="bg-accent-blue hover:bg-blue-700" />
        </div>

        <!-- Loading State -->
        <div v-if="isLoading" class="text-center py-8">
            <i class="pi pi-spinner pi-spin text-2xl text-accent-blue"></i>
            <p class="mt-2 text-secondary">Loading categories...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="text-center py-8">
            <i class="pi pi-exclamation-triangle text-2xl text-accent-red mb-2"></i>
            <p class="text-accent-red">{{ error }}</p>
            <Button label="Retry" icon="pi pi-refresh" @click="loadCategories" severity="secondary" size="small"
                class="mt-3" />
        </div>

        <!-- Categories Content -->
        <div v-else>
            <!-- Category Tabs -->
            <TabView>
                <!-- All Categories Tab -->
                <TabPanel header="All Categories">
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <CategoryCard v-for="category in categories" :key="category._id" :category="category"
                            @edit="editCategory" @delete="deleteCategory" @restore="restoreCategory" />
                    </div>
                </TabPanel>

                <!-- Global Defaults Tab -->
                <TabPanel header="Default Categories">
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <CategoryCard v-for="category in separatedCategories.globalDefaults" :key="category._id"
                            :category="category" @edit="editCategory" @delete="deleteCategory"
                            @restore="restoreCategory" />
                    </div>
                </TabPanel>

                <!-- Custom Categories Tab -->
                <TabPanel header="My Categories">
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <CategoryCard
                            v-for="category in [...separatedCategories.userCustom, ...separatedCategories.userOverrides]"
                            :key="category._id" :category="category" @edit="editCategory" @delete="deleteCategory"
                            @restore="restoreCategory" />
                    </div>
                </TabPanel>
            </TabView>
        </div>

        <!-- Add/Edit Category Dialog -->
        <CategoryFormDialog v-model:visible="showAddCategoryDialog" v-model:category="selectedCategory"
            :isEdit="isEditMode" @save="handleSaveCategory" />

        <!-- Success Toast -->
        <Toast ref="toast" />
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import CategoryService from '@/services/categoryService';
import CategoryCard from '@/components/categories/CategoryCard.vue';
import CategoryFormDialog from '@/components/categories/CategoryFormDialog.vue';

const categories = ref([]);
const isLoading = ref(true);
const error = ref('');
const showAddCategoryDialog = ref(false);
const selectedCategory = ref(null);
const isEditMode = ref(false);
const toast = ref();

const separatedCategories = computed(() => {
    return CategoryService.separateCategories(categories.value);
});

const loadCategories = async () => {
    isLoading.value = true;
    error.value = '';

    try {
        const result = await CategoryService.getCategories();
        if (result.success) {
            categories.value = result.data;
        } else {
            error.value = result.error;
        }
    } catch (err) {
        error.value = 'Failed to load categories';
        console.error(err);
    } finally {
        isLoading.value = false;
    }
};

const editCategory = (category) => {
    selectedCategory.value = { ...category };
    isEditMode.value = true;
    showAddCategoryDialog.value = true;
};

const deleteCategory = async (category) => {
    if (confirm(`Are you sure you want to delete "${category.name}"?`)) {
        const result = await CategoryService.deleteCategory(category._id);
        if (result.success) {
            showToast('success', 'Success', result.message);
            await loadCategories();
        } else {
            showToast('error', 'Error', result.error);
        }
    }
};

const restoreCategory = async (category) => {
    const result = await CategoryService.restoreToGlobalDefault(category._id);
    if (result.success) {
        showToast('success', 'Success', result.message);
        await loadCategories();
    } else {
        showToast('error', 'Error', result.error);
    }
};

const handleSaveCategory = async (categoryData) => {
    let result;

    if (isEditMode.value) {
        result = await CategoryService.updateCategory(selectedCategory.value._id, categoryData);
    } else {
        result = await CategoryService.createCategory(categoryData);
    }

    if (result.success) {
        showToast('success', 'Success', result.message);
        showAddCategoryDialog.value = false;
        selectedCategory.value = null;
        isEditMode.value = false;
        await loadCategories();
    } else {
        showToast('error', 'Error', result.error);
    }
};

const showToast = (severity, summary, detail) => {
    toast.value.add({ severity, summary, detail });
};

onMounted(() => {
    loadCategories();
});
</script>

<style></style>