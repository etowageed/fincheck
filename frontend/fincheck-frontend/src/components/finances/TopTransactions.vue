<template>
    <div class="bg-primary rounded-lg shadow-sm border border-default p-6 mt-6">
        <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-semibold text-primary">Largest Expenses ({{ selectedPeriod.label }})</h3>
            <TimelineFilter @period-changed="handlePeriodChange" />
        </div>

        <div v-if="isLoading" class="text-center py-8">
            <i class="pi pi-spinner pi-spin text-2xl text-accent-blue"></i>
            <p class="mt-2 text-secondary">Loading transactions...</p>
        </div>

        <div v-else-if="error" class="text-center py-8">
            <i class="pi pi-exclamation-triangle text-2xl text-accent-red mb-2"></i>
            <p class="text-accent-red">{{ error }}</p>
        </div>

        <div v-else-if="transactions.length > 0">
            <ol class="space-y-4">
                <li v-for="tx in transactions" :key="tx._id"
                    class="flex justify-between items-center gap-4 p-3 bg-secondary rounded-lg">
                    <div class="flex-1 min-w-0">
                        <p class="font-medium text-primary truncate" :title="tx.description">{{ tx.description }}</p>
                        <p class="text-xs text-muted">{{ tx.categoryName }} &middot; {{ formatDate(tx.date) }}</p>
                    </div>
                    <div class="text-right">
                        <p class="font-semibold text-lg text-accent-red whitespace-nowrap">{{ formatCurrency(tx.amount)
                            }}</p>
                    </div>
                </li>
            </ol>
        </div>

        <div v-else class="text-center py-8 text-muted">
            <p>No expense transactions found in this period.</p>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { FinanceService } from '@/services/financeService';
import TimelineFilter from '../common/TimelineFilter.vue';

const isLoading = ref(true);
const error = ref('');
const transactions = ref([]);
const selectedPeriod = ref({ label: '1Y', value: 365 }); // Default period

const fetchTopTransactions = async () => {
    isLoading.value = true;
    error.value = '';
    try {
        const response = await FinanceService.getTopTransactions({ days: selectedPeriod.value.value });
        if (response.status === 'success' && response.data) {
            transactions.value = response.data;
        }
    } catch (err) {
        error.value = 'Failed to load top transactions.';
        console.error(err);
    } finally {
        isLoading.value = false;
    }
};

const handlePeriodChange = (newPeriod) => {
    selectedPeriod.value = newPeriod;
    fetchTopTransactions();
};

const formatCurrency = (value) => {
    if (typeof value !== 'number') return '$0.00';
    return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
};

const formatDate = (dateValue) => {
    if (!dateValue) return 'No date';
    return new Date(dateValue).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

onMounted(() => {
    fetchTopTransactions();
});
</script>