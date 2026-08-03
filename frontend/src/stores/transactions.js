// src/stores/transactions.js
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { FinanceService } from "@/services/financeService";
import { useAuthStore } from "@/stores/auth";

export const useTransactionsStore = defineStore("transactions", () => {
  const authStore = useAuthStore();
  const transactions = ref([]);
  const isLoading = ref(false);

  const recentTransactions = computed(() => {
    // Create a reversed copy of the array so the newest items appear first.
    // Using [...transactions.value] creates a copy to avoid mutating the original state.
    return [...transactions.value].reverse();
  });

  const totalIncome = computed(() => {
    return transactions.value
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  });

  // Expenses only — savings are NOT included here
  const totalExpenses = computed(() => {
    return transactions.value
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + Math.abs(Number(t.amount) || 0), 0);
  });

  // Savings / investment contributions only
  const totalSavings = computed(() => {
    return transactions.value
      .filter((t) => t.type === "savings")
      .reduce((sum, t) => sum + Math.abs(Number(t.amount) || 0), 0);
  });

  // Total cash leaving the account (expenses + savings)
  const totalOutflow = computed(
    () => totalExpenses.value + totalSavings.value
  );

  // How much income remains after expenses, before saving anything
  const surplusBeforeSavings = computed(
    () => totalIncome.value - totalExpenses.value
  );

  // Cash actually available after all outflows
  const availableCash = computed(
    () => totalIncome.value - totalExpenses.value - totalSavings.value
  );

  // Backwards-compatible alias — previously was income - (expenses + savings),
  // which is numerically identical to availableCash now that totalExpenses is
  // correctly expenses-only. Prefer availableCash for new code.
  const netTotal = computed(() => availableCash.value);

  // MODIFIED: This action now accepts a 'days' parameter
  const fetchTransactions = async (params = { days: 30 }) => {
    isLoading.value = true;
    try {
      const response = await FinanceService.getAllTransactions(params);
      if (response.status === "success") {
        transactions.value = response.data || [];
      }
    } catch (err) {
      // Error handled by global interceptor
      transactions.value = [];
    } finally {
      isLoading.value = false;
    }
  };

  const addTransaction = async (transactionData) => {
    try {
      await FinanceService.addTransaction(transactionData);
      await fetchTransactions();
      await authStore.checkAuth();
      return { success: true };
    } catch (err) {
      return { success: false };
    }
  };

  const updateTransaction = async (transactionId, transactionData) => {
    try {
      await FinanceService.updateTransaction(transactionId, transactionData);
      await fetchTransactions();
      await authStore.checkAuth();
      return { success: true };
    } catch (err) {
      return { success: false };
    }
  };

  const deleteTransaction = async (transactionId) => {
    try {
      const { month, year } = FinanceService.getCurrentMonthYear();
      await FinanceService.deleteTransaction(month, year, transactionId);
      transactions.value = transactions.value.filter(
        (t) => t._id !== transactionId
      );
      await authStore.checkAuth();
      return { success: true };
    } catch (err) {
      return { success: false };
    }
  };

  return {
    transactions,
    isLoading,
    recentTransactions,
    totalIncome,
    totalExpenses,
    totalSavings,
    totalOutflow,
    surplusBeforeSavings,
    availableCash,
    netTotal, // backwards-compatible alias for availableCash
    fetchTransactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
  };
});
