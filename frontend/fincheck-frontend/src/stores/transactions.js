import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { FinanceService } from "@/services/financeService";

export const useTransactionsStore = defineStore("transactions", () => {
  // State
  const transactions = ref([]);
  const isLoading = ref(false);
  const error = ref(null);

  // Getters
  const recentTransactions = computed(() => transactions.value);

  const totalIncome = computed(() => {
    return transactions.value
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  });

  const totalExpenses = computed(() => {
    return transactions.value
      .filter((t) => t.type === "expense" || t.type === "excludedExpense")
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  });

  const netTotal = computed(() => totalIncome.value - totalExpenses.value);

  // Actions
  const fetchTransactions = async () => {
    isLoading.value = true;
    error.value = null;
    try {
      const { month, year } = FinanceService.getCurrentMonthYear();
      const data = await FinanceService.getTransactions(month, year);
      transactions.value = data;
    } catch (err) {
      error.value = "Failed to load transactions";
      console.error("Error fetching transactions:", err);
    } finally {
      isLoading.value = false;
    }
  };

  const addTransaction = async (transactionData) => {
    try {
      const newTransaction = await FinanceService.addTransaction(
        transactionData
      );
      // For a full state update, it's often best to refetch.
      await fetchTransactions();
      return { success: true, data: newTransaction };
    } catch (err) {
      console.error("Error adding transaction:", err);
      return { success: false, error: "Failed to add transaction" };
    }
  };

  const updateTransaction = async (transactionId, transactionData) => {
    try {
      const updatedTransaction = await FinanceService.updateTransaction(
        transactionId,
        transactionData
      );
      await fetchTransactions();
      return { success: true, data: updatedTransaction };
    } catch (err) {
      console.error("Error updating transaction:", err);
      return { success: false, error: "Failed to update transaction" };
    }
  };

  const deleteTransaction = async (transactionId) => {
    try {
      const { month, year } = FinanceService.getCurrentMonthYear();
      await FinanceService.deleteTransaction(month, year, transactionId);
      // Locally remove the transaction for a faster UI update
      transactions.value = transactions.value.filter(
        (t) => t._id !== transactionId
      );
      return { success: true };
    } catch (err) {
      console.error("Error deleting transaction:", err);
      return { success: false, error: "Failed to delete transaction" };
    }
  };

  return {
    // State
    transactions,
    isLoading,
    error,

    // Getters
    recentTransactions,
    totalIncome,
    totalExpenses,
    netTotal,

    // Actions
    fetchTransactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
  };
});
