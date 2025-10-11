<template>
    <div>
        <h1 class="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>

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

// NEW State for the modal
const showTransactionsModal = ref(false);
const selectedCategoryId = ref(null);
const selectedCategoryName = ref('');

// NEW Handler Method
const handleCategoryDrillDown = (category) => {
    selectedCategoryId.value = category.categoryId;
    selectedCategoryName.value = category.categoryName;
    showTransactionsModal.value = true;
};
</script>