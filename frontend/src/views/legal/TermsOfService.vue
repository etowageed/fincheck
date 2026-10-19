<template>
    <div class="min-h-screen bg-tertiary py-12 px-4 sm:px-6 lg:px-8">
        <div class="max-w-3xl mx-auto bg-primary shadow rounded-lg p-8 border border-default">
            <h1 class="text-3xl font-bold text-primary mb-2">Terms of Service — Plete Finance</h1>
            <div class="prose max-w-none text-secondary space-y-4">
                <p class="text-sm text-muted">Last updated: October 2026</p>

                <h2 class="text-xl font-semibold text-primary mt-6">1. Acceptance of Terms</h2>
                <p>By accessing and using Plete Finance, you accept and agree to be bound by the terms and provisions of this agreement.</p>

                <h2 class="text-xl font-semibold text-primary mt-6">2. Description of Service &amp; AI Features</h2>
                <p>Plete Finance provides personal finance tracking, multi-currency budgeting, savings goal management, and AI-powered financial intelligence tools (including Magic Quick-Log natural language entry, Receipt &amp; Handwritten Note Vision OCR, Predictive Budget Forecasts, What-If Savings Scenario Simulations, Ask Plete AI, and Monthly Executive Reports). All AI-extracted transactions require your confirmation before saving to your ledger.</p>

                <h2 class="text-xl font-semibold text-primary mt-6">3. Starter (Free) &amp; Premium Plans</h2>
                <p>Plete Finance offers a free Starter tier with monthly renewing AI allowances, as well as a paid Premium subscription ($3.99/month) unlocking unlimited AI features, 10+ year historical trend analytics, and PDF/Excel data exports. You may manage or cancel your subscription at any time from your Settings page.</p>

                <h2 class="text-xl font-semibold text-primary mt-6">4. User Account &amp; Security</h2>
                <p>You are responsible for maintaining the confidentiality of your account and password. Plete Finance cannot and will not be liable for any loss or damage arising from your failure to comply with this security obligation.</p>

                <h2 class="text-xl font-semibold text-primary mt-6">5. Financial Disclaimer</h2>
                <p>Plete Finance and Plete AI are provided for informational and educational budgeting purposes only and do not constitute certified financial, tax, or investment advice. You should consult with a qualified financial professional before making major financial decisions.</p>

                <div class="mt-8 pt-6 border-t border-default flex items-center justify-between text-sm">
                    <a @click.prevent="router.back()" href="/"
                        class="text-accent-blue hover:text-blue-800 font-medium cursor-pointer">
                        &larr; Back
                    </a>
                    <div class="flex gap-4">
                        <router-link to="/" class="text-accent-blue hover:underline font-medium">Plete Finance Home</router-link>
                        <router-link to="/privacy" class="text-accent-blue hover:underline font-medium">Privacy Policy</router-link>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
const router = useRouter();
</script>
