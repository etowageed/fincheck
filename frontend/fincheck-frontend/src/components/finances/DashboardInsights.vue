<template>
    <div v-if="insights.length > 0" class="bg-primary rounded-lg shadow-sm border border-default p-4 mb-6">
        <h3 class="text-sm font-semibold text-accent-blue mb-3 flex items-center gap-2">
            <i class="pi pi-lightbulb text-lg"></i>
            Financial Insights
        </h3>
        <ul class="space-y-2">
            <li v-for="(insight, index) in insights" :key="index"
                class="flex items-center gap-2 text-sm text-text-primary">
                <i :class="insight.iconClass" class="text-lg"></i>
                <span>{{ insight.message }}</span>
            </li>
        </ul>
    </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
    metrics: {
        type: Object,
        required: true
    },
    comparison: {
        type: Object,
        default: () => ({})
    }
});

const getBudgetUtilization = computed(() => {
    if (!props.metrics.totalMonthlyBudget || props.metrics.totalMonthlyBudget === 0) return 0;
    return Math.round((props.metrics.expensesTotal / props.metrics.totalMonthlyBudget) * 100);
});

const insights = computed(() => {
    const list = [];
    const utilization = getBudgetUtilization.value;
    const expenseComparison = props.comparison.expensesTotal;

    // Insight 1: Budget Utilization Warning
    if (utilization >= 90) {
        list.push({
            message: `Attention! You've used ${utilization}% of your budget. Consider reducing spending to stay on track.`,
            iconClass: 'pi pi-exclamation-triangle text-accent-red'
        });
    } else if (utilization >= 75) {
        list.push({
            message: `You are approaching your budget limit (${utilization}% used). Keep an eye on your remaining balance!`,
            iconClass: 'pi pi-bell text-accent-red'
        });
    }

    // Insight 2: High Spending Change
    if (expenseComparison?.percentChange > 10 && expenseComparison.direction === 'increase') {
        list.push({
            message: `Your expenses are up ${expenseComparison.displayValue} vs. last month. Review your Top Transactions.`,
            iconClass: 'pi pi-arrow-up text-accent-red'
        });
    } else if (expenseComparison?.percentChange < -10 && expenseComparison.direction === 'decrease') {
        list.push({
            message: `Great job! Your spending is down ${Math.abs(expenseComparison.percentChange)}% this month.`,
            iconClass: 'pi pi-arrow-down text-accent-green'
        });
    }

    // Insight 3: Safety Net Check
    if (props.metrics.safeToSpend < 0) {
        list.push({
            message: `Your Safe to Spend is negative. You may need to allocate more income or reduce expenses.`,
            iconClass: 'pi pi-info-circle text-accent-red'
        });
    } else if (props.metrics.safeToSpend > 0 && props.metrics.plannedSavings > 0) {
        list.push({
            message: `You have a healthy Safe to Spend balance. You're meeting your planned savings goal!`,
            iconClass: 'pi pi-check-circle text-accent-green'
        });
    }

    return list;
});
</script>