<template>
    <div class="card flex justify-center">
        <Button :label="buttonLabel" :icon="buttonIcon" @click="openDialog" />
        <Dialog v-model:visible="visible" modal :header="dialogHeader" :style="{ width: '35rem' }">
            <div class="space-y-4">
                <div class="flex flex-col gap-2">
                    <label :for="nameFieldId" class="font-semibold">{{ nameFieldLabel }}</label>
                    <InputText :id="nameFieldId" v-model="formData.name" :placeholder="nameFieldPlaceholder"
                        :disabled="isLoading" :class="{ 'p-invalid': errors.name }" />
                    <small v-if="errors.name" class="p-error">{{ errors.name }}</small>
                </div>

                <div class="flex flex-col gap-2">
                    <label for="amount" class="font-semibold">Amount</label>
                    <InputNumber id="amount" v-model="formData.amount" mode="currency" currency="USD" locale="en-US"
                        placeholder="0.00" :disabled="isLoading" :class="{ 'p-invalid': errors.amount }" />
                    <small v-if="errors.amount" class="p-error">{{ errors.amount }}</small>
                </div>

                <div v-if="formType === 'transaction'" class="flex flex-col gap-2">
                    <label for="type" class="font-semibold">Type</label>
                    <Dropdown id="type" v-model="formData.type" :options="transactionTypes" optionLabel="label"
                        optionValue="value" placeholder="Select transaction type" :disabled="isLoading"
                        :class="{ 'p-invalid': errors.type }" />
                    <small v-if="errors.type" class="p-error">{{ errors.type }}</small>
                </div>

                <div class="flex flex-col gap-2">
                    <label for="category" class="font-semibold">Category</label>
                    <div class="flex gap-2">
                        <Dropdown id="category" v-model="formData.category" :options="categoryOptions"
                            optionLabel="label" optionValue="value" placeholder="Select a category"
                            :disabled="isLoading || categoriesStore.isLoading" :class="{ 'p-invalid': errors.category }"
                            filter filterPlaceholder="Search categories..." class="flex-1">
                            <template #option="{ option }">
                                <div class="flex items-center gap-2">
                                    <span>{{ option.label }}</span>
                                    <div class="flex gap-1">
                                        <span v-if="option.isGlobal"
                                            class="px-1.5 py-0.5 text-xs rounded bg-blue-100 text-blue-700">
                                            Default
                                        </span>
                                        <span v-else-if="option.isOverride"
                                            class="px-1.5 py-0.5 text-xs rounded bg-yellow-100 text-yellow-700">
                                            Custom
                                        </span>
                                    </div>
                                </div>
                            </template>
                        </Dropdown>

                        <Button icon="pi pi-plus" severity="secondary" outlined size="small"
                            @click="showQuickAddCategory = true" :disabled="isLoading"
                            v-tooltip.top="'Add new category'" />
                    </div>
                    <small v-if="errors.category" class="p-error">{{ errors.category }}</small>
                    <small v-if="categoriesStore.isLoading" class="text-gray-500">Loading categories...</small>
                    <small v-else-if="categoriesStore.error" class="text-red-500">{{ categoriesStore.error }}</small>
                </div>

                <div v-if="formType === 'transaction'" class="flex flex-col gap-2">
                    <label for="date" class="font-semibold">Date</label>
                    <Calendar id="date" v-model="formData.date" dateFormat="mm/dd/yy" placeholder="Select date"
                        :disabled="isLoading" :class="{ 'p-invalid': errors.date }" showIcon :manualInput="true"
                        :showOnFocus="false" :minDate="minDateRange" :maxDate="maxDateRange" />
                    <small v-if="errors.date" class="p-error">{{ errors.date }}</small>
                </div>

                <div class="flex flex-col gap-2">
                    <label :for="descriptionFieldId" class="font-semibold">
                        {{ descriptionFieldLabel }} <span class="text-gray-400">(Optional)</span>
                    </label>
                    <Textarea :id="descriptionFieldId" v-model="formData.description"
                        :placeholder="descriptionFieldPlaceholder" rows="3" :disabled="isLoading"
                        :class="{ 'p-invalid': errors.description }" />
                    <small v-if="errors.description" class="p-error">{{ errors.description }}</small>
                </div>

                <div v-if="formType === 'budget'" class="flex flex-col gap-2">
                    <label for="isRecurring" class="font-semibold">Recurring Expense</label>
                    <div class="flex items-center gap-2">
                        <ToggleButton id="isRecurring" v-model="formData.isRecurring" onLabel="Yes" offLabel="No"
                            :disabled="isLoading" />
                        <small class="text-gray-500">
                            {{ formData.isRecurring ? 'This expense repeats monthly' : 'This is a one-time expense' }}
                        </small>
                    </div>
                </div>

                <div v-if="errors.general" class="p-3 bg-red-50 border border-red-200 rounded-md">
                    <small class="p-error">{{ errors.general }}</small>
                </div>
            </div>

            <template #footer>
                <div class="flex justify-end gap-2">
                    <Button type="button" label="Cancel" severity="secondary" @click="closeDialog"
                        :disabled="isLoading" />
                    <Button type-="button" :label="submitButtonLabel" @click="handleSubmit" :loading="isLoading"
                        :disabled="!isFormValid" />
                </div>
            </template>
        </Dialog>

        <Dialog v-model:visible="showQuickAddCategory" modal header="Quick Add Category" :style="{ width: '400px' }">
            <div class="space-y-4">
                <div class="flex flex-col gap-2">
                    <label for="quickCategoryName" class="font-semibold">Category Name</label>
                    <InputText id="quickCategoryName" v-model="quickCategoryForm.name" placeholder="Enter category name"
                        :class="{ 'p-invalid': quickCategoryErrors.name }" @keyup.enter="handleQuickAddCategory" />
                    <small v-if="quickCategoryErrors.name" class="p-error">{{ quickCategoryErrors.name }}</small>
                </div>

                <div class="flex flex-col gap-2">
                    <label for="quickCategoryDescription" class="font-semibold">Description (Optional)</label>
                    <InputText id="quickCategoryDescription" v-model="quickCategoryForm.description"
                        placeholder="Brief description" />
                </div>

                <div v-if="quickCategoryErrors.general" class="p-3 bg-red-50 border border-red-200 rounded-md">
                    <small class="p-error">{{ quickCategoryErrors.general }}</small>
                </div>
            </div>

            <template #footer>
                <div class="flex justify-end gap-2">
                    <Button label="Cancel" severity="secondary" @click="closeQuickAddCategory"
                        :disabled="isQuickAddLoading" />
                    <Button label="Add Category" @click="handleQuickAddCategory" :loading="isQuickAddLoading" />
                </div>
            </template>
        </Dialog>
    </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { useTransactionsStore } from '@/stores/transactions';
