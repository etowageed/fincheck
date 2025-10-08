<template>
    <div>
        <h1 class="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>

        <UserDashboard />

        <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <CategoryBreakdown />
            <TopTransactions />
        </div>

        <TrendsChart />
    </div>
</template>

<script setup>
import UserDashboard from '@/components/finances/UserDashboard.vue';
import TrendsChart from '@/components/finances/TrendsChart.vue';
import CategoryBreakdown from '@/components/finances/CategoryBreakdown.vue';
import TopTransactions from '@/components/finances/TopTransactions.vue'; // Import the new component
</script>