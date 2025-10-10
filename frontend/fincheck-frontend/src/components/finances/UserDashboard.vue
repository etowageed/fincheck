<template>
    <div class="space-y-6">
        <div class="bg-primary rounded-lg shadow-sm border border-default p-6">
            <div class="flex items-center gap-3 mb-4">
                <i class="pi pi-chart-line text-2xl text-accent-blue"></i>
                <h2 class="text-xl font-semibold text-primary">Financial Overview</h2>
            </div>

            <div v-if="!isLoading && !error">
                <DashboardInsights :metrics="metrics" :comparison="comparison" />
            </div>




            <div v-if="isLoading" class="text-center py-8">
                <i class="pi pi-spinner pi-spin text-2xl text-accent-blue"></i>
                <p class="mt-2 text-secondary">Loading your financial metrics...</p>
            </div>

            <div v-else-if="error" class="text-center py-8">
                <i class="pi pi-exclamation-triangle text-2xl text-accent-red mb-2"></i>
                <p class="text-accent-red">{{ error }}</p>
                <Button label="Retry" icon="pi pi-refresh" @click="loadMetrics" severity="secondary" size="small"
                    class="mt-3" />
            </div>

            <!-- Income card -->
            <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div class="bg-secondary rounded-lg p-4 border border-default">
                    <div class="flex items-center justify-between mb-2">
                        <div class="flex items-center gap-2">
                            <i class="pi pi-arrow-up text-accent-green"></i>
                            <span class="text-sm font-medium text-secondary">Total Income</span>
                        </div>
                        <span :class="getComparisonDisplay('incomeTotal').class" class="text-xs font-medium">
                            {{ getComparisonDisplay('incomeTotal').text }}
                        </span>
                    </div>
                    <p class="text-2xl font-bold text-accent-green">${{ formatCurrency(metrics.incomeTotal) }}</p>
                </div>
                <!-- Expense card -->
                <div class="bg-secondary rounded-lg p-4 border border-default">
                    <div class="flex items-center justify-between mb-2">
                        <div class="flex items-center gap-2">
                            <i class="pi pi-arrow-down text-accent-red"></i>
                            <span class="text-sm font-medium text-secondary">Total Expenses</span>
                        </div>
                        <span :class="getComparisonDisplay('expensesTotal', true).class" class="text-xs font-medium">
                            {{ getComparisonDisplay('expensesTotal', true).text }}
                        </span>
                    </div>
                    <p class="text-2xl font-bold text-accent-red">${{ formatCurrency(metrics.expensesTotal) }}</p>
                </div>

                <!-- Safe to Spend card -->
                <div class="bg-secondary rounded-lg p-4 border border-default">
                    <div class="flex items-center justify-between mb-2">
                        <div class="flex items-center gap-2">
                            <i class="pi pi-wallet text-accent-blue"></i>
                            <span class="text-sm font-medium text-secondary">Safe to Spend</span>
                        </div>
                        <span :class="getComparisonDisplay('safeToSpend').class" class="text-xs font-medium">
                            {{ getComparisonDisplay('safeToSpend').text }}
                        </span>
                    </div>
                    <p class="text-2xl font-bold text-accent-blue">${{ formatCurrency(metrics.safeToSpend) }}</p>
                </div>
                <!--  -->
                <!-- Monthly Budget card -->
                <div class="bg-secondary rounded-lg p-4 border border-default">
                    <div class="flex items-center justify-between mb-2">
                        <div class="flex items-center gap-2">
                            <i class="pi pi-calendar text-primary"></i>
                            <span class="text-sm font-medium text-secondary">Monthly Budget</span>
                        </div>
                        <span :class="getComparisonDisplay('totalMonthlyBudget', true).class"
                            class="text-xs font-medium">
                            {{ getComparisonDisplay('totalMonthlyBudget', true).text }}
                        </span>
                    </div>
                    <p class="text-2xl font-bold text-primary">${{ formatCurrency(metrics.totalMonthlyBudget) }}</p>
                </div>

                <div class="bg-secondary rounded-lg p-4 border border-default">
                    <div class="flex items-center justify-between mb-2">
                        <div class="flex items-center gap-2">
                            <i class="pi pi-minus-circle text-accent-red"></i>
                            <span class="text-sm font-medium text-secondary">Outflow</span>
                        </div>
                    </div>
                    <p class="text-2xl font-bold text-accent-red">${{ formatCurrency(metrics.outflow) }}</p>
                </div>

                <div class="bg-secondary rounded-lg p-4 border border-default">
                    <div class="flex items-center justify-between mb-2">
                        <div class="flex items-center gap-2">
                            <i class="pi pi-piggy-bank text-accent-green"></i>
                            <span class="text-sm font-medium text-secondary">Planned Savings</span>
                        </div>
                        <span :class="getComparisonDisplay('plannedSavings').class" class="text-xs font-medium">
                            {{ getComparisonDisplay('plannedSavings').text }}
                        </span>
                    </div>
                    <p class="text-2xl font-bold text-accent-green">${{ formatCurrency(metrics.plannedSavings) }}</p>
                </div>
            </div>
        </div>

        <div class="bg-primary rounded-lg shadow-sm border border-default p-6">
            <div class="flex items-center gap-3 mb-4">
                <i class="pi pi-chart-pie text-xl text-accent-blue"></i>
                <h3 class="text-lg font-semibold text-primary">Budget Breakdown</h3>
            </div>

            <div v-if="!isLoading && !error" class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="space-y-3">
                    <h4 class="font-medium text-secondary">Expense Categories</h4>

                    <div class="space-y-2">
                        <div class="flex justify-between items-center p-3 bg-secondary rounded border border-default">
                            <div class="flex items-center gap-2">
                                <i class="pi pi-refresh text-accent-blue"></i>
                                <span class="text-sm text-secondary">Recurring Expenses</span>
                            </div>
                            <span class="font-semibold text-primary">${{ formatCurrency(metrics.totalRecurringExpenses)
                            }}</span>
                        </div>

                        <div class="flex justify-between items-center p-3 bg-secondary rounded border border-default">
                            <div class="flex items-center gap-2">
                                <i class="pi pi-stop text-muted"></i>
                                <span class="text-sm text-secondary">One-time Expenses</span>
                            </div>
                            <span class="font-semibold text-primary">${{
                                formatCurrency(metrics.totalNonRecurringExpenses) }}</span>
                        </div>

                        <div class="flex justify-between items-center p-3 bg-secondary rounded border border-default">
                            <div class="flex items-center gap-2">
                                <i class="pi pi-eye-slash text-muted"></i>
                                <span class="text-sm text-secondary">Excluded Expenses</span>
                            </div>
                            <span class="font-semibold text-primary">${{ formatCurrency(metrics.excludedExpensesTotal)
                            }}</span>
                        </div>
                    </div>
                </div>

                <div class="space-y-3">
                    <h4 class="font-medium text-secondary">Financial Health</h4>

                    <div class="p-4 bg-secondary rounded border border-default">
                        <div class="flex items-center justify-between mb-2">
                            <span class="text-sm text-secondary">Budget Utilization</span>
                            <span class="text-sm font-medium text-primary">{{ getBudgetUtilization() }}%</span>
                        </div>
                        <ProgressBar :value="getBudgetUtilization()" :class="getBudgetUtilizationClass()" class="h-2" />
                        <p class="text-xs text-muted mt-1">{{ getBudgetHealthMessage() }}</p>
                    </div>

                    <div class="p-4 bg-secondary rounded border border-default">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-2">
                                <i :class="getHealthIcon()" :style="{ color: getHealthColor() }"></i>
                                <span class="text-sm text-secondary">Overall Status</span>
                            </div>
                            <span class="font-medium" :style="{ color: getHealthColor() }">{{ getHealthStatus()
                            }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { FinanceService } from '@/services/financeService';
import DashboardInsights from '@/components/finances/DashboardInsights.vue';


const metrics = ref({});
const comparison = ref({});
const isLoading = ref(true);
const error = ref('');


const getComparisonDisplay = (metricKey, isExpense = false) => {
    const comparisonData = comparison.value[metricKey];

    // If the specific metric comparison exists in the loaded data
    if (comparisonData) {
        return {
            text: `${comparisonData.displayValue} vs. last month`,
            class: getComparisonClass(comparisonData.direction, isExpense),
        };
    }

    // If data is missing (e.g., for a new user/month)
    return {
        text: 'N/A vs. last month',
        class: 'text-muted', // Use muted color for N/A
    };
};


const loadMetrics = async () => {
    isLoading.value = true;
    error.value = '';

    // 1. Fetch main metrics (REQUIRED)
    try {
        const metricsRes = await FinanceService.getDashboardMetrics();
        metrics.value = metricsRes.data?.metrics || {};
    } catch (err) {
        // If critical metrics fail, set error and exit the function.
        error.value = 'Failed to load financial metrics';
        console.error(err);
        isLoading.value = false;
        return;
    }

    // 2. Fetch comparison data (OPTIONAL)
    try {
        const comparisonRes = await FinanceService.getPeriodComparison('month');
        comparison.value = comparisonRes.comparison || {};
    } catch (err) {
        // If comparison fails (e.g., missing previous month data), 
        // we just log a warning and let comparison.value remain as {} (or be set to {})
        console.warn('Skipping month-over-month comparison due to insufficient data.', err);
        comparison.value = {}; // Ensure it's explicitly set to an empty object on failure.
    } finally {
        isLoading.value = false;
    }
};

const getComparisonClass = (direction, isExpense = false) => {
    // For expenses/budget, a 'decrease' is good (green), and an 'increase' is bad (red)
    if (isExpense) {
        if (direction === 'decrease') return 'text-accent-green';
        if (direction === 'increase') return 'text-accent-red';
    }
    // For income/savings/safeToSpend, a 'decrease' is bad (red), and an 'increase' is good (green)
    else {
        if (direction === 'decrease') return 'text-accent-red';
        if (direction === 'increase') return 'text-accent-green';
    }
    return 'text-muted'; // 'same' or 'N/A'
};

const formatCurrency = (amount) => {
    return (amount || 0).toLocaleString('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    });
};

const getBudgetUtilization = () => {
    if (!metrics.value.totalMonthlyBudget || metrics.value.totalMonthlyBudget === 0) return 0;
    return Math.round((metrics.value.expensesTotal / metrics.value.totalMonthlyBudget) * 100);
};

const getBudgetUtilizationClass = () => {
    const utilization = getBudgetUtilization();
    if (utilization > 90) return 'text-red-600';
    if (utilization > 75) return 'text-yellow-600';
    return 'text-green-600';
};

const getBudgetHealthMessage = () => {
    const utilization = getBudgetUtilization();
    if (utilization > 90) return 'Budget exceeded - consider adjusting spending';
    if (utilization > 75) return 'Approaching budget limit';
    return 'Healthy budget utilization';
};

const getHealthStatus = () => {
    const safeToSpend = metrics.value.safeToSpend || 0;
    if (safeToSpend > 0) return 'Good';
    if (safeToSpend === 0) return 'Neutral';
    return 'Attention Needed';
};

const getHealthColor = () => {
    const safeToSpend = metrics.value.safeToSpend || 0;
    if (safeToSpend > 0) return 'rgb(22, 163, 74)'; // green-600
    if (safeToSpend === 0) return 'rgb(107, 114, 128)'; // gray-500
    return 'rgb(220, 38, 38)'; // red-600
};

const getHealthIcon = () => {
    const safeToSpend = metrics.value.safeToSpend || 0;
    if (safeToSpend > 0) return 'pi pi-check-circle';
    if (safeToSpend === 0) return 'pi pi-minus-circle';
    return 'pi pi-exclamation-triangle';
};

onMounted(() => {
    loadMetrics();
});
</script>