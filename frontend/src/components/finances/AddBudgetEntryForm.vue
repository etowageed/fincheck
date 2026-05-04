<template>
    <div class="card flex justify-center">
        <Button label="Create Budget" icon="pi pi-plus" class="btn-cta" @click="visible = true" />
        <Dialog :visible="visible" @update:visible="visible = $event" modal header="Create Budget" :style="{ width: '28rem' }"
            :breakpoints="{ '1199px': '75vw', '575px': '90vw' }">
            
            <div class="mb-6 space-y-2 mt-2">
                <p class="text-lg font-bold text-primary leading-tight">First things first, what do you earn in a month?</p>
                <p class="text-sm text-secondary">Your expected monthly income creates the foundation for your budget.</p>
            </div>

            <div class="flex flex-col gap-2 mb-8">
                <label for="income" class="font-semibold text-primary text-sm">Monthly Income</label>
                <InputNumber id="income" class="w-full" autocomplete="off"
                    :placeholder="inputPlaceholder" v-model="monthlyIncome" mode="currency"
                    :currency="currentCurrency" :locale="currentLocale" :min="0" />
            </div>

            <template #footer>
                <div class="flex justify-end gap-3">
                    <Button type="button" label="Cancel" severity="secondary" outlined @click="closeDialog" />
                    <Button type="button" label="Save" class="btn-cta" @click="handleCreateBudget"
                        :disabled="!monthlyIncome || monthlyIncome <= 0" />
                </div>
            </template>
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