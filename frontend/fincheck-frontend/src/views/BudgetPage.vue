<template>
    <div class="p-6">
        <h1 v-if="budget" class="text-2xl font-bold text-gray-800 mb-6">Budget Overview for {{
            getMonthName(budget.month) }}, {{ budget.year }}</h1>
        <h1 v-else class="text-2xl font-bold text-gray-800 mb-6">Budget Overview</h1>

        <div v-if="isLoading" class="text-center py-8">
            <i class="pi pi-spinner pi-spin text-2xl text-blue-600"></i>
            <p class="mt-2 text-gray-600">Loading budget...</p>
        </div>

        <div v-else-if="budget">
            <BudgetDocument :budget="budget" @budget-updated="fetchBudget" @budget-deleted="handleBudgetDeleted" />
        </div>

        <div v-else class="text-center py-8">
            <p class="text-gray-600">No budget data available</p>
            <AddBudgetEntryForm class="mt-8" @budget-created="handleBudgetCreated" />
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { FinanceService } from '@/services/financeService';
import BudgetDocument from '@/components/finances/BudgetDocument.vue';
import AddBudgetEntryForm from '@/components/finances/AddBudgetEntryForm.vue';

const budget = ref(null);
const isLoading = ref(false);

const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

const getMonthName = (monthIndex) => {
    return monthNames[monthIndex] || 'Unknown';
};

const fetchBudget = async () => {
    isLoading.value = true;

    try {
        budget.value = await FinanceService.getBudgetData();
        console.log('Budget:', budget.value);
    } catch (err) {
        console.error('Error fetching budget:', err);
        budget.value = null;
    } finally {
        isLoading.value = false;
    }
};

const handleBudgetCreated = (newBudget) => {
    fetchBudget();
};

const handleBudgetDeleted = () => {
    // Clear the budget and refetch to show the "no budget" state
    budget.value = null;
    fetchBudget();
};

onMounted(() => {
    fetchBudget();
});
</script>

<style></style>