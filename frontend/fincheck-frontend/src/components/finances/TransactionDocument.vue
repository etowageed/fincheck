<template>
    <div class="space-y-6">
        <!-- Transactions Header -->
        <div class="bg-primary rounded-lg shadow-sm border border-default p-6">
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg font-semibold text-primary">Transactions Overview</h3>
                <DropdownMenu :items="headerMenuItems" @action="handleHeaderAction" />
            </div>
            <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                    <p class="text-sm text-muted">Total Transactions</p>
                    <p class="font-medium text-primary">{{ transactions.length }}</p>
                </div>
                <div>
                    <p class="text-sm text-muted">Total Income</p>
                    <p class="font-medium text-accent-green">${{ totalIncome.toFixed(2) }}</p>
                </div>
                <div>
                    <p class="text-sm text-muted">Total Expenses</p>
                    <p class="font-medium text-accent-red">${{ Math.abs(totalExpenses).toFixed(2) }}</p>
                </div>
            </div>
        </div>

        <!-- Transactions List -->
        <div class="bg-primary rounded-lg shadow-sm border border-default p-6">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-lg font-semibold text-primary">Recent Transactions</h2>
                <ItemForm ref="addTransactionFormRef" formType="transaction"
                    @transaction-added="handleTransactionAdded" />
            </div>

            <div v-if="transactions && transactions.length > 0" class="space-y-3">
                <div v-for="transaction in transactions" :key="transaction._id"
                    class="flex justify-between items-center p-4 bg-secondary rounded-lg">
                    <div class="flex-1">
                        <div class="flex items-center gap-2 mb-1">
                            <p class="font-medium text-primary">{{ transaction.description || 'No description' }}</p>
                            <span class="text-xs px-2 py-1 rounded-full bg-tertiary text-accent-blue capitalize">
                                {{ transaction.category || 'Uncategorized' }}
                            </span>
                            <span v-if="transaction.type" class="text-xs px-2 py-1 rounded-full capitalize"
                                :class="getTypeClass(transaction.type)">
                                {{ transaction.type }}
                            </span>
                        </div>
                        <p class="text-xs text-muted">
                            {{ formatDate(transaction.date || transaction.createdAt) }}
                        </p>
                    </div>
                    <div class="text-right flex items-center gap-2">
                        <p class="font-semibold text-lg" :class="getAmountClass(transaction.amount, transaction.type)">
                            {{ formatCurrency(transaction.amount) }}
                        </p>
                        <DropdownMenu :items="transactionMenuItems" :entity="transaction"
                            :disabled="deletingTransactionId === transaction._id" @action="handleTransactionAction" />
                    </div>
                </div>

                <!-- Net Total -->
                <div class="border-t border-default pt-4 mt-6">
                    <div class="flex justify-between items-center font-semibold text-lg">
                        <span class="text-primary">Net Total:</span>
                        <span :class="netTotal >= 0 ? 'text-accent-green' : 'text-accent-red'">
                            {{ formatCurrency(netTotal) }}
                        </span>
                    </div>
                </div>
            </div>
            <div v-else class="text-center py-4 text-muted">
                No transactions yet. Add some transactions to get started.
            </div>
        </div>

        <!-- Edit Transaction Form (hidden, controlled programmatically) -->
        <ItemForm ref="editTransactionFormRef" formType="transaction" :edit-item="editingTransaction"
            @transaction-updated="handleTransactionUpdated" style="display: none;" />
    </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { FinanceService } from '@/services/financeService';
import ItemForm from './ItemForm.vue';
import DropdownMenu from '../common/DropdownMenu.vue';

const props = defineProps({
    transactions: {
        type: Array,
        required: true
    }
});

const emit = defineEmits(['transactionsUpdated']);

// Refs
const deletingTransactionId = ref(null);
const addTransactionFormRef = ref(null);
const editTransactionFormRef = ref(null);
const editingTransaction = ref(null);

// Computed values
const totalIncome = computed(() => {
    return props.transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);
});

const totalExpenses = computed(() => {
    return props.transactions
        .filter(t => t.type === 'expense' || t.type === 'excludedExpense')
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);
});

const netTotal = computed(() => {
    return props.transactions.reduce((sum, t) => {
        if (t.type === 'income') {
            return sum + Math.abs(t.amount);
        } else {
            return sum - Math.abs(t.amount);
        }
    }, 0);
});

// Menu configurations
const headerMenuItems = [
    {
        label: 'Export Transactions',
        icon: 'pi pi-download',
        action: 'export'
    }
];

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
const formatCurrency = (value) => {
    if (typeof value !== 'number') return '$0.00';
    return Math.abs(value).toLocaleString(undefined, { style: 'currency', currency: 'USD' });
};

const formatDate = (dateValue) => {
    if (!dateValue) {
        return 'No date';
    }

    try {
        let date;

        // Handle different date formats
        if (dateValue instanceof Date) {
            date = dateValue;
        } else if (typeof dateValue === 'string' || typeof dateValue === 'number') {
            date = new Date(dateValue);
        } else {
            return 'Invalid date';
        }

        // Check if date is valid
        if (isNaN(date.getTime())) {
            return 'Invalid date';
        }

        // Format the date
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    } catch (error) {
        console.error('Error formatting date:', error, 'for value:', dateValue);
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
    if (type === 'income') {
        return 'text-accent-green';
    } else {
        return 'text-accent-red';
    }
};

// Action handlers
const handleHeaderAction = ({ action }) => {
    switch (action) {
        case 'export':
            exportTransactions();
            break;
    }
};

const handleTransactionAction = ({ action, entity }) => {
    switch (action) {
        case 'edit':
            editTransaction(entity);
            break;
        case 'delete':
            deleteTransaction(entity._id);
            break;
    }
};

// Transaction functions (using FinanceService)
const handleTransactionAdded = () => {
    emit('transactionsUpdated');
};

const handleTransactionUpdated = () => {
    editingTransaction.value = null;
    emit('transactionsUpdated');
};

const editTransaction = (transaction) => {
    editingTransaction.value = transaction;

    if (editTransactionFormRef.value) {
        editTransactionFormRef.value.openDialog();
    }
};

const deleteTransaction = async (transactionId) => {
    if (!confirm('Are you sure you want to delete this transaction?')) {
        return;
    }

    deletingTransactionId.value = transactionId;

    try {
        const { month, year } = FinanceService._getCurrentMonthYear();
        await FinanceService.deleteTransaction(month, year, transactionId);
        emit('transactionsUpdated');
    } catch (error) {
        console.error('Error deleting transaction:', error);
        alert('Failed to delete transaction. Please try again.');
    } finally {
        deletingTransactionId.value = null;
    }
};

const exportTransactions = () => {
    // TODO: Implement export functionality using FinanceService
    console.log('Export transactions functionality not implemented yet');
};
</script>