<template>
    <div class="min-h-screen bg-tertiary py-12 px-4 sm:px-6 lg:px-8">
        <div class="max-w-3xl mx-auto bg-primary shadow rounded-lg p-8 border border-default">
            <h1 class="text-3xl font-bold text-primary mb-2">Privacy Policy — Plete Finance</h1>
            <div class="prose max-w-none text-secondary space-y-4">
                <p class="text-sm text-muted">Last updated: October 2026</p>

                <h2 class="text-xl font-semibold text-primary mt-6">1. Information We Collect</h2>
                <p>Plete Finance is built on a privacy-first foundation. Unlike bank-linked budgeting apps, <strong>we never ask for or store your bank login credentials</strong>. We only collect information necessary to operate your personal finance workspace:</p>
                <ul class="list-disc pl-5 space-y-1">
                    <li><strong>Account Information:</strong> Your name, email address, and encrypted authentication credentials.</li>
                    <li><strong>Financial Ledger Records:</strong> Income, expenses, custom categories, monthly budget targets, and savings goals that you create or confirm.</li>
                    <li><strong>AI &amp; Vision OCR Inputs:</strong> Natural-language text prompts submitted via Magic Quick-Log or Ask Plete AI, and receipt or handwritten note images uploaded for OCR extraction.</li>
                </ul>

                <h2 class="text-xl font-semibold text-primary mt-6">2. How Plete AI &amp; Receipt OCR Process Your Data</h2>
                <p>When you use Plete AI features—including Magic Entry, Receipt &amp; Note OCR, Predictive Budget Forecasts, Savings Scenario Simulations, and Monthly Executive Reports—your inputs and ledger context are processed strictly to generate your requested transaction proposals and financial insights. Nothing extracted by AI is written to your ledger without your explicit human-in-the-loop confirmation.</p>

                <h2 class="text-xl font-semibold text-primary mt-6">3. Data Security &amp; No Third-Party Data Selling</h2>
                <p>We implement industry-standard technical and organizational safeguards to protect your personal data against unauthorized access, alteration, or loss. <strong>We never sell, rent, or monetize your personal or financial data to advertisers or third-party data brokers.</strong></p>

                <h2 class="text-xl font-semibold text-primary mt-6">4. Data Exports &amp; Account Control</h2>
                <p>You retain full ownership of your financial records and can export your history to PDF or Excel formats or request account deletion at any time.</p>

                <h2 class="text-xl font-semibold text-primary mt-6">5. Contact Us</h2>
                <p>If you have any questions about this Privacy Policy, please contact us at <a href="mailto:support@pletefinance.com" class="text-accent-blue hover:underline">support@pletefinance.com</a>.</p>

                <div class="mt-8 pt-6 border-t border-default flex items-center justify-between text-sm">
                    <a @click.prevent="router.back()" href="/"
                        class="text-accent-blue hover:text-blue-800 font-medium cursor-pointer">
                        &larr; Back
                    </a>
                    <div class="flex gap-4">
                        <router-link to="/" class="text-accent-blue hover:underline font-medium">Plete Finance Home</router-link>
                        <router-link to="/terms" class="text-accent-blue hover:underline font-medium">Terms of Service</router-link>
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
