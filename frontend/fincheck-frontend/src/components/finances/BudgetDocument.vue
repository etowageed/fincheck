<template>
    <div class="space-y-6">
        <!-- Budget Header -->
        <div class="bg-white rounded-lg shadow-sm border p-6">
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg font-semibold text-gray-800">Budget Overview</h3>
                <div class="relative">
                    <Button icon="pi pi-ellipsis-v" severity="secondary" size="small" text
                        @click="toggleHeaderMenu($event)" :aria-haspopup="true" :aria-expanded="headerMenuVisible" />
                    <Menu ref="headerMenuRef" :model="headerMenuItems" :popup="true" />
                </div>
            </div>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                    <p class="text-sm text-gray-500">Created At</p>
                    <p class="font-medium">{{ new Date(budget.createdAt).toLocaleDateString() }}</p>
                </div>
                <div>
                    <p class="text-sm text-gray-500">Year</p>
                    <p class="font-medium">{{ budget.year }}</p>
                </div>
                <div>
                    <p class="text-sm text-gray-500">Month</p>
                    <p class="font-medium">{{ getMonthName(budget.month) }}</p>
                </div>
                <div>
                    <p class="text-sm text-gray-500">Expected Income</p>
                    <p class="font-medium text-green-600">${{ budget.expectedMonthlyIncome }}</p>
                </div>
            </div>
        </div>

        <!-- Monthly Budget -->
        <div class="bg-white rounded-lg shadow-sm border p-6">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-lg font-semibold text-gray-800">Budget Items</h2>
                <AddBudgetItemsForm ref="addBudgetFormRef" @budget-item-added="handleBudgetItemAdded" />
            </div>

            <div v-if="budget.monthlyBudget && budget.monthlyBudget.length > 0" class="space-y-3">
                <div v-for="item in budget.monthlyBudget" :key="item._id"
                    class="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <div class="flex-1">
                        <div class="flex items-center gap-2 mb-1">
                            <p class="font-medium">{{ item.name }}</p>
                            <span class="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 capitalize">
                                {{ item.category }}
                            </span>
                        </div>
                        <p v-if="item.description" class="text-sm text-gray-600 mb-1">{{ item.description }}</p>
                        <p class="text-xs text-gray-500">
                            {{ item.isRecurring ? 'Recurring' : 'One-time' }}
                        </p>
                    </div>
                    <div class="text-right flex items-center gap-2">
                        <p class="font-semibold text-lg text-blue-600">${{ item.amount }}</p>
                        <div class="relative">
                            <Button icon="pi pi-ellipsis-v" severity="secondary" size="small" text
                                @click="toggleMenu($event, item._id)" :aria-haspopup="true"
                                :aria-expanded="activeMenuId === item._id" />
                            <Menu :ref="el => setMenuRef(el, item._id)" :model="getMenuItems(item)" :popup="true" />
                        </div>
                    </div>
                </div>

                <!-- Budget Summary -->
                <div class="border-t pt-4 mt-6">
                    <div class="flex justify-between items-center font-semibold text-lg">
                        <span>Total Monthly Budget:</span>
                        <span class="text-blue-600">${{ budget.totalMonthlyBudget }}</span>
                    </div>
                    <div v-if="budget.expectedMonthlyIncome"
                        class="flex justify-between items-center text-sm text-gray-600 mt-1">
                        <span>Planned Savings:</span>
                        <span :class="budget.plannedSavings >= 0 ? 'text-green-600' : 'text-red-600'">
                            ${{ budget.plannedSavings }}
                        </span>
                    </div>
                </div>
            </div>
            <div v-else class="text-center py-4 text-gray-500">
                No budget items yet. Add some budget categories to get started.
            </div>
        </div>

        <!-- Edit Budget Item Form (hidden, controlled programmatically) -->
        <AddBudgetItemsForm ref="editBudgetFormRef" :edit-item="editingItem"
            @budget-item-updated="handleBudgetItemUpdated" style="display: none;" />

        <!-- Transactions -->
        <div class="bg-white rounded-lg shadow-sm border p-6">
            <h2 class="text-lg font-semibold text-gray-800 mb-4">Transactions</h2>
            <div v-if="budget.transactions && budget.transactions.length > 0" class="space-y-3">
                <div v-for="transaction in budget.transactions" :key="transaction._id"
                    class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                        <p class="font-medium">{{ transaction.description }}</p>
                        <p class="text-sm text-gray-500 capitalize">{{ transaction.category }}</p>
                    </div>
                    <div class="text-right">
                        <p class="font-semibold"
                            :class="transaction.type === 'expense' ? 'text-red-600' : 'text-green-600'">
                            {{ transaction.type === 'expense' ? '-' : '+' }}${{ transaction.amount }}
                        </p>
                        <p class="text-sm text-gray-500">{{ new Date(transaction.date).toLocaleDateString() }}</p>
                    </div>
                </div>
            </div>
            <div v-else class="text-center py-4 text-gray-500">
                No transactions yet.
            </div>
        </div>

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
import api from '@/services/api';
import AddBudgetItemsForm from './AddBudgetItemsForm.vue';

