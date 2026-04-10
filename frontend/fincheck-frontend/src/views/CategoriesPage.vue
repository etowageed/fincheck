<template>
    <div class="space-y-6">
        <div class="flex justify-between items-center">
            <h1 class="text-2xl md:text-3xl font-extrabold tracking-tight text-primary leading-tight">Categories</h1>
            <Button label="Add Category" icon="pi pi-plus" @click="showAddCategoryDialog = true" />
        </div>

        <!-- Loading State -->
        <div v-if="categoriesStore.isLoading" class="text-center py-8">
            <i class="pi pi-spinner pi-spin text-2xl"></i>
            <p class="mt-2 text-secondary font-medium">Loading categories...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="categoriesStore.error" class="text-center py-8 text-accent-red font-medium">
            {{ categoriesStore.error }}
            <Button @click="loadCategories" class="mt-2">Retry</Button>
        </div>

        <!-- Categories Content -->
        <div v-else>
            <TabView>
                <TabPanel header="All Categories">
                    <div v-if="!categoriesStore.getAllCategories.length" class="text-center py-8">
                        <p class="text-secondary font-medium">No categories found</p>
                    </div>
                    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <CategoryCard v-for="category in categoriesStore.getAllCategories" :key="category._id"
                            :category="category" @edit="editCategory" @delete="deleteCategory"
                            @restore="restoreCategory" />
                    </div>
                </TabPanel>

                <TabPanel header="Default Categories">
                    <div v-if="!categoriesStore.separatedCategories.globalDefaults.length" class="text-center py-8">
                        <p class="text-secondary font-medium">No default categories found</p>
                    </div>
                    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <CategoryCard v-for="category in categoriesStore.separatedCategories.globalDefaults"
                            :key="category._id" :category="category" @edit="editCategory" @delete="deleteCategory"
                            @restore="restoreCategory" />
                    </div>
                </TabPanel>

                <TabPanel header="My Categories">
                    <div v-if="!categoriesStore.separatedCategories.userCustom.length && !categoriesStore.separatedCategories.userOverrides.length" class="text-center py-8">
                        <p class="text-secondary font-medium">No custom categories found</p>
                    </div>
                    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <CategoryCard
                            v-for="category in [...categoriesStore.separatedCategories.userCustom, ...categoriesStore.separatedCategories.userOverrides]"
                            :key="category._id" :category="category" @edit="editCategory" @delete="deleteCategory"
                            @restore="restoreCategory" />
                    </div>
                </TabPanel>
            </TabView>
        </div>

        <CategoryFormDialog v-model:visible="showAddCategoryDialog" v-model:category="selectedCategory"
            :isEdit="isEditMode" @save="handleSaveCategory" />

        <Toast ref="toast" />
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useCategoriesStore } from '@/stores/categories';
import CategoryCard from '@/components/categories/CategoryCard.vue';
import CategoryFormDialog from '@/components/categories/CategoryFormDialog.vue';

const categoriesStore = useCategoriesStore();
const showAddCategoryDialog = ref(false);
const selectedCategory = ref(null);
const isEditMode = ref(false);
const toast = ref();

const loadCategories = async () => {
    console.log('Loading categories...');
    await categoriesStore.fetchCategories();
    console.log('Categories loaded:', categoriesStore.getAllCategories);
};

const editCategory = (category) => {
    selectedCategory.value = { ...category };
    isEditMode.value = true;
    showAddCategoryDialog.value = true;
};

const deleteCategory = async (category) => {
    if (confirm(`Are you sure you want to delete "${category.name}"?`)) {
        const result = await categoriesStore.deleteCategory(category._id);
        if (result.success) {
            showToast('success', 'Success', 'Category deleted successfully');
        } else {
            showToast('error', 'Error', result.error);
        }
    }
};

const restoreCategory = async (category) => {
    // The component just tells the store what to do.
    const result = await categoriesStore.restoreCategory(category._id);

    // The store handles the API call and state updates (re-fetching).
    // The component's only job is to show the final result to the user.
    if (result.success) {
        showToast('success', 'Success', result.message || 'Category restored successfully');
    } else {
        showToast('error', 'Error', result.error || 'Failed to restore category');
    }
};

const handleSaveCategory = (savedCategory) => {
    // The dialog component has already saved the category and refreshed the list.
    // This function's only job is to show the confirmation toast and reset the page's local state.
    showToast('success', 'Success', 'Category saved successfully');

    // Reset the state used for editing/creating
    selectedCategory.value = null;
    isEditMode.value = false;

    // The dialog should close itself, but we can ensure it here as well.
    showAddCategoryDialog.value = false;
};

const showToast = (severity, summary, detail) => {
    toast.value.add({ severity, summary, detail });
};

onMounted(async () => {
    await loadCategories();
});
</script>

<style></style>