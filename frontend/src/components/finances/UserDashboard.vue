<template>
    <div class="space-y-6">
        <div class="bg-primary rounded-lg shadow-sm border border-default p-4 sm:p-6">
            <div class="flex items-center gap-3 mb-4">
                <i class="pi pi-chart-line text-2xl text-accent-blue"></i>
                <h2 class="text-xl md:text-2xl font-bold tracking-tight text-primary leading-snug">Your Financial
                    Overview</h2>
            </div>

            <div v-if="!isLoading && !error">
                <!-- Rollover Prompt -->
                <div v-if="metrics.potentialRollover > 0 && !metrics.rolloverDismissed"
                    class="bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/50 rounded-lg p-4 flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
                    <div class="flex items-center gap-3">
                        <i class="pi pi-wallet text-2xl text-amber-600 dark:text-amber-400"></i>
                        <div>
                            <h4 class="font-bold text-amber-950 dark:text-amber-200 text-sm">Rollover Available</h4>
                            <p class="text-xs text-amber-800 dark:text-amber-300/90 mt-1 font-medium">You saved {{
                                formatCurrency(metrics.potentialRollover) }} last month. Would you like to roll it over
                                into this month's budget?</p>
                        </div>
                    </div>
                    <div class="flex gap-2 shrink-0">
                        <Button label="No Thanks" severity="secondary" size="small" outlined
                            @click="handleRollover(false)" :loading="isRollingOver" />
                        <Button label="Yes, Roll It Over" class="btn-cta" size="small" @click="handleRollover(true)"
                            :loading="isRollingOver" />
                    </div>
                </div>

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

            <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                    <p class="text-2xl font-bold text-accent-red">{{ formatCurrency(metrics.expensesTotal) }}</p>
                </div>

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
                    <p class="text-2xl font-bold text-accent-green">{{ formatCurrency(metrics.incomeTotal) }}</p>
                </div>

                <div class="bg-secondary rounded-lg p-4 border border-default">
                    <div class="flex items-center justify-between mb-2">
                        <div class="flex items-center gap-2">
                            <i class="pi pi-wallet text-accent-blue"></i>
                            <span class="text-sm font-medium text-secondary">Saved or Invested</span>
                        </div>
                        <span :class="getComparisonDisplay('savingsTotal').class" class="text-xs font-medium">
                            {{ getComparisonDisplay('savingsTotal').text }}
                        </span>
                    </div>
                    <p class="text-2xl font-bold text-accent-blue">{{ formatCurrency(metrics.savingsTotal) }}</p>
                </div>

                <div class="bg-secondary rounded-lg p-4 border border-default">
                    <div class="flex items-center justify-between mb-2">
                        <div class="flex items-center gap-2">
                            <i class="pi pi-calendar text-primary"></i>
                            <span class="text-sm font-medium text-secondary">This Month's Budget</span>
                        </div>
                        <span :class="getComparisonDisplay('totalMonthlyBudget', true).class"
                            class="text-xs font-medium">
                            {{ getComparisonDisplay('totalMonthlyBudget', true).text }}
                        </span>
                    </div>
                    <p class="text-2xl font-bold text-primary">{{ formatCurrency(metrics.totalMonthlyBudget) }}</p>
                    <div v-if="metrics.rolloverAmount > 0"
                        class="mt-1 flex items-center gap-1 text-xs text-accent-green font-medium">
                        <i class="pi pi-plus-circle"></i> {{ formatCurrency(metrics.rolloverAmount) }}
                        rolled over from last month's budget
                    </div>
                </div>

                <div class="bg-secondary rounded-lg p-4 border border-default">
                    <div class="flex items-center justify-between mb-2">
                        <div class="flex items-center gap-2">
                            <i class="pi pi-calendar-check text-primary"></i>
                            <span class="text-sm font-medium text-secondary">Budget Balance</span>
                        </div>
                        <span :class="metrics.budgetBalance >= 0 ? 'text-accent-green' : 'text-accent-red'"
                            class="text-xs font-medium">
                            {{ metrics.budgetBalance >= 0 ? 'Remaining' : 'Overspent' }}
                        </span>
                    </div>
                    <p class="text-2xl font-bold"
                        :class="metrics.budgetBalance >= 0 ? 'text-accent-green' : 'text-accent-red'">
                        {{ formatCurrency(metrics.budgetBalance) }}
                    </p>
                </div>



                <div class="bg-secondary rounded-lg p-4 border border-default">
                    <div class="flex items-center justify-between mb-2">
                        <div class="flex items-center gap-2">
                            <i class="pi pi-piggy-bank text-accent-green"></i>
                            <span class="text-sm font-medium text-secondary">Potential Savings</span>
                        </div>
                        <span :class="getComparisonDisplay('plannedSavings').class" class="text-xs font-medium">
                            {{ getComparisonDisplay('plannedSavings').text }}
                        </span>
                    </div>
                    <p class="text-2xl font-bold text-accent-green">{{ formatCurrency(metrics.plannedSavings) }}</p>
                </div>
            </div>
        </div>

        <div class="bg-primary rounded-lg shadow-sm border border-default p-4 sm:p-6">
            <div class="flex items-center gap-3 mb-4">
                <i class="pi pi-chart-pie text-xl text-accent-blue"></i>
                <h3 class="text-lg font-bold text-primary leading-snug">Budget Breakdown</h3>
            </div>

            <div v-if="!isLoading && !error" class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="space-y-3">
                    <h4 class="text-sm font-bold uppercase tracking-wider text-muted mb-1">Expense Categories</h4>

                    <div class="space-y-2">
                        <div class="flex justify-between items-center p-3 bg-secondary rounded border border-default">
                            <div class="flex items-center gap-2">
                                <i class="pi pi-refresh text-accent-blue"></i>
                                <span class="text-sm text-secondary">Recurring Expenses</span>
                            </div>
                            <span class="font-semibold text-primary">{{ formatCurrency(metrics.totalRecurringExpenses)
                            }}</span>
                        </div>

                        <div class="flex justify-between items-center p-3 bg-secondary rounded border border-default">
                            <div class="flex items-center gap-2">
                                <i class="pi pi-stop text-muted"></i>
                                <span class="text-sm text-secondary">One-time Expenses</span>
                            </div>
                            <span class="font-semibold text-primary">{{
                                formatCurrency(metrics.totalNonRecurringExpenses) }}</span>
                        </div>

                        <div class="flex justify-between items-center p-3 bg-secondary rounded border border-default">
                            <div class="flex items-center gap-2">
                                <i class="pi pi-star text-accent-blue"></i>
                                <span class="text-sm text-secondary">Savings Contributions</span>
                            </div>
                            <span class="font-semibold text-primary">{{ formatCurrency(metrics.savingsTotal)
                            }}</span>
                        </div>
                    </div>
                </div>

                <div class="space-y-3">
                    <h4 class="text-sm font-bold uppercase tracking-wider text-muted mb-1">Financial Health</h4>
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

        <!-- Savings, Investments & Goals Card -->
        <div class="bg-primary rounded-lg shadow-sm border border-default p-4 sm:p-6 mt-6">
            <!-- Header -->
            <div class="flex items-center justify-between mb-4">
                <div class="flex items-center gap-3">
                    <i class="pi pi-star text-xl text-yellow-500"></i>
                    <h3 class="text-lg font-bold text-primary leading-snug">Your Savings, Investments and Financial
                        Goals</h3>
                </div>
                <RouterLink to="/goals">
                    <Button label="Manage" icon="pi pi-arrow-right" iconPos="right" size="small" outlined />
                </RouterLink>
            </div>

            <!-- Tab switcher -->
            <div class="flex gap-1 mb-4 bg-secondary rounded-lg p-1 w-fit">
                <button v-for="tab in savingsTabs" :key="tab.key" @click="activeSavingsTab = tab.key"
                    class="px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200" :class="activeSavingsTab === tab.key
                        ? 'bg-accent-blue text-white shadow-sm'
                        : 'text-secondary hover:text-primary'">
                    <i :class="tab.icon" class="mr-1.5 text-xs"></i>{{ tab.label }}
                </button>
            </div>

            <!-- ─── TAB 1: Goals ─── -->
            <div v-if="activeSavingsTab === 'goals'">
                <div v-if="authStore.user?.goals?.length > 0"
                    class="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-secondary rounded border border-default p-4">
                    <div class="h-64">
                        <Doughnut :data="goalsChartData" :options="savingsChartOptions" />
                    </div>
                    <div class="max-h-64 overflow-y-auto pr-2">
                        <ul class="space-y-3">
                            <li v-for="(goal, index) in authStore.user.goals" :key="goal._id"
                                class="flex justify-between items-center text-sm">
                                <div class="flex items-center gap-2">
                                    <span class="w-3 h-3 rounded-full flex-shrink-0"
                                        :style="{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }"></span>
                                    <span class="text-primary font-semibold">{{ goal.name }}</span>
                                </div>
                                <div class="text-right flex flex-col items-end ml-4">
                                    <div>
                                        <span class="font-semibold text-primary">{{ formatCurrency(goal.currentAmount,
                                            true) }}</span>
                                        <span class="text-xs text-muted mx-1">/</span>
                                        <span class="text-xs text-secondary">{{ formatCurrency(goal.targetAmount, true)
                                            }}</span>
                                    </div>
                                    <!-- Progress bar -->
                                    <div class="w-24 h-1.5 bg-default rounded-full mt-1 overflow-hidden">
                                        <div class="h-full rounded-full transition-all duration-500"
                                            :class="goal.currentAmount >= goal.targetAmount ? 'bg-accent-green' : 'bg-accent-blue'"
                                            :style="{ width: Math.min((goal.currentAmount / goal.targetAmount) * 100, 100) + '%' }">
                                        </div>
                                    </div>
                                    <span class="text-xs font-bold mt-1"
                                        :class="goal.currentAmount >= goal.targetAmount ? 'text-accent-green' : 'text-accent-blue'">
                                        {{ Math.min(Math.round((goal.currentAmount / goal.targetAmount) * 100), 100) }}%
                                        target
                                    </span>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
                <div v-else class="text-center py-6 text-secondary bg-secondary rounded border border-default">
                    <i class="pi pi-star text-2xl mb-2 text-muted"></i>
                    <p>You haven't set any financial goals yet.</p>
                    <RouterLink to="/goals">
                        <Button label="Go to Goals" class="mt-3 btn-cta" />
                    </RouterLink>
                </div>
            </div>

            <!-- ─── TAB 2: By Category ─── -->
            <div v-else-if="activeSavingsTab === 'categories'">
                <div v-if="isSavingsLoading" class="flex items-center justify-center py-10">
                    <i class="pi pi-spinner pi-spin text-2xl text-accent-blue"></i>
                </div>
                <div v-else-if="categoryChartData.labels.length > 0"
                    class="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-secondary rounded border border-default p-4">
                    <div class="h-64">
                        <Doughnut :data="categoryChartData" :options="savingsChartOptions" />
                    </div>
                    <div class="max-h-64 overflow-y-auto pr-2">
                        <p class="text-xs text-muted mb-3">Savings transactions grouped by category (last 365 days)</p>
                        <ul class="space-y-3">
                            <li v-for="(label, index) in categoryChartData.labels" :key="label"
                                class="flex justify-between items-center text-sm">
                                <div class="flex items-center gap-2">
                                    <span class="w-3 h-3 rounded-full flex-shrink-0"
                                        :style="{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }"></span>
                                    <span class="text-primary font-semibold">{{ label }}</span>
                                </div>
                                <div class="text-right ml-4">
                                    <span class="font-semibold text-accent-blue">
                                        {{ formatCurrency(categoryChartData.datasets[0].data[index], true) }}
                                    </span>
                                    <span class="text-xs text-muted block">
                                        {{ Math.round((categoryChartData.datasets[0].data[index] / categoryTotal) * 100)
                                        }}% of savings
                                    </span>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
                <div v-else class="text-center py-6 text-secondary bg-secondary rounded border border-default">
                    <i class="pi pi-wallet text-2xl mb-2 text-muted"></i>
                    <p>No savings or investment transactions recorded yet.</p>
                    <p class="text-xs text-muted mt-1">Add a transaction with type "Savings &amp; Investments" to see
                        the breakdown.</p>
                </div>
            </div>

            <!-- ─── TAB 3: All Savings ─── -->
            <div v-else-if="activeSavingsTab === 'all'">
                <div v-if="isSavingsLoading" class="flex items-center justify-center py-10">
                    <i class="pi pi-spinner pi-spin text-2xl text-accent-blue"></i>
                </div>
                <div v-else class="bg-secondary rounded border border-default p-4">
                    <!-- Total banner -->
                    <div class="flex items-center justify-between mb-4 pb-3 border-b border-default">
                        <div>
                            <p class="text-xs text-muted uppercase tracking-wider">Total Saved &amp; Invested (365 days)
                            </p>
                            <p class="text-2xl font-bold text-accent-blue mt-1">{{ formatCurrency(categoryTotal, true)
                                }}</p>
                        </div>
                        <div class="text-right">
                            <p class="text-xs text-muted uppercase tracking-wider">This Month</p>
                            <p class="text-xl font-bold text-accent-blue mt-1">{{ formatCurrency(metrics.savingsTotal ||
                                0, true) }}</p>
                        </div>
                    </div>
                    <!-- Stacked breakdown rows -->
                    <div v-if="categoryChartData.labels.length > 0" class="space-y-3">
                        <div v-for="(label, index) in categoryChartData.labels" :key="label">
                            <div class="flex justify-between items-center text-sm mb-1">
                                <div class="flex items-center gap-2">
                                    <span class="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                        :style="{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }"></span>
                                    <span class="text-primary">{{ label }}</span>
                                </div>
                                <span class="font-semibold text-primary">
                                    {{ formatCurrency(categoryChartData.datasets[0].data[index], true) }}
                                </span>
                            </div>
                            <!-- Mini progress bar showing proportion of total savings -->
                            <div class="w-full h-1.5 bg-default rounded-full overflow-hidden">
                                <div class="h-full rounded-full transition-all duration-700" :style="{
                                    width: Math.round((categoryChartData.datasets[0].data[index] / categoryTotal) * 100) + '%',
                                    backgroundColor: CHART_COLORS[index % CHART_COLORS.length]
                                }">
                                </div>
                            </div>
                        </div>
                    </div>
                    <p v-else class="text-secondary text-sm text-center py-4">
                        No savings transactions in the last 365 days.
                    </p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { Doughnut } from 'vue-chartjs';
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement, CategoryScale, LinearScale } from 'chart.js';
import { FinanceService } from '@/services/financeService';
import DashboardInsights from '@/components/finances/DashboardInsights.vue';
import { useCurrencyFormatter } from '@/composables/useCurrencyFormatter'; // 👈 MODIFIED: Import composable
import { useAuthStore } from '@/stores/auth';

ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale, LinearScale);

