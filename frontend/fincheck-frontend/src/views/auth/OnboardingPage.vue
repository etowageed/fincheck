<template>
    <div class="min-h-screen flex items-center justify-center bg-tertiary">
        <div class="max-w-md mx-auto p-8 bg-primary shadow rounded-lg text-center border border-default">
            <h1 class="text-2xl md:text-3xl font-extrabold tracking-tight text-primary leading-tight mb-6">Welcome to Plete Finance!</h1>

            <div class="space-y-4 mb-8">
                <div class="flex items-center space-x-3">
                    <div class="w-8 h-8 bg-accent-green rounded-full flex items-center justify-center">
                        <span class="text-white text-sm">✓</span>
                    </div>
                    <span class="text-secondary">Track your income and expenses</span>
                </div>

                <div class="flex items-center space-x-3">
                    <div class="w-8 h-8 bg-accent-green rounded-full flex items-center justify-center">
                        <span class="text-white text-sm">✓</span>
                    </div>
                    <span class="text-secondary">Monitor your financial goals</span>
                </div>

                <div class="flex items-center space-x-3">
                    <div class="w-8 h-8 bg-accent-green rounded-full flex items-center justify-center">
                        <span class="text-white text-sm">✓</span>
                    </div>
                    <span class="text-secondary">Get weekly summaries</span>
                </div>
            </div>

            <Button label="Get Started" class="w-full" @click="goToTransactions" />
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