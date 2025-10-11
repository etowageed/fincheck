<template>
    <div class="bg-primary rounded-lg shadow-sm border border-default p-6 mt-6">
        <div class="flex items-center gap-2 mb-4">
            <h3 class="text-lg font-semibold text-primary">Spending by Category (Last 90 Days)</h3>
            <i class="pi pi-info-circle text-accent-blue text-sm cursor-pointer"
                v-tooltip.top="'Click a segment on the chart to view the list of transactions for that category.'"></i>
        </div>

        <div v-if="isLoading" class="text-center py-8">
            <i class="pi pi-spinner pi-spin text-2xl text-accent-blue"></i>
            <p class="mt-2 text-secondary">Loading breakdown data...</p>
        </div>

        <div v-else-if="error" class="text-center py-8">
            <i class="pi pi-exclamation-triangle text-2xl text-accent-red mb-2"></i>
            <p class="text-accent-red">{{ error }}</p>
        </div>

        <div v-else-if="categoryData.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div class="h-64">
                <Doughnut :data="chartData" :options="chartOptions" />
            </div>

            <div class="max-h-64 overflow-y-auto pr-2">
                <ul class="space-y-3">
                    <li v-for="(item, index) in categoryData" :key="item.categoryId"
                        class="flex justify-between items-center text-sm">
                        <div class="flex items-center gap-2">
                            <span class="w-3 h-3 rounded-full"
                                :style="{ backgroundColor: chartData.datasets[0].backgroundColor[index] }"></span>
                            <span class="text-primary">{{ item.categoryName }}</span>
                        </div>
                        <div class="text-right">
                            <span class="font-semibold text-primary">${{ item.totalSpent.toFixed(2) }}</span>
                            <span class="text-xs text-muted ml-2">({{ getPercentage(item.totalSpent) }}%)</span>
                        </div>
                    </li>
                </ul>
            </div>
        </div>

        <div v-else class="text-center py-8 text-muted">
            <p>Not enough expense data in the last 90 days to display a breakdown.</p>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { Doughnut } from 'vue-chartjs';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { FinanceService } from '@/services/financeService';
// NEW IMPORT: Import the PrimeVue Tooltip directive
import TooltipDirective from 'primevue/tooltip';

ChartJS.register(ArcElement, Tooltip, Legend);

const emit = defineEmits(['category-drilldown']);

// NEW EXPOSURE: Expose the imported directive to be used in the template
const vTooltip = TooltipDirective;

const isLoading = ref(true);
const error = ref('');
const categoryData = ref([]);

const totalSpending = computed(() => {
    return categoryData.value.reduce((sum, item) => sum + item.totalSpent, 0);
});

const getPercentage = (amount) => {
    if (totalSpending.value === 0) return 0;
    return ((amount / totalSpending.value) * 100).toFixed(1);
};

const chartData = ref({
    labels: [],
    datasets: [{
        backgroundColor: [],
        data: []
    }]
});

const handleChartSegmentClick = (elements) => {
    if (elements.length > 0) {
        const firstElement = elements[0];
        const dataIndex = firstElement.index;
        const selectedCategory = categoryData.value[dataIndex];

        if (selectedCategory) {
            emit('category-drilldown', selectedCategory);
        }
    }
};


const chartOptions = ref({
    responsive: true,
    maintainAspectRatio: false,

    onClick: (event, elements, chart) => {
        handleChartSegmentClick(elements);
    },

    plugins: {
        legend: {
            display: false
        },
        tooltip: {
            callbacks: {
                label: function (context) {
                    let label = context.label || '';
                    if (label) {
                        label += ': ';
                    }
                    if (context.parsed !== null) {
                        const value = context.parsed;
                        label += `$${value.toFixed(2)}`;
                    }
                    return label;
                }
            }
        }
    }
});


onMounted(async () => {
    try {
        const response = await FinanceService.getCategoryBreakdown();
        if (response.status === 'success' && response.data) {
            categoryData.value = response.data;
            const labels = response.data.map(d => d.categoryName);
            const data = response.data.map(d => d.totalSpent);

            const colors = [
                '#4A90E2', '#50E3C2', '#F5A623', '#F8E71C', '#BD10E0',
                '#9013FE', '#417505', '#D0021B', '#B8E986', '#7ED321'
            ];

            chartData.value = {
                labels,
                datasets: [{
                    backgroundColor: data.map((_, i) => colors[i % colors.length]),
                    data
                }]
            };
        }
    } catch (err) {
        error.value = 'Failed to load category breakdown data. Please try again later.';
        console.error(err);
    } finally {
        isLoading.value = false;
    }
});
</script>