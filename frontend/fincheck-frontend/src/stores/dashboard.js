// frontend/fincheck-frontend/src/stores/dashboard.js
import { defineStore } from "pinia";
import { ref, computed } from "vue";

// Define the default periods available for the filter
const periods = [
  // MODIFIED: Added isPremium flag
  { label: "Current Month", value: 30, key: "currentMonth", isPremium: false },
  { label: "3M", value: 90, key: "90days", isPremium: true },
  { label: "6M", value: 180, key: "180days", isPremium: true },
  { label: "1Y", value: 365, key: "365days", isPremium: true },
];

export const useDashboardStore = defineStore("dashboard", () => {
  // Default to the first option ('Current Month' / 1M)
  const selectedPeriod = ref(periods[0]);

  // Getter: gets the 'days' value from the selected period (used by CategoryBreakdown, TopTransactions)
  const getSelectedDays = computed(() => selectedPeriod.value.value);

  // NEW GETTER: Access the unique key/identifier for specific period logic (used by TrendsChart)
  const getSelectedPeriodKey = computed(() => selectedPeriod.value.key);

  // Getter: gets the full selected period object
  const getSelectedPeriod = computed(() => selectedPeriod.value);

  // Action: updates the selected period
  function setPeriod(periodObject) {
    selectedPeriod.value = periodObject;
  }

  return {
    periods,
    selectedPeriod,
    getSelectedDays,
    getSelectedPeriodKey,
    getSelectedPeriod,
    setPeriod,
  };
});
