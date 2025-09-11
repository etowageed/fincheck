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
                    <Button type="button" :label="submitButtonLabel" @click="handleSubmit" :loading="isLoading"
                        :disabled="!isFormValid" />
                </div>
            </template>
        </Dialog>
    </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
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
    isRecurring: true,
    type: '',
    date: new Date()
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

// Date range for calendar
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

// Form validation using the service
const isFormValid = computed(() => {
    if (props.formType === 'budget') {
        return FinanceService.validateBudgetItem(formData.value).isValid;
    } else {
        return FinanceService.validateTransaction(formData.value).isValid;
    }
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
                date: FinanceService.parseDate(newEditItem.date)
            };
        }
    }
}, { immediate: true });

const openDialog = () => {
    if (!editMode.value) {
        formData.value = getInitialFormData();
        formData.value.isRecurring = props.formType === 'budget';
    }
    visible.value = true;
    errors.value = {};
};

const closeDialog = () => {
    visible.value = false;
    if (!editMode.value) {
        formData.value = getInitialFormData();
        formData.value.isRecurring = props.formType === 'budget';
    }
    errors.value = {};
};

const handleSubmit = async () => {
    // Validate form using service
    const validation = props.formType === 'budget'
        ? FinanceService.validateBudgetItem(formData.value)
        : FinanceService.validateTransaction(formData.value);

    if (!validation.isValid) {
        errors.value = validation.errors;
        return;
    }

    isLoading.value = true;
    errors.value = {};

    try {
        let result;

        if (props.formType === 'budget') {
            if (editMode.value) {
                result = await FinanceService.updateBudgetItem(props.editItem._id, formData.value);
                emit('budgetItemUpdated', result);
            } else {
                result = await FinanceService.addBudgetItem(formData.value);
                emit('budgetItemAdded', result);
            }
        } else {
            if (editMode.value) {
                result = await FinanceService.updateTransaction(props.editItem._id, formData.value);
                emit('transactionUpdated', result);
            } else {
                result = await FinanceService.addTransaction(formData.value);
                emit('transactionAdded', result);
            }
        }

        console.log(`${props.formType} ${editMode.value ? 'updated' : 'added'} successfully:`, result);
        closeDialog();
    } catch (error) {
        console.error(`Error ${editMode.value ? 'updating' : 'adding'} ${props.formType}:`, error);
        const operation = editMode.value ? 'update' : 'add';
        errors.value.general = FinanceService.formatErrorMessage(error, operation, props.formType);
    } finally {
        isLoading.value = false;
    }
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