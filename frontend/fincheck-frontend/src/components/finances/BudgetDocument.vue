<template>
    <div class="space-y-6 ">
        <!-- Budget Header -->
        <div class="bg-primary rounded-lg shadow-sm border border-default p-6">
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg font-semibold text-primary">Budget Overview</h3>
                <DropdownMenu :items="headerMenuItems" :entity="budget" @action="handleHeaderAction" />
            </div>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                    <p class="text-sm text-muted">Created At</p>
                    <p class="font-medium text-primary">{{ new Date(budget.createdAt).toLocaleDateString() }}</p>
                </div>
                <div>
                    <p class="text-sm text-muted">Year</p>
                    <p class="font-medium text-primary">{{ budget.year }}</p>
                </div>
                <div>
                    <p class="text-sm text-muted">Month</p>
                    <p class="font-medium text-primary">{{ getMonthName(budget.month) }}</p>
                </div>
                <div>
                    <p class="text-sm text-muted">Expected Income</p>
                    <p class="font-medium text-accent-green">${{ budget.expectedMonthlyIncome }}</p>
                </div>
            </div>
        </div>

        <!-- Monthly Budget -->
        <div class="bg-primary rounded-lg shadow-sm border border-default p-6">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-lg font-semibold text-primary">Budget Items</h2>
                <ItemForm ref="addBudgetFormRef" formType="budget" @budget-item-added="handleBudgetItemAdded" />
            </div>

            <div v-if="budget.monthlyBudget && budget.monthlyBudget.length > 0" class="space-y-3">
                <div v-for="item in budget.monthlyBudget" :key="item._id"
                    class="flex justify-between items-center p-4 bg-secondary rounded-lg">
                    <div class="flex-1">
                        <div class="flex items-center gap-2 mb-1">
                            <p class="font-medium text-primary">{{ item.name }}</p>
                            <span class="text-xs px-2 py-1 rounded-full bg-tertiary text-accent-blue capitalize">
                                {{ getCategoryName(item.category) }}
                            </span>
                        </div>
                        <p v-if="item.description" class="text-sm text-secondary mb-1">{{ item.description }}</p>
                        <p class="text-xs text-muted">
                            {{ item.isRecurring ? 'Recurring' : 'One-time' }}
                        </p>
                    </div>
                    <div class="text-right flex items-center gap-2">
                        <p class="font-semibold text-lg text-accent-blue">${{ item.amount }}</p>
                        <DropdownMenu :items="budgetItemMenuItems" :entity="item"
                            :disabled="deletingItemId === item._id" @action="handleBudgetItemAction" />
                    </div>
                </div>

                <!-- Budget Summary -->
                <div class="border-t border-default pt-4 mt-6">
                    <div class="flex justify-between items-center font-semibold text-lg">
                        <span class="text-primary">Total Monthly Budget:</span>
                        <span class="text-accent-blue">${{ budget.totalMonthlyBudget }}</span>
                    </div>
                    <div v-if="budget.expectedMonthlyIncome"
                        class="flex justify-between items-center text-sm text-secondary mt-1">
                        <span>Expected Savings:</span>
                        <span :class="budget.plannedSavings >= 0 ? 'text-accent-green' : 'text-accent-red'">
                            ${{ budget.plannedSavings }}
                        </span>
                    </div>
                </div>
            </div>
            <div v-else class="text-center py-4 text-muted">
                No budget items yet. Add some budget categories to get started.
            </div>
        </div>

        <!-- Edit Budget Item Form (hidden, controlled programmatically) -->
        <ItemForm ref="editBudgetFormRef" formType="budget" :edit-item="editingItem"
            @budget-item-updated="handleBudgetItemUpdated" style="display: none;" />

        <!-- Edit Expected Income Dialog -->
        <Dialog v-model:visible="editIncomeVisible" modal header="Edit Expected Income" :style="{ width: '25rem' }">
            <div class="flex flex-col gap-4">
                <div class="flex flex-col gap-2">
                    <label for="newIncome" class="font-semibold">Expected Monthly Income</label>
                    <InputNumber id="newIncome" v-model="newExpectedIncome" mode="currency" currency="USD"
                        locale="en-US" placeholder="0.00" :disabled="updatingIncome"
                        :class="{ 'p-invalid': incomeError }" />
                    <small v-if="incomeError" class="p-error">{{ incomeError }}</small>
                </div>
            </div>

            <template #footer>
                <div class="flex justify-end gap-2">
                    <Button type="button" label="Cancel" severity="secondary" @click="closeIncomeDialog"
                        :disabled="updatingIncome" />
                    <Button type="button" label="Update" @click="updateExpectedIncome" :loading="updatingIncome"
                        :disabled="!newExpectedIncome || newExpectedIncome <= 0" />
                </div>
            </template>
        </Dialog>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { FinanceService } from '@/services/financeService';
