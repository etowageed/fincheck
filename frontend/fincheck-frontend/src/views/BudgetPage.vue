<template>
    <div class="p-6">
        <h1 class="text-2xl font-bold text-gray-800 mb-6">Budget Overview</h1>

        <div v-if="isLoading" class="text-center py-8">
            <i class="pi pi-spinner pi-spin text-2xl text-blue-600"></i>
            <p class="mt-2 text-gray-600">Loading budget...</p>
        </div>

        <div v-else-if="budget" class="space-y-6">
            <!-- Budget Header -->
            <div class="bg-white rounded-lg shadow-sm border p-6">
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                        <p class="text-sm text-gray-500">Created At</p>
                        <p class="font-medium">{{ new Date(budget.createdAt).toLocaleDateString() }}</p>
                    </div>
                    <div>
                        <p class="text-sm text-gray-500">Year</p>
                        <p class="font-medium">{{ budget.year }}</p>
                    </div>
                    <div>
                        <p class="text-sm text-gray-500">Month</p>
                        <p class="font-medium">{{ getMonthName(budget.month) }}</p>
                    </div>
                    <div>
                        <p class="text-sm text-gray-500">Expected Income</p>
                        <p class="font-medium text-green-600">${{ budget.expectedMonthlyIncome }}</p>
                    </div>
                </div>
            </div>

            <!-- Monthly Budget -->
            <div class="bg-white rounded-lg shadow-sm border p-6">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-lg font-semibold text-gray-800">Budget Items</h2>
                    <AddBudgetItemsForm @budget-item-added="handleBudgetItemAdded" />
                </div>

                <div v-if="budget.monthlyBudget && budget.monthlyBudget.length > 0" class="space-y-3">
                    <div v-for="item in budget.monthlyBudget" :key="item._id"
                        class="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                        <div class="flex-1">
                            <div class="flex items-center gap-2 mb-1">
                                <p class="font-medium">{{ item.name }}</p>
                                <span class="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 capitalize">
                                    {{ item.category }}
                                </span>
                            </div>
                            <p v-if="item.description" class="text-sm text-gray-600 mb-1">{{ item.description }}</p>
                            <p class="text-xs text-gray-500">
                                {{ item.isRecurring ? 'Recurring' : 'One-time' }}
                            </p>
                        </div>
                        <div class="text-right">
                            <p class="font-semibold text-lg text-blue-600">${{ item.amount }}</p>
                        </div>
                    </div>

                    <!-- Budget Summary -->
                    <div class="border-t pt-4 mt-6">
                        <div class="flex justify-between items-center font-semibold text-lg">
                            <span>Total Monthly Budget:</span>
                            <span class="text-blue-600">${{ budget.totalMonthlyBudget }}</span>
                        </div>
                        <div v-if="budget.expectedMonthlyIncome"
                            class="flex justify-between items-center text-sm text-gray-600 mt-1">
                            <span>Planned Savings:</span>
                            <span :class="budget.plannedSavings >= 0 ? 'text-green-600' : 'text-red-600'">
                                ${{ budget.plannedSavings }}
                            </span>
                        </div>
                    </div>
                </div>
                <div v-else class="text-center py-4 text-gray-500">
                    No budget items yet. Add some budget categories to get started.
                </div>
            </div>

            <!-- Transactions -->
            <div class="bg-white rounded-lg shadow-sm border p-6">
                <h2 class="text-lg font-semibold text-gray-800 mb-4">Transactions</h2>
                <div v-if="budget.transactions && budget.transactions.length > 0" class="space-y-3">
                    <div v-for="transaction in budget.transactions" :key="transaction._id"
                        class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                            <p class="font-medium">{{ transaction.description }}</p>
                            <p class="text-sm text-gray-500 capitalize">{{ transaction.category }}</p>
                        </div>
                        <div class="text-right">
                            <p class="font-semibold"
                                :class="transaction.type === 'expense' ? 'text-red-600' : 'text-green-600'">
                                {{ transaction.type === 'expense' ? '-' : '+' }}${{ transaction.amount }}
                            </p>
                            <p class="text-sm text-gray-500">{{ new Date(transaction.date).toLocaleDateString() }}</p>
                        </div>
                    </div>
                </div>
                <div v-else class="text-center py-4 text-gray-500">
                    No transactions yet.
                </div>
            </div>
        </div>

        <div v-else class="text-center py-8">
            <p class="text-gray-600">No budget data available</p>
            <AddBudgetEntryForm class="mt-8" @budget-created="handleBudgetCreated" />
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '@/services/api';
// import AddBudgetEntryForm from '@/components/finances/AddBudgetEntryForm.vue';
// import AddBudgetItemsForm from '@/components/finances/AddBudgetItemsForm.vue';

const budget = ref(null);
const isLoading = ref(false);

const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

const getMonthName = (monthIndex) => {
    return monthNames[monthIndex] || 'Unknown';
};

const fetchBudget = async () => {
    isLoading.value = true;

    try {
        const res = await api.get('/finances');
        budget.value = res.data.data[0];
        console.log('Budget:', budget.value);
    } catch (err) {
        console.error('Error fetching budget:', err);
    } finally {
        isLoading.value = false;
    }
};

const handleBudgetCreated = (newBudget) => {
    fetchBudget();
};

const handleBudgetItemAdded = (updatedBudget) => {
    fetchBudget();
};

onMounted(() => {
    fetchBudget();
});
</script>

<style></style>