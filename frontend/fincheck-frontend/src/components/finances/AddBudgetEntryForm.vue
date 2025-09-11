<template>
    <div class="card flex justify-center">
        <Button label="Create Budget" @click="visible = true" />
        <Dialog v-model:visible="visible" modal header="Create Budget" :style="{ width: '25rem' }">
            <span class="text-surface-500 dark:text-surface-400 block mb-8">First things first, what do you earn in a
                month?</span>
            <span class="text-surface-500 dark:text-surface-400 block mb-8 italic text-sm">Your expected monthly income
                creates the foundation for your budget.</span>
            <div class="flex items-center gap-4 mb-4">
                <label for="income" class="font-semibold w-24">Monthly Income</label>
                <InputText id="income" class="flex-auto" autocomplete="off" type="number" placeholder="e.g 2000"
                    v-model="monthlyIncome" :disabled="isLoading" />
            </div>

            <div class="flex justify-end gap-2">
                <Button type="button" label="Cancel" severity="secondary" @click="closeDialog"
                    :disabled="isLoading"></Button>
                <Button type="button" label="Save" @click="createBudget" :loading="isLoading"
                    :disabled="!monthlyIncome || monthlyIncome <= 0"></Button>
            </div>
        </Dialog>
    </div>
</template>

<script setup>
import { ref } from "vue";
import api from '@/services/api';

const visible = ref(false);
const monthlyIncome = ref('');
const isLoading = ref(false);

const emit = defineEmits(['budgetCreated']);

const createBudget = async () => {
    if (!monthlyIncome.value || monthlyIncome.value <= 0) {
        return;
    }

    isLoading.value = true;

    try {
        const budgetData = {
            expectedMonthlyIncome: Number(monthlyIncome.value),
        };

        const response = await api.post('/finances', budgetData);

        console.log('Budget created successfully:', response.data);

        // Emit event to parent component to refresh data
        emit('budgetCreated', response.data);

        // Close dialog and reset form
        closeDialog();

    } catch (error) {
        console.error('Error creating budget:', error);
        // You might want to show a toast notification here
    } finally {
        isLoading.value = false;
    }
};

const closeDialog = () => {
    visible.value = false;
    monthlyIncome.value = '';
};
</script>
