<template>
    <div class="space-y-6">
        <div class="bg-primary rounded-lg shadow-sm border border-default p-6">
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg font-semibold text-primary">Transactions Overview</h3>
                <!-- MODIFIED: Use a dedicated button for export which opens the modal -->
                <Button label="Export Transactions" icon="pi pi-download" severity="secondary" size="small"
                    @click="showExportModal = true" />
            </div>
            <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                    <p class="text-sm text-muted">Total Transactions</p>
                    <p class="font-medium text-primary">{{ transactionsStore.recentTransactions.length }}</p>
                </div>
                <div>
                    <p class="text-sm text-muted">Total Income</p>
                    <p class="font-medium text-accent-green">{{ formatCurrency(transactionsStore.totalIncome) }}</p>
                </div>
                <div>
                    <p class="text-sm text-muted">Total Expenses</p>
                    <p class="font-medium text-accent-red">{{ formatCurrency(transactionsStore.totalExpenses) }}
                    </p>
                </div>
            </div>
        </div>

        <div class="bg-primary rounded-lg shadow-sm border border-default p-6">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-lg font-semibold text-primary">Recent Transactions</h2>
                <ItemForm ref="addTransactionFormRef" formType="transaction" />
            </div>

            <div v-if="transactionsStore.recentTransactions && transactionsStore.recentTransactions.length > 0"
                class="space-y-3">

                <div v-for="(transactions, dateKey) in groupedTransactions" :key="dateKey" class="space-y-2">
                    <h3 class="text-sm font-semibold text-text-secondary pt-3 pb-1">
                        {{ formatDateHeader(dateKey) }}
                    </h3>

                    <div v-for="transaction in transactions" :key="transaction._id"
                        class="flex justify-between items-center p-4 bg-secondary rounded-lg">
                        <div class="flex-1">
                            <div class="flex items-center gap-2 mb-1">
                                <p class="font-medium text-primary">{{ transaction.description || 'No description' }}
                                </p>
                                <span class="text-xs px-2 py-1 rounded-full bg-tertiary text-accent-blue capitalize">
                                    {{ getCategoryName(transaction.category) }}
                                </span>
                                <span v-if="transaction.type" class="text-xs px-2 py-1 rounded-full capitalize"
                                    :class="getTypeClass(transaction.type)">
                                    {{ transaction.type }}
                                </span>
                            </div>

                        </div>
                        <div class="text-right flex items-center gap-2">
                            <p class="font-semibold text-lg"
                                :class="getAmountClass(transaction.amount, transaction.type)">
                                {{ formatCurrency(transaction.amount, true) }}
                            </p>
                            <DropdownMenu :items="transactionMenuItems" :entity="transaction"
                                :disabled="deletingTransactionId === transaction._id"
                                @action="handleTransactionAction" />
                        </div>
                    </div>
                </div>


            </div>
            <div v-else class="text-center py-4 text-muted">
                No transactions yet. Add some transactions to get started.
            </div>
        </div>

        <ItemForm ref="editTransactionFormRef" formType="transaction" :edit-item="editingTransaction"
            style="display: none;" />

        <!-- NEW: Export Modal for Transactions -->
        <ExportModal v-model:visible="showExportModal" default-type="transactions" />
    </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useTransactionsStore } from '@/stores/transactions';
import { useCategoriesStore } from '@/stores/categories';
import { useCurrencyFormatter } from '@/composables/useCurrencyFormatter'; // 👈 MODIFIED: Import composable
import ItemForm from './ItemForm.vue';
import DropdownMenu from '../common/DropdownMenu.vue';
import ExportModal from '../common/ExportModal.vue'; // 👈 NEW: Import ExportModal

const transactionsStore = useTransactionsStore();
const categoriesStore = useCategoriesStore();
const { formatCurrency, formatDate: formatComposedDate } = useCurrencyFormatter(); // 👈 MODIFIED: Destructure function

