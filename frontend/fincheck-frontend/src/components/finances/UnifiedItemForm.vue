<template>
    <div class="card flex justify-center">
        <Button :label="buttonLabel" :icon="buttonIcon" @click="openDialog" />
        <Dialog v-model:visible="visible" modal :header="dialogHeader" :style="{ width: '35rem' }">
            <div class="space-y-4">
                <!-- Name/Description Field -->
                <div class="flex flex-col gap-2">
                    <label :for="nameFieldId" class="font-semibold">{{ nameFieldLabel }}</label>
                    <InputText :id="nameFieldId" v-model="formData.name" :placeholder="nameFieldPlaceholder"
                        :disabled="isLoading" :class="{ 'p-invalid': errors.name }" />
                    <small v-if="errors.name" class="p-error">{{ errors.name }}</small>
                </div>

                <!-- Amount Field -->
                <div class="flex flex-col gap-2">
                    <label for="amount" class="font-semibold">Amount</label>
                    <InputNumber id="amount" v-model="formData.amount" mode="currency" currency="USD" locale="en-US"
                        placeholder="0.00" :disabled="isLoading" :class="{ 'p-invalid': errors.amount }" />
                    <small v-if="errors.amount" class="p-error">{{ errors.amount }}</small>
                    <small v-if="formType === 'transaction'" class="text-gray-500">
                        Enter positive amounts for income, negative for expenses
                    </small>
                </div>

                <!-- Transaction Type Field (Transactions only) -->
                <div v-if="formType === 'transaction'" class="flex flex-col gap-2">
                    <label for="type" class="font-semibold">Type</label>
                    <Dropdown id="type" v-model="formData.type" :options="transactionTypes" optionLabel="label"
                        optionValue="value" placeholder="Select transaction type" :disabled="isLoading"
                        :class="{ 'p-invalid': errors.type }" />
                    <small v-if="errors.type" class="p-error">{{ errors.type }}</small>
                </div>

                <!-- Category Field -->
                <div class="flex flex-col gap-2">
                    <label for="category" class="font-semibold">Category</label>
                    <InputText id="category" v-model="formData.category" :placeholder="categoryPlaceholder"
                        :disabled="isLoading" :class="{ 'p-invalid': errors.category }" />
                    <small v-if="errors.category" class="p-error">{{ errors.category }}</small>
                </div>

                <!-- Date Field (Transactions only) -->
                <div v-if="formType === 'transaction'" class="flex flex-col gap-2">
                    <label for="date" class="font-semibold">Date</label>
                    <Calendar id="date" v-model="formData.date" dateFormat="mm/dd/yy" placeholder="Select date"
                        :disabled="isLoading" :class="{ 'p-invalid': errors.date }" showIcon :manualInput="true"
                        :showOnFocus="false" :minDate="minDateRange" :maxDate="maxDateRange" />
                    <small v-if="errors.date" class="p-error">{{ errors.date }}</small>
                    <small class="text-gray-500">Select a date or type it manually (defaults to today)</small>
                </div>

                <!-- Description/Notes Field -->
                <div class="flex flex-col gap-2">
                    <label :for="descriptionFieldId" class="font-semibold">
                        {{ descriptionFieldLabel }} <span class="text-gray-400">(Optional)</span>
                    </label>
                    <Textarea :id="descriptionFieldId" v-model="formData.description"
                        :placeholder="descriptionFieldPlaceholder" rows="3" :disabled="isLoading"
                        :class="{ 'p-invalid': errors.description }" />
                    <small v-if="errors.description" class="p-error">{{ errors.description }}</small>
                </div>

                <!-- Recurring Field (Budget items only) -->
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

                <!-- General Error -->
                <div v-if="errors.general" class="p-3 bg-red-50 border border-red-200 rounded-md">
                    <small class="p-error">{{ errors.general }}</small>
                </div>
            </div>

            <template #footer>
                <div class="flex justify-end gap-2">
                    <Button type="button" label="Cancel" severity="secondary" @click="closeDialog"
                        :disabled="isLoading" />
                    <Button type="button" :label="submitButtonLabel" @click="saveItem" :loading="isLoading"
                        :disabled="!isFormValid" />
                </div>
            </template>
        </Dialog>
    </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import api from '@/services/api';

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

const visible = ref(false);
const isLoading = ref(false);
const errors = ref({});
const editMode = computed(() => !!props.editItem);

// Initialize form data with proper defaults
const getInitialFormData = () => ({
    name: '',
    description: '',
    category: '',
    amount: 0,
    // Budget-specific fields
    isRecurring: true,
    // Transaction-specific fields
    type: '',
    date: new Date() // Always initialize with current date
});

const formData = ref(getInitialFormData());

const transactionTypes = [
    { label: 'Income', value: 'income' },
    { label: 'Expense', value: 'expense' },
    { label: 'Excluded Expense', value: 'excludedExpense' }
];