const authStore = useAuthStore();

const { preferredCurrency: currentCurrency, preferredLocale: currentLocale, formatCurrency } = useCurrencyFormatter();

const metrics = ref({});
const comparison = ref({});
const isLoading = ref(true);
const error = ref('');
const isRollingOver = ref(false);

// ── Shared colour palette ──────────────────────────────────────────────────
const CHART_COLORS = [
    '#60A5FA', '#34D399', '#F59E0B', '#A78BFA', '#F87171',
    '#22D3EE', '#FB923C', '#4ADE80', '#E879F9', '#FACC15'
];

// ── Shared chart options ───────────────────────────────────────────────────
const savingsChartOptions = computed(() => ({
    responsive: true,
    maintainAspectRatio: false,
    cutout: '68%',
    plugins: {
        legend: { display: false },
        tooltip: {
            callbacks: {
                label(context) {
                    let label = context.label ? context.label + ': ' : '';
                    if (context.parsed !== null) label += formatCurrency(context.parsed, true);
                    return label;
                }
            }
        }
    }
}));

// ── Tab config ─────────────────────────────────────────────────────────────
const savingsTabs = [
    { key: 'goals', label: 'Goals', icon: 'pi pi-star' },
    { key: 'categories', label: 'By Category', icon: 'pi pi-tag' },
    { key: 'all', label: 'All Savings/Investments', icon: 'pi pi-wallet' },
];
const activeSavingsTab = ref('goals');

