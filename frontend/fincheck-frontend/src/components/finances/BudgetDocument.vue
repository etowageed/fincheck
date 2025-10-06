<template>
    <div class="space-y-6 ">
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

        <div class="bg-primary rounded-lg shadow-sm border border-default p-6">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-lg font-semibold text-primary">Budget Items</h2>
                <ItemForm ref="addBudgetFormRef" formType="budget" @budget-item-added="handleBudgetItemChange" />
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
                        <DropdownMenu :items="budgetItemMenuItems" :entity="item" @action="handleBudgetItemAction" />
                    </div>
                </div>

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

        <ItemForm ref="editBudgetFormRef" formType="budget" :edit-item="editingItem"
            @budget-item-updated="handleBudgetItemChange" style="display: none;" />

        <Dialog v-model:visible="editIncomeVisible" modal header="Edit Expected Income" :style="{ width: '25rem' }">
            <div class="flex flex-col gap-4">
                <div class="flex flex-col gap-2">
                    <label for="newIncome" class="font-semibold">Expected Monthly Income</label>
                    <InputNumber id="newIncome" v-model="newExpectedIncome" mode="currency" currency="USD"
                        locale="en-US" placeholder="0.00" :disabled="budgetStore.isLoading"
                        :class="{ 'p-invalid': incomeError }" />
                    <small v-if="incomeError" class="p-error">{{ incomeError }}</small>
                </div>
            </div>

            <template #footer>
                <div class="flex justify-end gap-2">
                    <Button type="button" label="Cancel" severity="secondary" @click="closeIncomeDialog"
                        :disabled="budgetStore.isLoading" />
                    <Button type="button" label="Update" @click="updateExpectedIncome" :loading="budgetStore.isLoading"
                        :disabled="!newExpectedIncome || newExpectedIncome <= 0" />
                </div>
            </template>
        </Dialog>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { useBudgetStore } from '@/stores/budget';
import { useCategoriesStore } from '@/stores/categories';
import ItemForm from './ItemForm.vue';
import DropdownMenu from '../common/DropdownMenu.vue';

const props = defineProps({
    budget: {
        type: Object,
        required: true
    }
});

const budgetStore = useBudgetStore();
const categoriesStore = useCategoriesStore();

// Form refs
const addBudgetFormRef = ref(null);
const editBudgetFormRef = ref(null);
const editingItem = ref(null);

// Edit income dialog refs
const editIncomeVisible = ref(false);
const newExpectedIncome = ref(0);
const incomeError = ref('');

const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

const getMonthName = (monthIndex) => {
    return monthNames[monthIndex] || 'Unknown';
};

// Menu configurations
const headerMenuItems = [
    { label: 'Edit Expected Income', icon: 'pi pi-dollar', action: 'edit-income' },
    { separator: true },
    { label: 'Delete Budget', icon: 'pi pi-trash', action: 'delete-budget', danger: true }
];

const budgetItemMenuItems = [
    { label: 'Edit', icon: 'pi pi-pencil', action: 'edit' },
    { separator: true },
    { label: 'Delete', icon: 'pi pi-trash', action: 'delete', danger: true }
];

// Action handlers
const handleHeaderAction = ({ action }) => {
    if (action === 'edit-income') openEditIncomeDialog();
    if (action === 'delete-budget') deleteBudget();
};

const handleBudgetItemAction = ({ action, entity }) => {
    if (action === 'edit') editBudgetItem(entity);
    if (action === 'delete') deleteBudgetItem(entity._id);
};

// Income functions
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

    incomeError.value = '';

    const updateData = {
        expectedMonthlyIncome: newExpectedIncome.value,
        monthlyBudget: props.budget.monthlyBudget || []
    };

    const result = await budgetStore.updateExpectedIncome(updateData);
    if (result.success) {
        closeIncomeDialog();
    } else {
        incomeError.value = result.error || 'Failed to update expected income.';
    }
};

// Budget functions
const deleteBudget = async () => {
    const budgetName = `${getMonthName(props.budget.month)} ${props.budget.year}`;
    if (!confirm(`Are you sure you want to delete the entire budget for ${budgetName}?`)) return;

    await budgetStore.deleteBudget();
    // The parent component (`BudgetPage.vue`) will react to the store change and re-render
};

// Budget item functions
const handleBudgetItemChange = () => {
    editingItem.value = null; // Reset editing item after an add/update
    budgetStore.fetchBudget();
};

const editBudgetItem = (item) => {
    editingItem.value = item;
    if (editBudgetFormRef.value) {
        editBudgetFormRef.value.openDialog();
    }
};

const deleteBudgetItem = async (budgetItemId) => {
    if (!confirm('Are you sure you want to delete this budget item?')) return;
    await budgetStore.deleteBudgetItem(budgetItemId);
};

// Category name getter
const getCategoryName = (categoryId) => {
    const category = categoriesStore.getCategoryById(categoryId);
    return category?.name || 'Uncategorized';
};
</script>