const emit = defineEmits([
    'budgetItemAdded',
    'budgetItemUpdated',
    'transactionAdded',
    'transactionUpdated'
]);

// Date range for calendar (allow past and future dates)
const minDateRange = computed(() => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 10); // 10 years ago
    return date;
});

const maxDateRange = computed(() => {
    const date = new Date();
    date.setFullYear(date.getFullYear() + 5); // 5 years from now
    return date;
});

// Utility function to safely parse dates
const parseDate = (dateValue) => {
    if (!dateValue) return new Date();

    if (dateValue instanceof Date) {
        return isNaN(dateValue.getTime()) ? new Date() : dateValue;
    }

    const parsed = new Date(dateValue);
    return isNaN(parsed.getTime()) ? new Date() : parsed;
};

// Computed properties for dynamic labels and placeholders
const buttonLabel = computed(() => {
    const itemType = props.formType === 'budget' ? 'Budget Item' : 'Transaction';
    return editMode.value ? `Edit ${itemType}` : `Add ${itemType}`;
});

const buttonIcon = computed(() => {
    return editMode.value ? 'pi pi-pencil' : 'pi pi-plus';
});

const dialogHeader = computed(() => {
    const itemType = props.formType === 'budget' ? 'Budget Item' : 'Transaction';
    return editMode.value ? `Edit ${itemType}` : `Add ${itemType}`;
});

const nameFieldId = computed(() => {
    return props.formType === 'budget' ? 'name' : 'description';
});

const nameFieldLabel = computed(() => {
    return props.formType === 'budget' ? 'Name' : 'Description';
});

const nameFieldPlaceholder = computed(() => {
    return props.formType === 'budget'
        ? 'e.g., Monthly Rent, Weekly Groceries'
        : 'e.g., Grocery shopping, Salary payment';
});

const categoryPlaceholder = computed(() => {
    return props.formType === 'budget'
        ? 'e.g., Housing, Food, Transportation, Entertainment'
        : 'e.g., Food, Transportation, Salary, Entertainment';
});

const descriptionFieldId = computed(() => {
    return props.formType === 'budget' ? 'description' : 'notes';
});

const descriptionFieldLabel = computed(() => {
    return props.formType === 'budget' ? 'Description' : 'Notes';
});

const descriptionFieldPlaceholder = computed(() => {
    return props.formType === 'budget'
        ? 'Brief description of this budget item...'
        : 'Additional notes about this transaction...';
});

const submitButtonLabel = computed(() => {
    const action = editMode.value ? 'Update' : 'Add';
    const itemType = props.formType === 'budget' ? 'Item' : 'Transaction';
    return `${action} ${itemType}`;
});

// Form validation
const isFormValid = computed(() => {
    const baseValid = formData.value.name.trim() !== '' &&
        formData.value.category.trim() !== '' &&
        formData.value.amount !== 0;

    if (props.formType === 'transaction') {
        const hasValidDate = formData.value.date &&
            formData.value.date instanceof Date &&
            !isNaN(formData.value.date.getTime());
        return baseValid && formData.value.type !== '' && hasValidDate;
    }

    return baseValid && formData.value.amount > 0;
});

// Watch for editItem prop changes to populate form
watch(() => props.editItem, (newEditItem) => {
    if (newEditItem) {
        if (props.formType === 'budget') {
            formData.value = {
                name: newEditItem.name || '',
                description: newEditItem.description || '',
                category: newEditItem.category || '',
                amount: newEditItem.amount || 0,
                isRecurring: newEditItem.isRecurring ?? true,
                type: '',
                date: new Date()
            };
        } else {
            formData.value = {
                name: newEditItem.description || '',
                description: newEditItem.notes || '',
                category: newEditItem.category || '',
                amount: newEditItem.amount || 0,
                type: newEditItem.type || '',
                isRecurring: true,
                date: parseDate(newEditItem.date)
            };
        }
    }
}, { immediate: true });

const openDialog = () => {
    if (!editMode.value) {
        // Reset form for add mode
        formData.value = getInitialFormData();
        // Set isRecurring based on form type
        formData.value.isRecurring = props.formType === 'budget';
    }
    visible.value = true;
    errors.value = {};
};

const validateForm = () => {
    errors.value = {};

    if (!formData.value.name.trim()) {
        errors.value.name = `${nameFieldLabel.value} is required`;
    }

    if (!formData.value.category.trim()) {
        errors.value.category = 'Category is required';
    }

    if (!formData.value.amount || formData.value.amount === 0) {
        if (props.formType === 'budget') {
            errors.value.amount = 'Amount must be greater than 0';
        } else {
            errors.value.amount = 'Amount cannot be zero';
        }
    }

    if (props.formType === 'transaction') {
        if (!formData.value.type) {
            errors.value.type = 'Transaction type is required';
        }

        // Date validation
        if (!formData.value.date || !(formData.value.date instanceof Date) || isNaN(formData.value.date.getTime())) {
            errors.value.date = 'Please select a valid date';
        }
    } else {
        // Budget items should always have positive amounts
        if (formData.value.amount <= 0) {
            errors.value.amount = 'Amount must be greater than 0';
        }
    }

    return Object.keys(errors.value).length === 0;
};