import { useCategoriesStore } from '@/stores/categories';
import { FinanceService } from '@/services/financeService';

const props = defineProps({
    formType: {
        type: String,
        required: true,
        validator: (value) => ['budget', 'transaction'].includes(value)
    },
    editItem: {
        type: Object,
        default: null
    }
});

const emit = defineEmits([
    'budgetItemAdded',
    'budgetItemUpdated',
]);

const transactionsStore = useTransactionsStore();
const categoriesStore = useCategoriesStore();

const visible = ref(false);
const isLoading = ref(false);
const isQuickAddLoading = ref(false);
const errors = ref({});
const editMode = computed(() => !!props.editItem);
const showQuickAddCategory = ref(false);
const quickCategoryForm = ref({ name: '', description: '' });
const quickCategoryErrors = ref({});

const categoryOptions = computed(() => {
    return categoriesStore.getAllCategories.map(cat => ({
        label: cat.name,
        value: cat._id || cat.id,
        isGlobal: cat.isGlobalDefault,
        isOverride: cat.overridesGlobalDefault
    }));
});

const handleQuickAddCategory = async () => {
    if (!quickCategoryForm.value.name?.trim()) {
        quickCategoryErrors.value.name = 'Category name is required';
        return;
    }
    quickCategoryErrors.value = {};
    isQuickAddLoading.value = true;

    try {
        const result = await categoriesStore.createCategory({
            name: quickCategoryForm.value.name.trim(),
            description: quickCategoryForm.value.description?.trim()
        });

        if (result.success) {
            await categoriesStore.fetchCategories();
            formData.value.category = result.data?._id || result.category?._id;
            closeQuickAddCategory();
        } else {
            quickCategoryErrors.value.general = result.error;
        }
    } catch (error) {
        quickCategoryErrors.value.general = "An error occurred.";
    } finally {
        isQuickAddLoading.value = false;
    }
};

