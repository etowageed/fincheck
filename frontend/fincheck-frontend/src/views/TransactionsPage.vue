<template>
    <div>
        <UserTransactions />
    </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useTransactionsStore } from '@/stores/transactions';
import UserTransactions from '@/components/finances/UserTransactions.vue';

// Use the new store
const transactionsStore = useTransactionsStore();

// Fetch transactions when the component is first loaded
onMounted(() => {
    transactionsStore.fetchTransactions();
});
</script>
