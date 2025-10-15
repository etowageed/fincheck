<template>
    <div class="bg-primary rounded-lg shadow-sm border border-default p-6 mt-6">
        <div class="flex justify-between items-center mb-4">
            <div class="flex items-center gap-4">
                <h3 class="text-lg font-semibold text-primary">Top Transactions</h3>
                <SelectButton v-model="selectedType" :options="transactionTypes" optionLabel="label"
                    aria-labelledby="basic" />
            </div>
        </div>

        <div v-if="isLoading" class="text-center py-8">
            <i class="pi pi-spinner pi-spin text-2xl text-accent-blue"></i>
            <p class="mt-2 text-secondary">Loading transactions...</p>
        </div>

        <div v-else-if="error" class="text-center py-8">
            <i class="pi pi-exclamation-triangle text-2xl text-accent-red mb-2"></i>
            <p class="text-accent-red">{{ error }}</p>
        </div>

        <div v-else-if="transactions.length > 0" class="space-y-3">
            <div v-for="(tx, index) in transactions" :key="tx._id" class="flex items-center gap-4 p-3">
                <div
                    class="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-secondary rounded-full font-bold text-primary">
                    {{ index + 1 }}
                </div>
                <div class="flex-1 min-w-0">
                    <p class="font-medium text-primary truncate" :title="tx.description">{{ tx.description }}</p>
                    <div class="flex items-center gap-2 text-xs text-muted">
                        <span class="px-2 py-0.5 rounded-full bg-tertiary text-accent-blue">{{ tx.categoryName
                        }}</span>
                        <span>&middot;</span>
                        <span>{{ formatDate(tx.date) }}</span>
                    </div>
                </div>
                <div class="text-right">
                    <p class="font-semibold text-lg whitespace-nowrap" :class="amountClass">
                        {{ formatCurrency(tx.amount) }}
                    </p>
                </div>
            </div>

        </div>

        <div v-else class="text-center py-8 text-muted">
            <p>No {{ selectedType.value }} transactions found in this period.</p>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { FinanceService } from '@/services/financeService';
// REMOVED TimelineFilter import
import { useCurrencyFormatter } from '@/composables/useCurrencyFormatter';
import { useDashboardStore } from '@/stores/dashboard'; // NEW: Import store

const { formatCurrency } = useCurrencyFormatter();
const dashboardStore = useDashboardStore(); // NEW: Use store

const isLoading = ref(true);
const error = ref('');
const transactions = ref([]);
// REMOVED selectedPeriod ref

const transactionTypes = ref([
    { label: 'Expenses', value: 'expense' },
    { label: 'Income', value: 'income' },
]);
const selectedType = ref(transactionTypes.value[0]);

const amountClass = computed(() => {
    return selectedType.value.value === 'income' ? 'text-accent-green' : 'text-accent-red';
});

const fetchTopTransactions = async () => {
    isLoading.value = true;
    error.value = '';
    try {
        const response = await FinanceService.getTopTransactions({
            // MODIFIED: Use period from store
            days: dashboardStore.getSelectedDays,
            type: selectedType.value.value
        });
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

// MODIFIED: Watch both selectedType and the new store period
watch([selectedType, () => dashboardStore.getSelectedDays], () => {
    fetchTopTransactions();
});

// REMOVED handlePeriodChange

const formatDate = (dateValue) => {
    if (!dateValue) return 'No date';
    return new Date(dateValue).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

onMounted(() => {
    fetchTopTransactions();
});
</script>