import { useCategoriesStore } from '@/stores/categories';
import ItemForm from './ItemForm.vue';
import DropdownMenu from '../common/DropdownMenu.vue';

const props = defineProps({
    budget: {
        type: Object,
        required: true
    }
});

const emit = defineEmits(['budgetUpdated', 'budgetDeleted']);

// Existing refs
const deletingItemId = ref(null);

// Form refs
const addBudgetFormRef = ref(null);
const editBudgetFormRef = ref(null);
const editingItem = ref(null);

// Header menu refs
const editIncomeVisible = ref(false);
const newExpectedIncome = ref(0);
const updatingIncome = ref(false);
const incomeError = ref('');
const deletingBudget = ref(false);

const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

const getMonthName = (monthIndex) => {
    return monthNames[monthIndex] || 'Unknown';
};

// Menu configurations
const headerMenuItems = [
    {
        label: 'Edit Expected Income',
        icon: 'pi pi-dollar',
        action: 'edit-income'
    },
    {
        separator: true
    },
    {
        label: 'Delete Budget',
        icon: 'pi pi-trash',
        action: 'delete-budget',
        danger: true
    }
];

const budgetItemMenuItems = [
    {
        label: 'Edit',
        icon: 'pi pi-pencil',
        action: 'edit'
    },
    {
        separator: true
    },
    {
        label: 'Delete',
        icon: 'pi pi-trash',
        action: 'delete',
        danger: true
    }
];

// Action handlers
const handleHeaderAction = ({ action, entity }) => {
    switch (action) {
        case 'edit-income':
            openEditIncomeDialog();
            break;
        case 'delete-budget':
            deleteBudget();
            break;
    }
};

const handleBudgetItemAction = ({ action, entity }) => {
    switch (action) {
        case 'edit':
            editBudgetItem(entity);
            break;
        case 'delete':
            deleteBudgetItem(entity._id);
            break;
    }
};

// Income functions (using FinanceService for future updates)
const openEditIncomeDialog = () => {
    newExpectedIncome.value = props.budget.expectedMonthlyIncome || 0;
    editIncomeVisible.value = true;
    incomeError.value = '';
};

const closeIncomeDialog = () => {
    editIncomeVisible.value = false;
    newExpectedIncome.value = 0;
    incomeError.value = '';
};

const updateExpectedIncome = async () => {
    if (!newExpectedIncome.value || newExpectedIncome.value <= 0) {
        incomeError.value = 'Expected income must be greater than 0';
        return;
    }

    updatingIncome.value = true;
    incomeError.value = '';

    try {
        // Using existing budget data and updating just the expected income
        const existingBudget = await FinanceService.getBudgetData();

        const updateData = {
            expectedMonthlyIncome: newExpectedIncome.value,
            monthlyBudget: existingBudget?.monthlyBudget || []
        };

        await FinanceService._updateBudgetData(updateData);
        emit('budgetUpdated');
        closeIncomeDialog();
    } catch (error) {
        console.error('Error updating expected income:', error);
        incomeError.value = 'Failed to update expected income. Please try again.';
    } finally {
        updatingIncome.value = false;
    }
};

// Budget functions (using FinanceService)
const deleteBudget = async () => {
    const budgetName = `${getMonthName(props.budget.month)} ${props.budget.year}`;

    if (!confirm(`Are you sure you want to delete the entire budget for ${budgetName}? This action cannot be undone and will remove all budget items and transactions.`)) {
        return;
    }

    deletingBudget.value = true;

    try {
        await FinanceService.deleteBudget(props.budget.month, props.budget.year);
        console.log('Budget deleted successfully');
        emit('budgetDeleted');
    } catch (error) {
        console.error('Error deleting budget:', error);
        alert('Failed to delete budget. Please try again.');
    } finally {
        deletingBudget.value = false;
    }
};

// Budget item functions (using FinanceService)
const handleBudgetItemAdded = () => {
    emit('budgetUpdated');
};

const handleBudgetItemUpdated = () => {
    editingItem.value = null;
    emit('budgetUpdated');
};

const editBudgetItem = (item) => {
    editingItem.value = item;

    if (editBudgetFormRef.value) {
        editBudgetFormRef.value.openDialog();
    }
};

const deleteBudgetItem = async (budgetItemId) => {
    if (!confirm('Are you sure you want to delete this budget item?')) {
        return;
    }

    deletingItemId.value = budgetItemId;

    try {
        await FinanceService.deleteBudgetItem(props.budget.month, props.budget.year, budgetItemId);
        emit('budgetUpdated');
    } catch (error) {
        console.error('Error deleting budget item:', error);
        alert('Failed to delete budget item. Please try again.');
    } finally {
        deletingItemId.value = null;
    }
};

// Add categories store
const categoriesStore = useCategoriesStore();

// Add category name getter
const getCategoryName = (categoryId) => {
    const category = categoriesStore.getCategoryById(categoryId);
    return category?.name || 'Uncategorized';
};
</script>