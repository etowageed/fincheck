<template>
    <div class="p-6">
        <h1 v-if="budgetStore.getBudget" class="text-2xl md:text-3xl font-extrabold tracking-tight text-primary leading-tight mb-6">Budget Overview for {{
            getMonthName(budgetStore.getBudget.month) }}, {{ budgetStore.getBudget.year }}</h1>
        <h1 v-else class="text-2xl md:text-3xl font-extrabold tracking-tight text-primary leading-tight mb-6">Budget Overview</h1>

        <div v-if="budgetStore.isLoading" class="text-center py-8">
            <i class="pi pi-spinner pi-spin text-2xl text-blue-600"></i>
            <p class="mt-2 text-secondary font-medium">Loading budget...</p>
        </div>

        <div v-else-if="budgetStore.getBudget">
            <BudgetDocument :budget="budgetStore.getBudget" @budget-updated="fetchBudget"
                @budget-deleted="handleBudgetDeleted" />
        </div>

        <div v-else class="text-center py-8">
            <p class="text-secondary font-medium">No budget data available</p>
            <AddBudgetEntryForm class="mt-8" @budget-created="handleBudgetCreated" />
        </div>
    </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useBudgetStore } from '@/stores/budget';
import BudgetDocument from '@/components/finances/BudgetDocument.vue';
import AddBudgetEntryForm from '@/components/finances/AddBudgetEntryForm.vue';

const budgetStore = useBudgetStore();

const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

const getMonthName = (monthIndex) => {
    return monthNames[monthIndex] || 'Unknown';
};

const fetchBudget = async () => {
    await budgetStore.fetchBudget();
};

const handleBudgetCreated = async (budgetData) => {
    await budgetStore.createBudget(budgetData);
};

const handleBudgetDeleted = () => {
    budgetStore.fetchBudget();
};

onMounted(() => {
    budgetStore.fetchBudget();
});
</script>

<style></style>