<template>
    <div class="bg-primary rounded-lg shadow-sm border border-default p-6 mt-6">

        <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-semibold text-primary">Financial Trends</h3>
        </div>

        <div v-if="isLoading" class="text-center py-8">
            <i class="pi pi-spinner pi-spin text-2xl text-accent-blue"></i>
            <p class="mt-2 text-secondary">Loading trend data...</p>
        </div>

        <div v-else-if="error" class="text-center py-8">
            <i class="pi pi-exclamation-triangle text-2xl text-accent-red mb-2"></i>
            <p class="text-accent-red">{{ error }}</p>
        </div>

        <div v-else-if="chartData.datasets[0]?.data.length > 0">
            <Line :data="chartData" :options="chartOptions" />
        </div>

        <div v-else class="text-center py-8 text-muted">
            <p>Not enough historical data to display a trend.</p>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { Line } from 'vue-chartjs';
import { Chart as ChartJS, Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement } from 'chart.js';
import { FinanceService } from '@/services/financeService';
import { useDashboardStore } from '@/stores/dashboard'; // NEW: Import store

// Register the necessary components for Chart.js
ChartJS.register(Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement);

const isLoading = ref(true);
const error = ref('');
const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// NEW: Use the dashboard store
const dashboardStore = useDashboardStore();

// Reactive references for chart data and options
const chartData = ref({
    labels: [],
    datasets: [],
});

const chartOptions = ref({
    responsive: true,
    maintainAspectRatio: false,
    scales: {
        y: {
            beginAtZero: true
        }
    }
});

const fetchTrends = async () => {
    isLoading.value = true;
    error.value = '';
    try {
        const params = {};
        // MODIFIED: Use the new period key to check for 'currentMonth'
        const selectedKey = dashboardStore.getSelectedPeriodKey;

        if (selectedKey === 'currentMonth') { // MODIFIED condition
            // For 'Current Month', explicitly request the current calendar month's data
            params.period = 'currentMonth';
        } else {
            // For all other periods, use the number of days from the store
            params.days = dashboardStore.getSelectedDays;
        }

        const response = await FinanceService.getMonthlyTrends(params);
        if (response.status === 'success' && response.data) {
            let labels, incomeData, expensesData, savingsData;

            // If viewing the current month, build a full monthly calendar view
            if (params.period === 'currentMonth') {
                const now = new Date();
                const currentMonth = now.getMonth();
                const currentYear = now.getFullYear();
                const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

                // Create a map for quick lookup of data by day
                const dataMap = new Map(response.data.map(d => [d.day, d]));

                labels = Array.from({ length: daysInMonth }, (_, i) => `${monthNames[currentMonth]} ${i + 1}`);
                incomeData = Array(daysInMonth).fill(0);
                expensesData = Array(daysInMonth).fill(0);
                savingsData = Array(daysInMonth).fill(0);

                for (let i = 0; i < daysInMonth; i++) {
                    const day = i + 1;
                    if (dataMap.has(day)) {
                        const dayData = dataMap.get(day);
                        incomeData[i] = dayData.totalIncome;
                        expensesData[i] = dayData.totalExpenses;
                        savingsData[i] = dayData.netSavings;
                    }
                }
            } else {
                // For other views (3M, 6M, 1Y), use the existing logic
                labels = response.granularity === 'daily'
                    ? response.data.map(d => `${monthNames[d.month - 1]} ${d.day}`)
                    : response.data.map(d => `${monthNames[d.month - 1]} ${d.year}`);
                incomeData = response.data.map(d => d.totalIncome);
                expensesData = response.data.map(d => d.totalExpenses);
                savingsData = response.data.map(d => d.netSavings);
            }

            chartData.value = {
                labels,
                datasets: [
                    {
                        label: 'Total Income',
                        backgroundColor: 'rgba(74, 222, 128, 0.5)',
                        borderColor: 'rgb(22, 163, 74)',
                        data: incomeData,
                        tension: 0.1,
                    },
                    {
                        label: 'Total Expenses',
                        backgroundColor: 'rgba(248, 113, 113, 0.5)',
                        borderColor: 'rgb(220, 38, 38)',
                        data: expensesData,
                        tension: 0.1,
                    },
                    {
                        label: 'Net Savings',
                        backgroundColor: 'rgba(96, 165, 250, 0.5)',
                        borderColor: 'rgb(37, 99, 235)',
                        data: savingsData,
                        tension: 0.1,
                    }
                ],
            };
        }
    } catch (err) {
        error.value = 'Failed to load trend data. Please try again later.';
        console.error(err);
    } finally {
        isLoading.value = false;
    }
};

// NEW: Watch the period key to trigger fetch
watch(() => dashboardStore.getSelectedPeriodKey, () => {
    fetchTrends();
});

onMounted(() => {
    fetchTrends();
});
</script>