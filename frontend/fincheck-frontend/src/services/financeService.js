// src/services/financeService.js
import api from "@/services/api";

export class FinanceService {
  /**
   * Budget Item Operations
   */
  static async getBudgetData() {
    // 1. Get the current month (0-indexed) and year
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();

    try {
      // 2. Make a specific request for the current month's document
      const response = await api.get(`/finances/${month}/${year}`);
      // The backend returns a single document, not an array
      return response.data.data || null;
    } catch (error) {
      // 3. If the backend returns a 404 error, it means no budget exists for this month.
      // We'll treat this as a normal case and return null.
      if (error.response?.status === 404) {
        return null;
      }
      // For any other errors, we still throw them to be handled globally.
      throw new Error(`Failed to fetch budget data: ${error.message}`);
    }
  }

  static async createBudget(budgetData) {
    try {
      const response = await api.post("/finances", budgetData);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to create budget: ${error.message}`);
    }
  }

  static async addBudgetItem(itemData) {
    try {
      const existingBudget = await this.getBudgetData();
      let monthlyBudget = [];

      if (existingBudget && existingBudget.monthlyBudget) {
        monthlyBudget = [...existingBudget.monthlyBudget];
      }

      const budgetItemData = this._prepareBudgetItemData(itemData);
      monthlyBudget.push(budgetItemData);

      const updateData = {
        monthlyBudget: monthlyBudget,
      };

      if (existingBudget && existingBudget.expectedMonthlyIncome) {
        updateData.expectedMonthlyIncome = existingBudget.expectedMonthlyIncome;
      }

      const response = await api.post("/finances", updateData);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to add budget item: ${error.message}`);
    }
  }

  static async updateBudgetItem(itemId, itemData) {
    try {
      const existingBudget = await this.getBudgetData();

      if (!existingBudget || !existingBudget.monthlyBudget) {
        throw new Error("No budget found");
      }

      let monthlyBudget = [...existingBudget.monthlyBudget];
      const itemIndex = monthlyBudget.findIndex((item) => item._id === itemId);

      if (itemIndex === -1) {
        throw new Error("Budget item not found");
      }

      const budgetItemData = {
        ...this._prepareBudgetItemData(itemData),
        _id: itemId,
      };

      monthlyBudget[itemIndex] = budgetItemData;

      const updateData = {
        monthlyBudget: monthlyBudget,
        expectedMonthlyIncome: existingBudget.expectedMonthlyIncome,
      };

      const response = await api.post("/finances", updateData);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to update budget item: ${error.message}`);
    }
  }

  static async deleteBudgetItem(month, year, budgetItemId) {
    try {
      const response = await api.delete(
        `/finances/${month}/${year}/budget/${budgetItemId}`
      );
      return response.data;
    } catch (error) {
      throw new Error(`Failed to delete budget item: ${error.message}`);
    }
  }

  /**
   * Transaction Operations
   */
  static async addTransaction(itemData) {
    try {
      const { month, year } = this._getCurrentMonthYear();
      const transactionData = this._prepareTransactionData(itemData);

      const response = await api.post(
        `/finances/${month}/${year}/transactions`,
        transactionData
      );
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        throw new Error(
          "You must create a budget for the current month before adding a transaction."
        );
      }
      throw new Error(`Failed to add transaction: ${error.message}`);
    }
  }

  static async updateTransaction(itemId, itemData) {
    try {
      const { month, year } = this._getCurrentMonthYear();
      const transactionData = this._prepareTransactionData(itemData);

      const response = await api.patch(
        `/finances/${month}/${year}/transactions/${itemId}`,
        transactionData
      );
      return response.data;
    } catch (error) {
      throw new Error(`Failed to update transaction: ${error.message}`);
    }
  }

  static async deleteTransaction(month, year, transactionId) {
    try {
      const response = await api.delete(
        `/finances/${month}/${year}/transactions/${transactionId}`
      );
      return response.data;
    } catch (error) {
      throw new Error(`Failed to delete transaction: ${error.message}`);
    }
  }

  static async getTransactions(month, year) {
    try {
      const response = await api.get(`/finances/${month}/${year}`);
      return response.data.data?.transactions || [];
    } catch (error) {
      if (error.response?.status === 404) {
        return []; // No finance document for this month yet
      }
      throw new Error(`Failed to fetch transactions: ${error.message}`);
    }
  }

  /**
   * Budget Operations
   */
  static async deleteBudget(month, year) {
    try {
      const response = await api.delete(`/finances/${month}/${year}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to delete budget: ${error.message}`);
    }
  }

  static async _updateBudgetData(updateData) {
    try {
      const response = await api.post("/finances", updateData);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to update budget: ${error.message}`);
    }
  }

  /**
   * Get historical monthly trends for charts
   */
  static async getMonthlyTrends(params = { days: 365 }) {
    try {
      const response = await api.get("/finances/trends", { params });
      return response.data; // The backend returns { status, results, data }
    } catch (error) {
      throw new Error(`Failed to fetch monthly trends: ${error.message}`);
    }
  }

  /**
   * Validation Methods
   */
  static validateBudgetItem(itemData) {
    const errors = {};

    if (!itemData.name?.trim()) {
      errors.name = "Name is required";
    }

    if (!itemData.category?.trim()) {
      errors.category = "Category is required";
    }

    if (!itemData.amount || itemData.amount <= 0) {
      errors.amount = "Amount must be greater than 0";
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }

  static validateTransaction(itemData) {
    const errors = {};

    if (!itemData.name?.trim()) {
      errors.name = "Description is required";
    }

    if (!itemData.category?.trim()) {
      errors.category = "Category is required";
    }

    if (!itemData.amount || itemData.amount === 0) {
      errors.amount = "Amount cannot be zero";
    }

    if (!itemData.type) {
      errors.type = "Transaction type is required";
    }

    if (
      !itemData.date ||
      !(itemData.date instanceof Date) ||
      isNaN(itemData.date.getTime())
    ) {
      errors.date = "Please select a valid date";
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }

  /**
   * Utility Methods
   */
  static formatErrorMessage(error, operation, itemType) {
    if (error.response?.status === 400) {
      return "Invalid data provided";
    } else if (error.response?.status === 404) {
      if (itemType === "budget") {
        return "No budget found. Please create a budget first.";
      } else {
        return "Transaction not found or no finance document exists for this month.";
      }
    } else {
      return `Failed to ${operation} ${itemType}. Please make sure you've created a budget.`;
    }
  }

  static parseDate(dateValue) {
    if (!dateValue) return new Date();

    if (dateValue instanceof Date) {
      return isNaN(dateValue.getTime()) ? new Date() : dateValue;
    }

    const parsed = new Date(dateValue);
    return isNaN(parsed.getTime()) ? new Date() : parsed;
  }

  /**
   * Private Helper Methods
   */
  static _prepareBudgetItemData(itemData) {
    const budgetItemData = {
      name: itemData.name.trim(),
      category: itemData.category.trim(),
      amount: itemData.amount,
      isRecurring: itemData.isRecurring,
    };

    if (itemData.description?.trim()) {
      budgetItemData.description = itemData.description.trim();
    }

    return budgetItemData;
  }

  static _prepareTransactionData(itemData) {
    const transactionDate = this.parseDate(itemData.date);

    const transactionData = {
      description: itemData.name.trim(),
      amount: itemData.amount,
      category: itemData.category.trim(),
      type: itemData.type,
      date: transactionDate.toISOString(),
    };

    if (itemData.description?.trim()) {
      transactionData.notes = itemData.description.trim();
    }

    return transactionData;
  }

  static _getCurrentMonthYear() {
    const currentDate = new Date();
    return {
      month: currentDate.getMonth(),
      year: currentDate.getFullYear(),
    };
  }

  static getCurrentMonthYear() {
    const currentDate = new Date();
    return {
      month: currentDate.getMonth(),
      year: currentDate.getFullYear(),
    };
  }

  /**
   * Get category spending breakdown for charts
   */
  static async getCategoryBreakdown() {
    try {
      const response = await api.get("/finances/reports/category-breakdown");
      return response.data; // The backend returns { status, results, data }
    } catch (error) {
      throw new Error(`Failed to fetch category breakdown: ${error.message}`);
    }
  }

  /**
   * Get the user's largest transactions
   */
  static async getTopTransactions(
    params = { days: 365, type: "expense", limit: 3 }
  ) {
    try {
      const response = await api.get(`/finances/reports/top-transactions`, {
        params,
      });
      return response.data; // Backend returns { status, results, data }
    } catch (error) {
      throw new Error(`Failed to fetch top transactions: ${error.message}`);
    }
  }

  static async getAllTransactions(params = { days: 30 }) {
    try {
      const response = await api.get("/finances/reports/all-transactions", {
        params, // Pass all parameters (including category) to the backend
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch transactions: ${error.message}`);
    }
  }

  static async getDashboardMetrics(params) {
    // params for date ranges later
    try {
      const response = await api.get("/finances/dashboard", { params });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch dashboard metrics: ${error.message}`);
    }
  }

  static async getPeriodComparison(periodType = "month") {
    try {
      const response = await api.get("/finances/compare", {
        params: { periodType },
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch period comparison: ${error.message}`);
    }
  }
}
