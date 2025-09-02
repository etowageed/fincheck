<!-- src/components/dashboard/UserMetrics.vue -->
<template>
    <div>
        <h2>User Financial Metrics</h2>
        <div v-if="isLoading">Loading...</div>
        <div v-else-if="error">{{ error }}</div>
        <div v-else>
            <ul>
                <li><strong>Total Income:</strong> {{ metrics.incomeTotal }}</li>
                <li><strong>Total Expenses:</strong> {{ metrics.expensesTotal }}</li>
                <li><strong>Excluded Expenses:</strong> {{ metrics.excludedExpensesTotal }}</li>
                <li><strong>Outflow:</strong> {{ metrics.outflow }}</li>
                <li><strong>Safe To Spend:</strong> {{ metrics.safeToSpend }}</li>
                <li><strong>Total Monthly Budget:</strong> {{ metrics.totalMonthlyBudget }}</li>
                <li><strong>Total Recurring Expenses:</strong> {{ metrics.totalRecurringExpenses }}</li>
                <li><strong>Total Non-Recurring Expenses:</strong> {{ metrics.totalNonRecurringExpenses }}</li>
                <li><strong>Planned Savings:</strong> {{ metrics.plannedSavings }}</li>
            </ul>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '@/services/api';

const metrics = ref({});
const isLoading = ref(true);
const error = ref('');

onMounted(async () => {
    isLoading.value = true;
    error.value = '';
    try {
        const res = await api.get('/users/me');
        metrics.value = res.data?.data?.dashboard?.metrics || {};
    } catch (err) {
        error.value = 'Failed to load metrics';
        console.error(err);
    } finally {
        isLoading.value = false;
    }
});
</script>