// ── Goals chart data (unchanged logic) ────────────────────────────────────
const goalsChartData = computed(() => {
    const goals = authStore.user?.goals || [];
    return {
        labels: goals.map(g => g.name),
        datasets: [{
            backgroundColor: goals.map((_, i) => CHART_COLORS[i % CHART_COLORS.length]),
            data: goals.map(g => g.currentAmount)
        }]
    };
});

// ── Category savings data ──────────────────────────────────────────────────
const isSavingsLoading = ref(false);
const savingsByCategory = ref({}); // { categoryName: totalAmount }

const categoryChartData = computed(() => {
    const entries = Object.entries(savingsByCategory.value)
        .filter(([, v]) => v > 0)
        .sort(([, a], [, b]) => b - a);
    return {
        labels: entries.map(([k]) => k),
        datasets: [{
            backgroundColor: entries.map((_, i) => CHART_COLORS[i % CHART_COLORS.length]),
            data: entries.map(([, v]) => v)
        }]
    };
});

const categoryTotal = computed(() =>
    Object.values(savingsByCategory.value).reduce((s, v) => s + v, 0)
);

const loadSavingsByCategory = async () => {
    isSavingsLoading.value = true;
    try {
        const res = await FinanceService.getAllTransactions({ days: 365, type: 'savings' });
        if (res.status === 'success' && Array.isArray(res.data)) {
            // The backend now resolves category IDs to names via $lookup and
            // returns tx.categoryName on every transaction.
            const grouped = {};
            res.data.forEach(tx => {
                const key = tx.categoryName || 'Uncategorized';
                grouped[key] = (grouped[key] || 0) + (tx.amount || 0);
            });
            savingsByCategory.value = grouped;
        }
    } catch (err) {
        console.warn('Could not load savings by category', err);
    } finally {
        isSavingsLoading.value = false;
    }
};

