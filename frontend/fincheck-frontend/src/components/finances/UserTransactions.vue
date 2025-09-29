<template>
    <div class="p-6">
        <h1 class="text-2xl font-bold text-gray-800 mb-6">Transactions</h1>

        <div v-if="transactionsStore.isLoading" class="text-center py-8">
            <i class="pi pi-spinner pi-spin text-2xl text-blue-600"></i>
            <p class="mt-2 text-gray-600">Loading transactions...</p>
        </div>

        <div v-else-if="transactionsStore.error" class="text-center text-red-500 py-8">
            {{ transactionsStore.error }}
        </div>

        <div v-else-if="transactionsStore.recentTransactions.length > 0">
            <TransactionDocument />
        </div>

        <div v-else class="text-center py-8">
            <p class="text-gray-600 mb-4">No transactions found for this month.</p>
            <ItemForm formType="transaction" />
        </div>
    </div>
</template>

<script setup>
import { useTransactionsStore } from '@/stores/transactions';
import TransactionDocument from './TransactionDocument.vue';
import ItemForm from './ItemForm.vue';

// The component's only job is to use the store.
// All logic is now handled by Pinia.
const transactionsStore = useTransactionsStore();
</script>