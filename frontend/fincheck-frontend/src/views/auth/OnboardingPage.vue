<template>
    <div class="min-h-screen flex items-center justify-center bg-gray-100">
        <div class="max-w-md mx-auto p-8 bg-white shadow rounded-lg text-center">
            <h1 class="text-3xl font-bold text-gray-800 mb-6">Welcome to FinCheck!</h1>

            <div class="space-y-4 mb-8">
                <div class="flex items-center space-x-3">
                    <div class="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <span class="text-white text-sm">✓</span>
                    </div>
                    <span class="text-gray-700">Track your income and expenses</span>
                </div>

                <div class="flex items-center space-x-3">
                    <div class="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <span class="text-white text-sm">✓</span>
                    </div>
                    <span class="text-gray-700">Monitor your financial goals</span>
                </div>

                <div class="flex items-center space-x-3">
                    <div class="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <span class="text-white text-sm">✓</span>
                    </div>
                    <span class="text-gray-700">Get weekly summaries</span>
                </div>
            </div>

            <Button label="Get Started" class="w-full bg-blue-600 hover:bg-blue-700" @click="goToTransactions" />
        </div>
    </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

const goToTransactions = () => {
    router.push('/transactions');
};
</script>