<template>
    <div class="bg-primary rounded-lg shadow-sm border border-default p-6 mt-6">

        <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-semibold text-primary">Financial Trends</h3>
            <TimelineFilter @period-changed="handlePeriodChange" />
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
import { ref, onMounted } from 'vue';
import { Line } from 'vue-chartjs';
import { Chart as ChartJS, Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement } from 'chart.js';
import { FinanceService } from '@/services/financeService';
import TimelineFilter from '../common/TimelineFilter.vue';

// Register the necessary components for Chart.js
ChartJS.register(Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement);

const isLoading = ref(true);
const error = ref('');
const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const selectedPeriod = ref({ label: '1M', value: 30 }); // Default to 1 month


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
        const response = await FinanceService.getMonthlyTrends({ days: selectedPeriod.value.value });

        if (response.status === 'success' && response.data) { // Process the data for the chart
            const labels = response.granularity === 'daily'
                ? response.data.map(d => `${monthNames[d.month - 1]} ${d.day}`)
                : response.data.map(d => `${monthNames[d.month - 1]} ${d.year}`);
            const incomeData = response.data.map(d => d.totalIncome);
            const expensesData = response.data.map(d => d.totalExpenses);
            const savingsData = response.data.map(d => d.netSavings);

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

const handlePeriodChange = (newPeriod) => {
    selectedPeriod.value = newPeriod;
    fetchTrends();
};

onMounted(() => {
    fetchTrends();
});
</script>