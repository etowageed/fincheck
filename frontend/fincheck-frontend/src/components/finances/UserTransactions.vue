<!-- src/components/dashboard/UserTransactions.vue -->
<template>
    <div class="p-6">
        <h1 class="text-2xl font-bold text-gray-800 mb-6">Transactions</h1>

        <div v-if="isLoading" class="text-center py-8">
            <i class="pi pi-spinner pi-spin text-2xl text-blue-600"></i>
            <p class="mt-2 text-gray-600">Loading transactions...</p>
        </div>

        <div v-else-if="error" class="text-center text-red-500 py-8">
            {{ error }}
        </div>

        <div v-else-if="transactions.length > 0">
            <TransactionDocument :transactions="transactions" @transactions-updated="fetchTransactions" />
        </div>

        <div v-else class="text-center py-8">
            <p class="text-gray-600 mb-4">No transactions found</p>
            <UnifiedItemForm formType="transaction" @transaction-added="handleTransactionAdded" />
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '@/services/api';
import TransactionDocument from './TransactionDocument.vue';
import UnifiedItemForm from './UnifiedItemForm.vue';

const transactions = ref([]);
const isLoading = ref(false);
const error = ref('');

const fetchTransactions = async () => {
    isLoading.value = true;
    error.value = '';

    try {
        // Get current month and year
        const currentDate = new Date();
        const month = currentDate.getMonth();
        const year = currentDate.getFullYear();

        // Try to get the finance document for current month
        const res = await api.get(`/finances/${month}/${year}`);
        transactions.value = res.data.data?.transactions || [];
        console.log('Transactions:', transactions.value);
    } catch (err) {
        console.error('Error fetching transactions:', err);
        if (err.response?.status === 404) {
            // No finance document for current month yet
            transactions.value = [];
        } else {
            error.value = 'Failed to load transactions';
        }
    } finally {
        isLoading.value = false;
    }
};

const handleTransactionAdded = () => {
    fetchTransactions();
};

onMounted(() => {
    fetchTransactions();
});
</script>