const closeQuickAddCategory = () => {
    showQuickAddCategory.value = false;
    quickCategoryForm.value = { name: '', description: '' };
    quickCategoryErrors.value = {};
};

const getInitialFormData = () => ({
    name: '',
    description: '',
    category: '',
    amount: null,
    isRecurring: true,
    type: 'expense',
    date: new Date()
});

const formData = ref(getInitialFormData());

const transactionTypes = [
    { label: 'Income', value: 'income' },
    { label: 'Expense', value: 'expense' },
    { label: 'Excluded Expense', value: 'excludedExpense' }
];

const minDateRange = computed(() => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 10);
    return date;
});

const maxDateRange = computed(() => {
    const date = new Date();
    date.setFullYear(date.getFullYear() + 5);
    return date;
});

const buttonLabel = computed(() => {
    const itemType = props.formType === 'budget' ? 'Budget Item' : 'Transaction';
    return editMode.value ? `Edit ${itemType}` : `Add ${itemType}`;
});

const buttonIcon = computed(() => editMode.value ? 'pi pi-pencil' : 'pi pi-plus');
const dialogHeader = computed(() => `${editMode.value ? 'Edit' : 'Add'} ${props.formType === 'budget' ? 'Budget Item' : 'Transaction'}`);
const nameFieldId = computed(() => props.formType === 'budget' ? 'name' : 'description');
const nameFieldLabel = computed(() => props.formType === 'budget' ? 'Name' : 'Description');
const nameFieldPlaceholder = computed(() => props.formType === 'budget' ? 'e.g., Monthly Rent' : 'e.g., Grocery shopping');
const descriptionFieldId = computed(() => props.formType === 'budget' ? 'description' : 'notes');
const descriptionFieldLabel = computed(() => props.formType === 'budget' ? 'Description' : 'Notes');
const descriptionFieldPlaceholder = computed(() => props.formType === 'budget' ? 'Brief description...' : 'Additional notes...');
const submitButtonLabel = computed(() => `${editMode.value ? 'Update' : 'Add'} ${props.formType === 'budget' ? 'Item' : 'Transaction'}`);

watch(() => props.editItem, (newEditItem) => {
    if (newEditItem) {
        if (props.formType === 'budget') {
            formData.value = {
                name: newEditItem.name || '',
                description: newEditItem.description || '',
                category: newEditItem.category?._id || newEditItem.category || '',
                amount: newEditItem.amount || 0,
                isRecurring: newEditItem.isRecurring ?? true,
            };
        } else {
            formData.value = {
                name: newEditItem.description || '',
                description: newEditItem.notes || '',
                category: newEditItem.category?._id || newEditItem.category || '',
                amount: newEditItem.amount || 0,
                type: newEditItem.type || 'expense',
                date: newEditItem.date ? new Date(newEditItem.date) : new Date(),
            };
        }
    }
}, { immediate: true, deep: true });

const isFormValid = computed(() => {
    const data = formData.value;
    if (props.formType === 'transaction') {
        return data.name?.trim() && data.category?.trim() && data.amount && data.type && data.date;
    }
    if (props.formType === 'budget') {
        return data.name?.trim() && data.category?.trim() && data.amount > 0;
    }
    return false;
});

const openDialog = () => {
    if (!editMode.value) {
        formData.value = getInitialFormData();
    }
    visible.value = true;
    errors.value = {};
};

const closeDialog = () => {
    visible.value = false;
};

const handleSubmit = async () => {
    isLoading.value = true;
    errors.value = {}; // Keep for field-specific validation errors

    try {
        let result;
        // ... logic to call store actions ...

        // The success check is still useful for closing the dialog
        if (result && (result.success || result.status === 'success')) {
            closeDialog();
        } else {
            // The global handler will show the error, but we can still log it.
            console.error('Failed to save item:', result?.error);
        }
    } catch (error) {
        // The global handler will show the error, but we can still log it.
        console.error(`Error saving ${props.formType}:`, error);
    } finally {
        isLoading.value = false;
    }
};

onMounted(async () => {
    if (!categoriesStore.categories.length) {
        await categoriesStore.fetchCategories();
    }
});

defineExpose({ openDialog });
</script>