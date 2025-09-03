<template>
    <div class="card flex justify-center">
        <Button label="Add Budget Item" icon="pi pi-plus" @click="visible = true" />
        <Dialog v-model:visible="visible" modal header="Add Budget Item" :style="{ width: '35rem' }">
            <div class="space-y-4">
                <div class="flex flex-col gap-2">
                    <label for="name" class="font-semibold">Name</label>
                    <InputText id="name" v-model="budgetItem.name" placeholder="e.g., Monthly Rent, Weekly Groceries"
                        :disabled="isLoading" :class="{ 'p-invalid': errors.name }" />
                    <small v-if="errors.name" class="p-error">{{ errors.name }}</small>
                </div>

                <div class="flex flex-col gap-2">
                    <label for="description" class="font-semibold">Description <span
                            class="text-gray-400">(Optional)</span></label>
                    <Textarea id="description" v-model="budgetItem.description"
                        placeholder="Brief description of this budget item..." rows="3" :disabled="isLoading"
                        :class="{ 'p-invalid': errors.description }" />
                    <small v-if="errors.description" class="p-error">{{ errors.description }}</small>
                </div>

                <div class="flex flex-col gap-2">
                    <label for="category" class="font-semibold">Category</label>
                    <InputText id="category" v-model="budgetItem.category"
                        placeholder="e.g., Housing, Food, Transportation, Entertainment" :disabled="isLoading"
                        :class="{ 'p-invalid': errors.category }" />
                    <small v-if="errors.category" class="p-error">{{ errors.category }}</small>
                </div>

                <div class="flex flex-col gap-2">
                    <label for="amount" class="font-semibold">Amount</label>
                    <InputNumber id="amount" v-model="budgetItem.amount" mode="currency" currency="USD" locale="en-US"
                        placeholder="0.00" :disabled="isLoading" :class="{ 'p-invalid': errors.amount }" />
                    <small v-if="errors.amount" class="p-error">{{ errors.amount }}</small>
                </div>

                <div class="flex flex-col gap-2">
                    <label for="isRecurring" class="font-semibold">Recurring Expense</label>
                    <div class="flex items-center gap-2">
                        <ToggleButton id="isRecurring" v-model="budgetItem.isRecurring" onLabel="Yes" offLabel="No"
                            :disabled="isLoading" />
                        <small class="text-gray-500">
                            {{ budgetItem.isRecurring ? 'This expense repeats monthly' : 'This is a one-time expense' }}
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
                    <Button type="button" label="Add Item" @click="addBudgetItem" :loading="isLoading"
                        :disabled="!isFormValid" />
                </div>
            </template>
        </Dialog>
    </div>
</template>

<script setup>
import { ref, computed } from "vue";
import api from '@/services/api';

const visible = ref(false);
const isLoading = ref(false);
const errors = ref({});

const budgetItem = ref({
    name: '',
    description: '',
    category: '',
    amount: 0,
    isRecurring: true
});

const emit = defineEmits(['budgetItemAdded']);

const isFormValid = computed(() => {
    return budgetItem.value.name.trim() !== '' &&
        budgetItem.value.category.trim() !== '' &&
        budgetItem.value.amount > 0;
});

const validateForm = () => {
    errors.value = {};

    if (!budgetItem.value.name.trim()) {
        errors.value.name = 'Name is required';
    }

    if (!budgetItem.value.category.trim()) {
        errors.value.category = 'Category is required';
    }

    if (!budgetItem.value.amount || budgetItem.value.amount <= 0) {
        errors.value.amount = 'Amount must be greater than 0';
    }

    return Object.keys(errors.value).length === 0;
};

const addBudgetItem = async () => {
    if (!validateForm()) {
        return;
    }

    isLoading.value = true;

    try {
        // Get current month and year
        const currentDate = new Date();
        const month = currentDate.getMonth();
        const year = currentDate.getFullYear();

        // First, get the existing budget data
        const existingBudgetResponse = await api.get('/finances');
        const existingBudget = existingBudgetResponse.data.data[0];

        let monthlyBudget = [];

        if (existingBudget && existingBudget.monthlyBudget) {
            monthlyBudget = [...existingBudget.monthlyBudget];
        }

        // Add the new budget item
        const newBudgetItem = {
            name: budgetItem.value.name.trim(),
            category: budgetItem.value.category.trim(),
            amount: budgetItem.value.amount,
            isRecurring: budgetItem.value.isRecurring
        };

        // Only include description if it's not empty
        if (budgetItem.value.description.trim()) {
            newBudgetItem.description = budgetItem.value.description.trim();
        }

        monthlyBudget.push(newBudgetItem);

        // Update the budget with the new item
        const updateData = {
            monthlyBudget: monthlyBudget
        };

        // If there's an existing budget, include the expectedMonthlyIncome
        if (existingBudget && existingBudget.expectedMonthlyIncome) {
            updateData.expectedMonthlyIncome = existingBudget.expectedMonthlyIncome;
        }

        const response = await api.post('/finances', updateData);

        console.log('Budget item added successfully:', response.data);

        // Emit event to parent component to refresh data
        emit('budgetItemAdded', response.data);

        // Close dialog and reset form
        closeDialog();

    } catch (error) {
        console.error('Error adding budget item:', error);

        // Handle specific error cases
        if (error.response?.status === 400) {
            errors.value.general = 'Invalid data provided';
        } else if (error.response?.status === 404) {
            errors.value.general = 'No budget found. Please create a budget first.';
        } else {
            errors.value.general = 'Failed to add budget item. Please try again.';
        }
    } finally {
        isLoading.value = false;
    }
};

const closeDialog = () => {
    visible.value = false;
    budgetItem.value = {
        name: '',
        description: '',
        category: '',
        amount: 0,
        isRecurring: true
    };
    errors.value = {};
};
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