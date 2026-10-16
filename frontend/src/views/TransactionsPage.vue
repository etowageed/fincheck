<template>
    <div>
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
            <h1 class="text-2xl md:text-3xl font-extrabold tracking-tight text-primary leading-tight">Transactions</h1>
            <div class="flex items-center gap-2 flex-wrap">
                <button
                    type="button"
                    @click="showQuickLog = true"
                    class="px-3.5 py-2 text-sm font-semibold rounded-lg bg-secondary text-primary border border-default hover:border-accent-blue transition-colors inline-flex items-center cursor-pointer"
                >
                    <i class="pi pi-sparkles text-accent-blue mr-2"></i> Magic Entry
                </button>
                <button
                    type="button"
                    @click="showReceiptScan = true"
                    class="btn-cta px-3.5 py-2 text-sm rounded-lg shadow-sm inline-flex items-center cursor-pointer"
                >
                    <i class="pi pi-sparkles mr-2"></i> Scan Receipt
                </button>
            </div>
        </div>

        <UserTransactions />

        <QuickLogModal v-model="showQuickLog" />
        <ReceiptScanModal v-model="showReceiptScan" />
        <AiTransactionConfirmModal />
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useTransactionsStore } from '@/stores/transactions';
import UserTransactions from '@/components/finances/UserTransactions.vue';
import QuickLogModal from '@/components/ai/QuickLogModal.vue';
import ReceiptScanModal from '@/components/ai/ReceiptScanModal.vue';
import AiTransactionConfirmModal from '@/components/ai/AiTransactionConfirmModal.vue';
import { useRouter, useRoute } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { useAuthStore } from '@/stores/auth';

const showQuickLog = ref(false);
const showReceiptScan = ref(false);

const transactionsStore = useTransactionsStore();

onMounted(() => {
    const route = useRoute();
    const router = useRouter();
    const toast = useToast();
    const authStore = useAuthStore();

    if (route.query.payment === 'success') {
        toast.add({
            severity: 'success',
            summary: 'Payment Successful',
            detail: 'Welcome to Premium! Your account status will update shortly.',
            life: 5000,
        });

        setTimeout(() => {
            authStore.checkAuth();
        }, 3000);

        router.replace({ query: { ...route.query, payment: undefined } });
    } else if (route.query.payment === 'cancel') {
        toast.add({
            severity: 'info',
            summary: 'Payment Canceled',
            detail: 'You canceled the checkout process.',
            life: 3000,
        });
        router.replace({ query: { ...route.query, payment: undefined } });
    }
});
</script>