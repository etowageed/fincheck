<template>
    <div class="flex items-center gap-2">
        <SelectButton v-model="dashboardStore.selectedPeriod" :options="filteredPeriods" optionLabel="label"
            aria-labelledby="basic">
            <template #option="{ option }">
                <div class="relative px-2">
                    {{ option.label }}
                    <!-- Show lock icon for disabled premium options -->
                    <i v-if="option.isPremium && !authStore.isPremium" class="pi pi-lock text-xs text-accent-red ml-1"
                        v-tooltip.top="`Premium required for ${option.label}`"></i>
                </div>
            </template>
        </SelectButton>
    </div>
</template>

<script setup>
import { computed, watch } from 'vue';
import SelectButton from 'primevue/selectbutton';
import TooltipDirective from 'primevue/tooltip';
import { useDashboardStore } from '@/stores/dashboard';
import { useAuthStore } from '@/stores/auth'; // NEW: Import Auth Store

const vTooltip = TooltipDirective;
const dashboardStore = useDashboardStore();
const authStore = useAuthStore(); // Use Auth Store

// Filter periods based on subscription status
const filteredPeriods = computed(() => {
    // If premium, show all options as enabled
    if (authStore.isPremium) {
        return dashboardStore.periods.map(p => ({ ...p, disabled: false }));
    }

    // For free users, only show 'Current Month' as technically selectable.
    // Mark others as premium for UI indication.
    return dashboardStore.periods.map(p => ({
        ...p,
        disabled: p.isPremium,
    }));
});

// Watch for selection changes to prevent free users from clicking premium options
// NOTE: Since the free periods are defined in the store, we need to ensure the store only reflects the options.
watch(() => dashboardStore.selectedPeriod, (newPeriod) => {
    // If the user is free AND the newly selected period is marked as premium
    if (!authStore.isPremium && newPeriod.isPremium) {
        // Revert selection to the first available non-premium option (Current Month)
        const freeOption = dashboardStore.periods.find(p => !p.isPremium);
        if (freeOption) {
            dashboardStore.setPeriod(freeOption);
        }
    }
}, { immediate: true });
</script>
