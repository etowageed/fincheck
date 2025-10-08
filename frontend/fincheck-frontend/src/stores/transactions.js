// src/stores/transactions.js
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { FinanceService } from "@/services/financeService";

export const useTransactionsStore = defineStore("transactions", () => {
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

  const totalExpenses = computed(() => {
    return transactions.value
      .filter((t) => t.type === "expense" || t.type === "excludedExpense")
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  });

  const netTotal = computed(() => totalIncome.value - totalExpenses.value);

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
      return { success: true };
    } catch (err) {
      return { success: false };
    }
  };

  const updateTransaction = async (transactionId, transactionData) => {
    try {
      await FinanceService.updateTransaction(transactionId, transactionData);
      await fetchTransactions();
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
    netTotal,
    fetchTransactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
  };
});
