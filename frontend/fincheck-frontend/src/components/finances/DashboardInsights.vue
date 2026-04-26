<template>
    <div v-if="insights.length > 0" class="bg-primary rounded-lg shadow-sm border border-default p-4 mb-6">
        <h3 class="text-sm font-bold uppercase tracking-wider text-accent-blue mb-3 flex items-center gap-2">
            <i class="pi pi-lightbulb text-lg"></i>
            Insights
        </h3>
        <ul class="space-y-2">
            <li v-for="(insight, index) in insights" :key="index"
                class="flex items-center gap-2 text-sm sm:text-base font-medium text-primary leading-relaxed">
                <i :class="insight.iconClass" class="text-lg"></i>
                <span>{{ insight.message }}</span>
            </li>
        </ul>
    </div>
</template>

<script setup>
import { computed } from 'vue';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();

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
    const effectiveBudget = (props.metrics.totalMonthlyBudget || 0) + (props.metrics.rolloverAmount || 0);
    if (!effectiveBudget || effectiveBudget === 0) return 0;
    return Math.round((props.metrics.expensesTotal / effectiveBudget) * 100);
});

const insights = computed(() => {
    const list = [];
    const utilization = getBudgetUtilization.value;
    const expenseComparison = props.comparison.expensesTotal;
    const budgetBalance = props.metrics.budgetBalance || 0; // Use the new metric

    // Insight 1: Budget Utilization Warning (KEEP)
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

    // Insight 2: High Spending Change (KEEP)
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

    // Insight 3: Safety Net Check -> REPLACED WITH BUDGET HEALTH CHECK
    if (budgetBalance < 0) {
        list.push({
            message: `You are over budget. Your Budget Balance is negative. Adjust your spending immediately.`,
            iconClass: 'pi pi-info-circle text-accent-red'
        });
    } else if (budgetBalance > 0 && props.metrics.plannedSavings > 0) {
        list.push({
            message: `You have a positive Budget Balance. You're meeting your planned savings goal!`,
            iconClass: 'pi pi-check-circle text-accent-green'
        });
    }

    if (authStore.isPremium) {
        const effectiveBudget = (props.metrics.totalMonthlyBudget || 0) + (props.metrics.rolloverAmount || 0);
        if (effectiveBudget > 0) {
            const today = new Date();
            const currentDay = today.getDate();
            const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
            
            if (currentDay > 0) {
                const projectedSpend = (props.metrics.expensesTotal / currentDay) * daysInMonth;
                const projectedUtilization = Math.round((projectedSpend / effectiveBudget) * 100);
                
                if (projectedUtilization >= 100) {
                    list.unshift({
                        message: `Predictive Insight: At your current rate, you are projected to exceed your budget by end of month (${projectedUtilization}% utilization).`,
                        iconClass: 'pi pi-chart-line text-accent-red font-bold'
                    });
                } else if (projectedUtilization <= 85) {
                    list.unshift({
                        message: `Predictive Insight: Great pacing! You are projected to finish the month well under budget (${projectedUtilization}% utilization).`,
                        iconClass: 'pi pi-chart-line text-accent-green font-bold'
                    });
                }
            }
        }
    }

    return list;
});
</script>