const props = defineProps({
    budget: {
        type: Object,
        required: true
    }
});

const emit = defineEmits(['budgetUpdated', 'budgetDeleted']);

// Existing refs
const deletingItemId = ref(null);
const activeMenuId = ref(null);
const menuRefs = ref({});

// Form refs
const addBudgetFormRef = ref(null);
const editBudgetFormRef = ref(null);
const editingItem = ref(null);

// Header menu refs
const headerMenuRef = ref(null);
const headerMenuVisible = ref(false);
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

// Header menu items
const headerMenuItems = [
    {
        label: 'Edit Expected Income',
        icon: 'pi pi-dollar',
        command: () => openEditIncomeDialog()
    },
    {
        separator: true
    },
    {
        label: 'Delete Budget',
        icon: 'pi pi-trash',
        command: () => deleteBudget(),
        class: 'text-red-600'
    }
];

// Header menu functions
const toggleHeaderMenu = (event) => {
    if (headerMenuRef.value) {
        headerMenuRef.value.toggle(event);
        headerMenuVisible.value = !headerMenuVisible.value;
    }
};

const openEditIncomeDialog = () => {
    newExpectedIncome.value = props.budget.expectedMonthlyIncome || 0;
    editIncomeVisible.value = true;
    headerMenuVisible.value = false;
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
        // Use the upsert endpoint - only update expected income, keep existing budget items
        await api.post('/finances', {
            expectedMonthlyIncome: newExpectedIncome.value,
            monthlyBudget: props.budget.monthlyBudget || []
        });

        emit('budgetUpdated');
        closeIncomeDialog();
    } catch (error) {
        console.error('Error updating expected income:', error);
        incomeError.value = 'Failed to update expected income. Please try again.';
    } finally {
        updatingIncome.value = false;
    }
};

const deleteBudget = async () => {
    const budgetName = `${getMonthName(props.budget.month)} ${props.budget.year}`;

    if (!confirm(`Are you sure you want to delete the entire budget for ${budgetName}? This action cannot be undone and will remove all budget items and transactions.`)) {
        return;
    }

    deletingBudget.value = true;
    headerMenuVisible.value = false;

    try {
        await api.delete(`/finances/${props.budget.month}/${props.budget.year}`);

        console.log('Budget deleted successfully');

        // Emit event to notify parent that budget was deleted
        emit('budgetDeleted');

    } catch (error) {
        console.error('Error deleting budget:', error);

        // You could add a toast notification here
        alert('Failed to delete budget. Please try again.');

    } finally {
        deletingBudget.value = false;
    }
};

// Budget item functions
const setMenuRef = (el, itemId) => {
    if (el) {
        menuRefs.value[itemId] = el;
    }
};

const toggleMenu = (event, itemId) => {
    const menu = menuRefs.value[itemId];
    if (menu) {
        menu.toggle(event);
        activeMenuId.value = false;
        activeMenuId.value = activeMenuId.value === itemId ? null : itemId;
    }
};

const getMenuItems = (item) => {
    return [
        {
            label: 'Edit',
            icon: 'pi pi-pencil',
            command: () => editBudgetItem(item)
        },
        {
            separator: true
        },
        {
            label: 'Delete',
            icon: 'pi pi-trash',
            command: () => deleteBudgetItem(item._id),
            class: 'text-red-600'
        }
    ];
};

const handleBudgetItemAdded = () => {
    emit('budgetUpdated');
};

const handleBudgetItemUpdated = () => {
    editingItem.value = null;
    emit('budgetUpdated');
};

const editBudgetItem = (item) => {
    editingItem.value = item;
    activeMenuId.value = null;

    // Open the edit form dialog
    if (editBudgetFormRef.value) {
        editBudgetFormRef.value.openDialog();
    }
};

const deleteBudgetItem = async (budgetItemId) => {
    if (!confirm('Are you sure you want to delete this budget item?')) {
        return;
    }

    deletingItemId.value = budgetItemId;
    activeMenuId.value = null;

    try {
        await api.delete(`/finances/${props.budget.month}/${props.budget.year}/budget/${budgetItemId}`);
        emit('budgetUpdated');
    } catch (error) {
        console.error('Error deleting budget item:', error);
    } finally {
        deletingItemId.value = null;
    }
};
</script>