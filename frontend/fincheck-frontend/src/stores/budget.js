import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { FinanceService } from "@/services/financeService";

export const useBudgetStore = defineStore("budget", () => {
  // State
  const budget = ref(null);
  const isLoading = ref(false);
  // The local 'error' ref is no longer needed.

  // Getters
  const getBudget = computed(() => budget.value);

  // Actions
  const fetchBudget = async () => {
    isLoading.value = true;
    try {
      const data = await FinanceService.getBudgetData();
      budget.value = data;
      return { success: true };
    } catch (err) {
      // Error is now handled by the global interceptor
      return { success: false };
    } finally {
      isLoading.value = false;
    }
  };

  const createBudget = async (budgetData) => {
    isLoading.value = true;
    try {
      const newBudget = await FinanceService.createBudget(budgetData);
      // After creating, refetch the budget to ensure state is in sync
      await fetchBudget();
      return { success: true, data: newBudget };
    } catch (err) {
      return { success: false };
    } finally {
      isLoading.value = false;
    }
  };

  const updateExpectedIncome = async (incomeData) => {
    isLoading.value = true;
    try {
      await FinanceService._updateBudgetData(incomeData);
      // Refetch the entire budget to get updated virtual properties
      await fetchBudget();
      return { success: true };
    } catch (err) {
      return { success: false };
    } finally {
      isLoading.value = false;
    }
  };

  const deleteBudget = async () => {
    if (!budget.value) return { success: false };
    isLoading.value = true;
    try {
      await FinanceService.deleteBudget(budget.value.month, budget.value.year);
      budget.value = null; // Clear state immediately after deletion
      return { success: true };
    } catch (err) {
      return { success: false };
    } finally {
      isLoading.value = false;
    }
  };

  const deleteBudgetItem = async (budgetItemId) => {
    if (!budget.value) return { success: false };
    try {
      await FinanceService.deleteBudgetItem(
        budget.value.month,
        budget.value.year,
        budgetItemId
      );
      // Refetch to update the budget and its totals in the state
      await fetchBudget();
      return { success: true };
    } catch (err) {
      return { success: false };
    }
  };

  return {
    // State
    budget,
    isLoading,
    // Getters
    getBudget,
    // Actions
    fetchBudget,
    createBudget,
    updateExpectedIncome,
    deleteBudget,
    deleteBudgetItem,
  };
});
