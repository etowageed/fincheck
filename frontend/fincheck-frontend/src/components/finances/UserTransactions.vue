<template>
    <div class="p-6">
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-2xl font-bold text-gray-800">Transactions</h1>
            <div>
                <SelectButton v-model="selectedPeriod" :options="periods" optionLabel="label" aria-labelledby="basic" />
            </div>
        </div>

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
            <p class="text-gray-600 mb-4">No transactions found for this period.</p>
            <ItemForm formType="transaction" />
        </div>
    </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'; // Import watch and ref
import { useTransactionsStore } from '@/stores/transactions';
import TransactionDocument from './TransactionDocument.vue';
import ItemForm from './ItemForm.vue';
import SelectButton from 'primevue/selectbutton'; // Import SelectButton

const transactionsStore = useTransactionsStore();

// 💰 NEW: Local state for transactions timeline filter
const periods = ref([
    { label: '1M', value: 30 },
    { label: '3M', value: 90 },
    { label: '6M', value: 180 },
    { label: '1Y', value: 365 },
]);
const selectedPeriod = ref(periods.value[0]); // Default to 1M

const fetchTransactions = (days) => {
    transactionsStore.fetchTransactions({ days });
};

// 💰 NEW: Watch the local period to trigger transaction fetch
watch(selectedPeriod, (newValue) => {
    if (newValue && newValue.value) {
        fetchTransactions(newValue.value);
    }
}, { immediate: false }); // Do not run on mount, let onMounted handle initial fetch

onMounted(() => {
    // Initial fetch uses the default period (1M/30 days)
    fetchTransactions(selectedPeriod.value.value);
});
</script>