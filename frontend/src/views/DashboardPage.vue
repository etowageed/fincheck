<template>
    <div>
        <div class="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center mb-6">
            <div>
                <h1 class="text-2xl md:text-3xl font-extrabold tracking-tight text-primary leading-tight">Dashboard</h1>
                <p class="text-xs text-secondary mt-0.5">Track spending, insights, and quick AI entry.</p>
            </div>

            <div class="flex items-center gap-2 flex-wrap">
                <QuickLogButton @click="showQuickLog = true" />
                <ScanReceiptButton @click="showReceiptScan = true" />
                <TimelineFilter />
            </div>
        </div>

        <UserDashboard />

        <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <CategoryBreakdown @category-drilldown="handleCategoryDrillDown" />
            <TopTransactions />
        </div>

        <TrendsChart />

        <CategoryTransactionsModal v-model:visible="showTransactionsModal" :category-id="selectedCategoryId"
            :category-name="selectedCategoryName" />

        <QuickLogModal v-model="showQuickLog" />
        <ReceiptScanModal v-model="showReceiptScan" />
        <AiTransactionConfirmModal />
    </div>
</template>

<script setup>
import { ref } from 'vue';
import UserDashboard from '@/components/finances/UserDashboard.vue';
import TrendsChart from '@/components/finances/TrendsChart.vue';
import CategoryBreakdown from '@/components/finances/CategoryBreakdown.vue';
import TopTransactions from '@/components/finances/TopTransactions.vue';
import CategoryTransactionsModal from '@/components/finances/CategoryTransactionsModal.vue';
import TimelineFilter from '@/components/common/TimelineFilter.vue';
import QuickLogButton from '@/components/ai/QuickLogButton.vue';
import ScanReceiptButton from '@/components/ai/ScanReceiptButton.vue';
import QuickLogModal from '@/components/ai/QuickLogModal.vue';
import ReceiptScanModal from '@/components/ai/ReceiptScanModal.vue';
import AiTransactionConfirmModal from '@/components/ai/AiTransactionConfirmModal.vue';

// State for modals
const showTransactionsModal = ref(false);
const selectedCategoryId = ref(null);
const selectedCategoryName = ref('');
const showQuickLog = ref(false);
const showReceiptScan = ref(false);

// Handler Method
const handleCategoryDrillDown = (category) => {
    selectedCategoryId.value = category.categoryId;
    selectedCategoryName.value = category.categoryName;
    showTransactionsModal.value = true;
};
</script>