const saveItem = async () => {
    if (!validateForm()) {
        return;
    }

    isLoading.value = true;

    try {
        if (props.formType === 'budget') {
            await saveBudgetItem();
        } else {
            await saveTransaction();
        }
    } catch (error) {
        console.error(`Error ${editMode.value ? 'updating' : 'adding'} ${props.formType}:`, error);
        handleSaveError(error);
    } finally {
        isLoading.value = false;
    }
};

const saveBudgetItem = async () => {
    // Get existing budget data first
    const existingBudgetResponse = await api.get('/finances');
    const existingBudget = existingBudgetResponse.data.data[0];

    let monthlyBudget = [];

    if (existingBudget && existingBudget.monthlyBudget) {
        monthlyBudget = [...existingBudget.monthlyBudget];
    }

    // Prepare the budget item data
    const budgetItemData = {
        name: formData.value.name.trim(),
        category: formData.value.category.trim(),
        amount: formData.value.amount,
        isRecurring: formData.value.isRecurring
    };

    // Only include description if it's not empty
    if (formData.value.description.trim()) {
        budgetItemData.description = formData.value.description.trim();
    }

    if (editMode.value) {
        // Update existing item
        const itemIndex = monthlyBudget.findIndex(item => item._id === props.editItem._id);
        if (itemIndex !== -1) {
            monthlyBudget[itemIndex] = { ...budgetItemData, _id: props.editItem._id };
        }
    } else {
        // Add new item
        monthlyBudget.push(budgetItemData);
    }

    // Use the upsert endpoint
    const updateData = {
        monthlyBudget: monthlyBudget
    };

    // Include existing expected income to preserve it
    if (existingBudget && existingBudget.expectedMonthlyIncome) {
        updateData.expectedMonthlyIncome = existingBudget.expectedMonthlyIncome;
    }

    const response = await api.post('/finances', updateData);

    console.log(`Budget item ${editMode.value ? 'updated' : 'added'} successfully:`, response.data);

    // Emit appropriate event
    if (editMode.value) {
        emit('budgetItemUpdated', response.data);
    } else {
        emit('budgetItemAdded', response.data);
    }

    closeDialog();
};

const saveTransaction = async () => {
    // Get current month and year
    const currentDate = new Date();
    const month = currentDate.getMonth();
    const year = currentDate.getFullYear();

    // Ensure we have a valid date
    const transactionDate = parseDate(formData.value.date);

    // Prepare the transaction data according to backend validation
    const transactionData = {
        description: formData.value.name.trim(),
        amount: formData.value.amount,
        category: formData.value.category.trim(),
        type: formData.value.type,
        date: transactionDate.toISOString()
    };

    // Add notes if provided
    if (formData.value.description && formData.value.description.trim()) {
        transactionData.notes = formData.value.description.trim();
    }

    let response;

    if (editMode.value) {
        // Update existing transaction using PATCH
        response = await api.patch(`/finances/${month}/${year}/transactions/${props.editItem._id}`, transactionData);
    } else {
        // Add new transaction using POST
        response = await api.post(`/finances/${month}/${year}/transactions`, transactionData);
    }

    console.log(`Transaction ${editMode.value ? 'updated' : 'added'} successfully:`, response.data);

    // Emit appropriate event
    if (editMode.value) {
        emit('transactionUpdated', response.data);
    } else {
        emit('transactionAdded', response.data);
    }

    closeDialog();
};

const handleSaveError = (error) => {
    if (error.response?.status === 400) {
        errors.value.general = 'Invalid data provided';
    } else if (error.response?.status === 404) {
        if (props.formType === 'budget') {
            errors.value.general = 'No budget found. Please create a budget first.';
        } else {
            errors.value.general = 'Transaction not found or no finance document exists for this month.';
        }
    } else {
        const itemType = props.formType === 'budget' ? 'budget item' : 'transaction';
        errors.value.general = `Failed to ${editMode.value ? 'update' : 'add'} ${itemType}. Please try again.`;
    }
};

const closeDialog = () => {
    visible.value = false;
    if (!editMode.value) {
        formData.value = getInitialFormData();
        formData.value.isRecurring = props.formType === 'budget';
    }
    errors.value = {};
};

// Expose openDialog method for parent components
defineExpose({
    openDialog
});
</script>

<style scoped>
.p-invalid {
    border-color: #e24c4c;
}

.p-error {
    color: #e24c4c;
    font-size: 0.875rem;
}
</style>