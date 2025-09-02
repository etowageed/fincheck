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
                        <p class="font-medium">{{ budget.month }}</p>
                    </div>
                    <div>
                        <p class="text-sm text-gray-500">Expected Income</p>
                        <p class="font-medium text-green-600">${{ budget.expectedMonthlyIncome }}</p>
                    </div>
                </div>
            </div>

            <!-- Monthly Budget -->
            <div class="bg-white rounded-lg shadow-sm border p-6">
                <h2 class="text-lg font-semibold text-gray-800 mb-4">Monthly Budget</h2>
                <div class="space-y-3">
                    <div v-for="item in budget.monthlyBudget" :key="item._id"
                        class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                            <p class="font-medium capitalize">{{ item.category }}</p>
                            <p class="text-sm text-gray-500">
                                {{ item.isRecurring ? 'Recurring' : 'One-time' }}
                            </p>
                        </div>
                        <p class="font-semibold text-blue-600">${{ item.amount }}</p>
                    </div>
                </div>
            </div>

            <!-- Transactions -->
            <div class="bg-white rounded-lg shadow-sm border p-6">
                <h2 class="text-lg font-semibold text-gray-800 mb-4">Transactions</h2>
                <div class="space-y-3">
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
            </div>
        </div>

        <div v-else class="text-center py-8">
            <p class="text-gray-600">No budget data available</p>

            <!-- now this is where the modal for creating a budget will be triggered -->
            <AddBudgetEntryForm class="mt-8" />
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '@/services/api';

const budget = ref(null);
const isLoading = ref(false);

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

onMounted(() => {
    fetchBudget();
});
</script>

<style></style>