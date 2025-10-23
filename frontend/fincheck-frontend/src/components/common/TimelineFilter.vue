<template>
    <div class="flex items-center gap-2">
        <!-- MODIFIED: Use a click wrapper for redirecting locked actions -->
        <div @click="handlePeriodClick($event)">
            <SelectButton v-model="dashboardStore.selectedPeriod" :options="filteredPeriods" optionLabel="label"
                aria-labelledby="basic">
                <template #option="{ option }">
                    <div class="relative px-2">
                        {{ option.label }}
                        <!-- Show lock icon for disabled premium options -->
                        <i v-if="option.isPremium && !authStore.isPremium"
                            class="pi pi-lock text-xs text-accent-red ml-1"
                            v-tooltip.top="`Premium required for ${option.label}`"></i>
                    </div>
                </template>
            </SelectButton>
        </div>
    </div>
</template>

<script setup>
import { computed, watch } from 'vue';
import { useRouter } from 'vue-router'; // NEW: Import router
import SelectButton from 'primevue/selectbutton';
import TooltipDirective from 'primevue/tooltip';
import { useDashboardStore } from '@/stores/dashboard';
import { useAuthStore } from '@/stores/auth';

const vTooltip = TooltipDirective;
const dashboardStore = useDashboardStore();
const authStore = useAuthStore();
const router = useRouter(); // Use router

// Filter periods based on subscription status
const filteredPeriods = computed(() => {
    // If premium, show all options as enabled
    if (authStore.isPremium) {
        return dashboardStore.periods.map(p => ({ ...p, disabled: false }));
    }

    // For free users, only 'Current Month' is available. Mark others as premium.
    return dashboardStore.periods.map(p => ({
        ...p,
        disabled: p.isPremium,
    }));
});

// NEW: Strict Redirect Handler
const handlePeriodClick = (event) => {
    // This is a safety catch. We check if the target element (or its parent) has the disabled/locked class.
    // However, the cleanest logic is to rely on the underlying Pinia change:

    // Check if the currently selected period is a premium one for a free user
    const selected = dashboardStore.selectedPeriod;
    if (!authStore.isPremium && selected.isPremium) {
        // If the user managed to click it (or the watcher failed), redirect immediately
        router.push('/pricing');
        // Prevent default click event if necessary, though PrimeVue handles the visual disable
        event.stopPropagation();
        event.preventDefault();

        // Revert the selection back to the first non-premium option (Current Month)
        const freeOption = dashboardStore.periods.find(p => !p.isPremium);
        if (freeOption) {
            dashboardStore.setPeriod(freeOption);
        }
    } else if (!authStore.isPremium) {
        // Even if they click the 'Current Month' option, we check if they clicked on the lock/disabled area
        // Let's rely on the watcher below, which is tied directly to the data.
    }
};

// Watch for selection changes to prevent free users from selecting premium options
watch(() => dashboardStore.selectedPeriod, (newPeriod) => {
    // If the user is free AND the newly selected period is marked as premium
    if (!authStore.isPremium && newPeriod.isPremium) {
        // Perform the redirect action
        router.push('/pricing');

        // Revert selection to the free-tier default
        const freeOption = dashboardStore.periods.find(p => !p.isPremium);
        if (freeOption) {
            dashboardStore.setPeriod(freeOption);
        }
    }
}, { immediate: true });
</script>
