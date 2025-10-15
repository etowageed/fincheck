<template>
    <div>
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-2xl font-bold text-gray-800">Dashboard</h1>
            <TimelineFilter />
        </div>

        <UserDashboard />

        <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <CategoryBreakdown @category-drilldown="handleCategoryDrillDown" />
            <TopTransactions />
        </div>

        <TrendsChart />

        <CategoryTransactionsModal v-model:visible="showTransactionsModal" :category-id="selectedCategoryId"
            :category-name="selectedCategoryName" />
    </div>
</template>

<script setup>
import { ref } from 'vue';
import UserDashboard from '@/components/finances/UserDashboard.vue';
import TrendsChart from '@/components/finances/TrendsChart.vue';
import CategoryBreakdown from '@/components/finances/CategoryBreakdown.vue';
import TopTransactions from '@/components/finances/TopTransactions.vue';
import CategoryTransactionsModal from '@/components/finances/CategoryTransactionsModal.vue';
import TimelineFilter from '@/components/common/TimelineFilter.vue'; // NEW: Import filter

// State for the modal
const showTransactionsModal = ref(false);
const selectedCategoryId = ref(null);
const selectedCategoryName = ref('');

// Handler Method
const handleCategoryDrillDown = (category) => {
    selectedCategoryId.value = category.categoryId;
    selectedCategoryName.value = category.categoryName;
    showTransactionsModal.value = true;
};
</script>