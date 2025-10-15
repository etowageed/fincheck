<template>
    <div>
        <SelectButton v-model="dashboardStore.selectedPeriod" :options="dashboardStore.periods" optionLabel="label"
            aria-labelledby="basic" />
    </div>
</template>

<script setup>
import SelectButton from 'primevue/selectbutton';
import { useDashboardStore } from '@/stores/dashboard';

const dashboardStore = useDashboardStore();
</script>