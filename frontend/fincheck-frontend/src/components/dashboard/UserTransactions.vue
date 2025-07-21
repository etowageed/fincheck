<!-- src/components/dashboard/UserTransactions.vue -->
<template>
    <div class="max-w-2xl mx-auto mt-8 shadow rounded p-6">
        <h2 class="text-xl font-bold mb-4">Recent Transactions</h2>
        <div v-if="loading" class="text-center py-8">Loading...</div>
        <div v-else-if="error" class="text-center text-red-500 py-8">{{ error }}</div>
        <ul v-else>
            <li v-for="(tx, idx) in transactions" :key="tx._id || idx"
                class="border-b py-2 flex justify-between items-center">
                <span>{{ tx.description || 'No description' }}</span>
                <span class="font-mono">{{ formatCurrency(tx.amount) }}</span>
            </li>
            <li v-if="transactions.length === 0" class="text-gray-400 text-center py-4">
                No transactions found.
            </li>
        </ul>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '@/services/api';

const transactions = ref([]);
const loading = ref(true);
const error = ref('');

onMounted(async () => {
    loading.value = true;
    error.value = '';
    try {
        const res = await api.get('/users/me');
        transactions.value = res.data?.data?.dashboard?.transactions || [];
    } catch (err) {
        error.value = 'Failed to load transactions';
        console.error(err);
    } finally {
        loading.value = false;
    }
});

function formatCurrency(value) {
    if (typeof value !== 'number') return value;
    return value.toLocaleString(undefined, { style: 'currency', currency: 'USD' });
}
</script>