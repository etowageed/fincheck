import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { FinanceService } from "@/services/financeService";

export const useBudgetStore = defineStore("budget", () => {
  // State
  const budget = ref(null);
  const isLoading = ref(false);

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
      return { success: false };
    } finally {
      isLoading.value = false;
    }
  };

  const createBudget = async (budgetData) => {
    isLoading.value = true;
    try {
      const newBudget = await FinanceService.createBudget(budgetData);
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
      budget.value = null;
      return { success: true };
    } catch (err) {
      return { success: false };
    } finally {
      isLoading.value = false;
    }
  };

  // --- NEW ACTION TO ADD A BUDGET ITEM ---
  const addBudgetItem = async (itemData) => {
    if (!budget.value)
      return { success: false, error: "No budget exists to add an item to." };
    isLoading.value = true;
    try {
      // Add the new item to the existing budget array
      const updatedMonthlyBudget = [...budget.value.monthlyBudget, itemData];

      // Send the entire updated budget document to the backend
      await FinanceService._updateBudgetData({
        monthlyBudget: updatedMonthlyBudget,
        expectedMonthlyIncome: budget.value.expectedMonthlyIncome,
      });

      await fetchBudget(); // Refetch to get the latest state with new IDs
      return { success: true };
    } catch (err) {
      return { success: false };
    } finally {
      isLoading.value = false;
    }
  };

  // --- NEW ACTION TO UPDATE A BUDGET ITEM ---
  const updateBudgetItem = async (itemId, itemData) => {
    if (!budget.value)
      return {
        success: false,
        error: "No budget exists to update an item in.",
      };
    isLoading.value = true;
    try {
      // Find and update the specific item in the array
      const updatedMonthlyBudget = budget.value.monthlyBudget.map((item) =>
        item._id === itemId ? { ...item, ...itemData } : item
      );

      // Send the entire updated budget document to the backend
      await FinanceService._updateBudgetData({
        monthlyBudget: updatedMonthlyBudget,
        expectedMonthlyIncome: budget.value.expectedMonthlyIncome,
      });

      await fetchBudget(); // Refetch to get the latest state
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
      await fetchBudget();
      return { success: true };
    } catch (err) {
      return { success: false };
    }
  };

  return {
    budget,
    isLoading,
    getBudget,
    fetchBudget,
    createBudget,
    updateExpectedIncome,
    addBudgetItem, // <-- Expose new action
    updateBudgetItem, // <-- Expose new action
    deleteBudget,
    deleteBudgetItem,
  };
});