// Refs
const deletingTransactionId = ref(null);
const addTransactionFormRef = ref(null);
const editTransactionFormRef = ref(null);
const editingTransaction = ref(null);
const showExportModal = ref(false); // 👈 NEW: State for the export modal

// Menu configurations
// REMOVED headerMenuItems because we use a dedicated button now.
const transactionMenuItems = [
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

// Utility functions

// Utility function to format date for grouping key
const formatDateKey = (dateValue) => {
    if (!dateValue) return 'Unknown Date';
    // Use ISO string to ensure consistent grouping regardless of user's local timezone offset
    return new Date(dateValue).toISOString().split('T')[0];
};

// Utility function for display header (e.g., "Oct 1, 2025")
const formatDateHeader = (dateKey) => {
    if (!dateKey) return 'Unknown Date';
    // Use the composed date formatter here.
    return formatComposedDate(dateKey, 'long');
};

// NEW COMPUTED PROPERTY: Groups transactions by day
const groupedTransactions = computed(() => {
    if (!transactionsStore.recentTransactions || transactionsStore.recentTransactions.length === 0) {
        return {};
    }

    const groups = transactionsStore.recentTransactions.reduce((acc, transaction) => {
        // Use the transaction's date for grouping
        const dateKey = formatDateKey(transaction.date || transaction.createdAt);

        if (!acc[dateKey]) {
            acc[dateKey] = [];
        }
        acc[dateKey].push(transaction);
        return acc;
    }, {});

    // Sort the keys (dates) in descending order to show newest days first
    const sortedKeys = Object.keys(groups).sort((a, b) => new Date(b) - new Date(a));

    const sortedGroups = {};
    for (const key of sortedKeys) {
        // Sort transactions within each day by time (newest first)
        sortedGroups[key] = groups[key].sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));
    }

    return sortedGroups;
});


const getCategoryName = (categoryId) => {
    const category = categoriesStore.getCategoryById(categoryId);
    return category?.name || 'Uncategorized';
};

const formatDate = (dateValue) => {
    if (!dateValue) return 'No date';
    try {
        const date = new Date(dateValue);
        if (isNaN(date.getTime())) return 'Invalid date';
        // Display only the time or a very simple format within the group item
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } catch (error) {
        return 'Invalid date';
    }
};

const getTypeClass = (type) => {
    switch (type) {
        case 'income':
            return 'bg-green-100 text-green-800';
        case 'expense':
            return 'bg-red-100 text-red-800';
        case 'excludedExpense':
            return 'bg-orange-100 text-orange-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
};

const getAmountClass = (amount, type) => {
    return type === 'income' ? 'text-accent-green' : 'text-accent-red';
};

// Action handlers
const handleHeaderAction = ({ action }) => {
    if (action === 'export') {
        // The export button now opens the modal directly, so this action is not strictly needed here
        // But if we kept the dropdown, this would open the modal:
        showExportModal.value = true;
    }
};

const handleTransactionAction = ({ action, entity }) => {
    if (action === 'edit') {
        editTransaction(entity);
    } else if (action === 'delete') {
        deleteTransaction(entity._id);
    }
};

// Transaction functions
const editTransaction = (transaction) => {
    editingTransaction.value = transaction;
    if (editTransactionFormRef.value) {
        editTransactionFormRef.value.openDialog();
    }
};

const deleteTransaction = async (transactionId) => {
    // ❌ REPLACED: Use PrimeVue/Toast/Modal instead of window.confirm
    // if (!confirm('Are you sure you want to delete this transaction?')) {
    //     return;
    // }
    // NOTE: For now, I'll keep the basic confirm to avoid adding a custom modal implementation for this simple case.
    if (!window.confirm('Are you sure you want to delete this transaction?')) {
        return;
    }

    deletingTransactionId.value = transactionId;
    await transactionsStore.deleteTransaction(transactionId);
    deletingTransactionId.value = null;
};

// REMOVED old exportTransactions function
</script>
