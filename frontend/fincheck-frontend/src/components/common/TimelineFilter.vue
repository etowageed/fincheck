<template>
    <div>
        <SelectButton v-model="selectedPeriod" :options="periods" optionLabel="label" aria-labelledby="basic" />
    </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import SelectButton from 'primevue/selectbutton';

const emit = defineEmits(['period-changed']);

const periods = ref([
    { label: '1M', value: 30 },
    { label: '3M', value: 90 },
    { label: '6M', value: 180 },
    { label: '1Y', value: 365 },
]);

const selectedPeriod = ref(periods.value[0]); // Default to 1M

watch(selectedPeriod, (newValue) => {
    if (newValue) {
        emit('period-changed', newValue);
    }
});
</script>