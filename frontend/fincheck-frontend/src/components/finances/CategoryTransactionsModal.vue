<template>
    <Dialog :visible="visible" @update:visible="$emit('update:visible', $event)" modal
        :header="`Transactions for: ${categoryName}`" :style="{ width: '50vw' }">
        <div v-if="isLoading" class="text-center py-8">
            <i class="pi pi-spinner pi-spin text-2xl text-accent-blue"></i>
            <p class="mt-2 text-secondary">Loading category transactions...</p>
        </div>
        <div v-else-if="error" class="text-center py-8">
            <i class="pi pi-exclamation-triangle text-2xl text-accent-red mb-2"></i>
            <p class="text-accent-red">{{ error }}</p>
        </div>
        <div v-else-if="transactions.length > 0" class="space-y-3 max-h-96 overflow-y-auto">
            <div v-for="tx in transactions" :key="tx._id"
                class="flex justify-between items-center p-3 bg-secondary rounded-lg">
                <div class="flex-1">
                    <p class="font-medium text-primary">{{ tx.description || 'No description' }}</p>
                    <p class="text-xs text-muted">{{ formatDate(tx.date) }} &middot; {{ tx.type }}</p>
                </div>
                <div class="text-right">
                    <p class="font-semibold text-lg"
                        :class="tx.type === 'income' ? 'text-accent-green' : 'text-accent-red'">
                        ${{ Math.abs(tx.amount).toFixed(2) }}
                    </p>
                </div>
            </div>
        </div>
        <div v-else class="text-center py-4 text-muted">
            No transactions found for this category in the last 90 days.
        </div>
    </Dialog>
</template>

<script setup>
import { ref, watch } from 'vue';
import { FinanceService } from '@/services/financeService';

const props = defineProps({
    visible: Boolean,
    categoryId: String,
    categoryName: String
});

const emit = defineEmits(['update:visible']);

const isLoading = ref(false);
const error = ref('');
const transactions = ref([]);

const fetchTransactions = async (categoryId) => {
    isLoading.value = true;
    error.value = '';
    transactions.value = [];

    // NOTE: This assumes FinanceService.getAllTransactions is updated to accept a categoryId filter.
    try {
        // Fetch transactions for the last 90 days, filtered by categoryId
        const response = await FinanceService.getAllTransactions({ days: 90, category: categoryId });

        if (response.status === 'success' && Array.isArray(response.data)) {
            // Filter to only include expenses, as the breakdown chart only shows expenses
            transactions.value = response.data.filter(tx => tx.type === 'expense');
        } else {
            transactions.value = [];
        }
    } catch (err) {
        error.value = 'Failed to load transactions for this category.';
        console.error(err);
    } finally {
        isLoading.value = false;
    }
};

const formatDate = (dateValue) => {
    if (!dateValue) return 'No date';
    return new Date(dateValue).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

// Watch visibility and categoryId to trigger the fetch
watch(() => props.visible, (newVal) => {
    if (newVal && props.categoryId && typeof props.categoryId === 'string' && props.categoryId.length > 0) {
        fetchTransactions(props.categoryId);
    } else {
        // Clear data when modal closes or if data is invalid when opening
        transactions.value = [];
    }
});
</script>