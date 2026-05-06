<template>
    <div class="min-h-screen flex items-center justify-center bg-tertiary p-4">
        <div class="w-full max-w-4xl p-8 bg-primary shadow-lg rounded-xl text-center border border-default animate-fade-in-up">
            <h1 class="text-3xl md:text-4xl font-extrabold tracking-tight text-primary leading-tight mb-4">
                Welcome to Plete Finance, {{ authStore.user?.name || 'User' }}!
            </h1>
            
            <p class="text-secondary mb-6 text-lg">You're almost there. Let's set up your financial foundation.</p>

            <!-- Email Notice -->
            <div class="mb-8 p-4 bg-accent-blue/10 border border-accent-blue/30 rounded-lg text-sm text-left mx-auto max-w-lg">
                <div class="flex items-start gap-3">
                    <span class="text-accent-blue text-lg">ℹ️</span>
                    <div>
                        <p class="font-bold text-primary mb-1">Check your inbox!</p>
                        <p class="text-secondary">We just sent you a welcome email. If you don't see it, check your <strong>Promotions</strong> folder and drag it to your Primary tab so you don't miss important updates.</p>
                    </div>
                </div>
            </div>

            <!-- Endowed Progress Effect -->
            <div class="mb-10 w-full max-w-lg mx-auto">
                <div class="flex justify-between text-sm text-secondary mb-2">
                    <span>Account Setup Progress</span>
                    <span class="font-bold text-accent-green">25%</span>
                </div>
                <ProgressBar :value="25" :showValue="false" class="h-3 rounded-full" />
            </div>

            <!-- Interactive Feature Tiles -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <!-- Tile 1 -->
                <div class="group p-6 bg-primary rounded-xl border border-default shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-pop-lime cursor-default">
                    <div class="w-14 h-14 mx-auto bg-secondary rounded-full flex items-center justify-center mb-4 transition-transform duration-300 group-hover:rotate-12 shadow-sm border border-default">
                        <span class="text-accent-green text-xl font-bold">✓</span>
                    </div>
                    <h3 class="font-bold text-primary mb-2">Initialize Budget</h3>
                    <p class="text-sm text-secondary">Set your expected monthly income to define a baseline.</p>
                </div>
                <!-- Tile 2 -->
                <div class="group p-6 bg-primary rounded-xl border border-default shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-pop-lime cursor-default">
                    <div class="w-14 h-14 mx-auto bg-secondary rounded-full flex items-center justify-center mb-4 transition-transform duration-300 group-hover:rotate-12 shadow-sm border border-default">
                        <span class="text-accent-blue text-xl font-bold">✓</span>
                    </div>
                    <h3 class="font-bold text-primary mb-2">Track Expenses</h3>
                    <p class="text-sm text-secondary">Log your daily transactions securely.</p>
                </div>
                <!-- Tile 3 -->
                <div class="group p-6 bg-primary rounded-xl border border-default shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-pop-lime cursor-default">
                    <div class="w-14 h-14 mx-auto bg-secondary rounded-full flex items-center justify-center mb-4 transition-transform duration-300 group-hover:rotate-12 shadow-sm border border-default">
                        <span class="text-accent-yellow text-xl font-bold">✓</span>
                    </div>
                    <h3 class="font-bold text-primary mb-2">Achieve Goals</h3>
                    <p class="text-sm text-secondary">Reach your savings targets on time.</p>
                </div>
            </div>

            <div class="max-w-md mx-auto">
                <Button label="Get Started" class="w-full btn-cta py-3 text-lg font-bold" @click="goToBudget" />
            </div>
        </div>
    </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import ProgressBar from 'primevue/progressbar';

const router = useRouter();
const authStore = useAuthStore();

/**
 * Redirects the user to the budget page to initialize their financial baseline.
 * (Plete Finance Engineering Team, 2026, p. 4) indicates navigating to the budget 
 * route first is necessary to set expectedMonthlyIncome before logging transactions 
 * in order to avoid backend 404 constraints from financesController.js.
 */
const goToBudget = () => {
    router.push('/budget');
};
</script>