// Remove the old standalone goalsChartOptions — replaced by savingsChartOptions


const handleRollover = async (accept) => {
    isRollingOver.value = true;
    try {
        const date = new Date();
        await FinanceService.processRollover(date.getMonth(), date.getFullYear(), accept);
        await loadMetrics();
    } catch (err) {
        console.error('Failed to process rollover', err);
    } finally {
        isRollingOver.value = false;
    }
};

// ... (Rest of the component logic remains the same, except for the removed local formatCurrency function)

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


// ❌ REMOVED: The local formatCurrency function is removed and replaced by the composable

const getBudgetUtilization = () => {
    const effectiveBudget = (metrics.value.totalMonthlyBudget || 0) + (metrics.value.rolloverAmount || 0);
    if (!effectiveBudget || effectiveBudget === 0) return 0;
    return Math.round((metrics.value.expensesTotal / effectiveBudget) * 100);
};

const getBudgetUtilizationClass = () => {
    const utilization = getBudgetUtilization();
    // > 100% -> Red (Exceeded)
    if (utilization > 100) return 'bg-accent-red';
    // > 75% -> Yellow (Warning)
    if (utilization > 75) return 'bg-accent-yellow-warning';
    // <= 75% -> Green (Safe)
    return 'bg-accent-green';
};



const getBudgetHealthMessage = () => {
    const utilization = getBudgetUtilization();
    if (utilization > 90) return 'Budget exceeded - consider adjusting spending';
    if (utilization > 75) return 'Approaching budget limit';
    return 'Healthy budget utilization';
};

const getHealthStatus = () => {
    // Focus on whether the user is *over budget*
    const budgetBalance = metrics.value.budgetBalance || 0;
    if (budgetBalance >= 0) return 'Healthy';
    return 'Over Budget';
};

const getHealthColor = () => {
    const budgetBalance = metrics.value.budgetBalance || 0;
    if (budgetBalance >= 0) return 'rgb(22, 163, 74)'; // green-600
    return 'rgb(248 113 113)'; // red-400
};

const getHealthIcon = () => {
    const budgetBalance = metrics.value.budgetBalance || 0;
    if (budgetBalance >= 0) return 'pi pi-check-circle';
    return 'pi pi-exclamation-triangle';
};

onMounted(() => {
    loadMetrics();
    loadSavingsByCategory();
});
</script>