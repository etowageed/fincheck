<template>
    <div class="card flex justify-center">
        <Button label="Create Budget" icon="pi pi-plus" class="btn-cta" @click="visible = true" />
        <Dialog v-model:visible="visible" modal header="Create Budget" :style="{ width: '25rem' }"
            :breakpoints="{ '1199px': '75vw', '575px': '90vw' }">
            <span class="text-surface-500  block mb-8">First things first, what do you earn in a
                month?</span>
            <span class="text-surface-500  block mb-8 italic text-sm">Your expected monthly income
                creates the foundation for your budget.</span>
            <div class="flex items-center gap-4 mb-4">
                <label for="income" class="font-semibold w-24">Monthly Income</label>
                <InputNumber id="income" class="flex-auto" autocomplete="off" type="number"
                    :placeholder="inputPlaceholder" v-model="monthlyIncome" :mode="'currency'"
                    :currency="currentCurrency" :locale="currentLocale" :min="0" />
            </div>

            <div class="flex justify-end gap-2">
                <Button type="button" label="Cancel" severity="secondary" @click="closeDialog"></Button>
                <Button type="button" label="Save" @click="handleCreateBudget"
                    :disabled="!monthlyIncome || monthlyIncome <= 0"></Button>
            </div>
        </Dialog>
    </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useCurrencyFormatter } from '@/composables/useCurrencyFormatter'; // 👈 MODIFIED: Import composable

// 💰 MODIFIED: Destructure preferred values and the formatter
const { preferredCurrency: currentCurrency, preferredLocale: currentLocale, formatCurrency } = useCurrencyFormatter();
const visible = ref(false);
const monthlyIncome = ref('');

const emit = defineEmits(['budget-created']);


// 💰 MODIFIED: Placeholder uses the formatter to get the correct symbol
const inputPlaceholder = computed(() => {
    // Format a sample amount (e.g., 2000) with the correct symbol
    const formattedExample = formatCurrency(2000);
    // Use the formatted example as the placeholder text
    return `e.g. ${formattedExample}`;
});


const handleCreateBudget = () => {
    if (!monthlyIncome.value || monthlyIncome.value <= 0) {
        return;
    }

    emit('budget-created', { expectedMonthlyIncome: Number(monthlyIncome.value) });
    closeDialog();
};

const closeDialog = () => {
    visible.value = false;
    monthlyIncome.value = '';
};
</script>