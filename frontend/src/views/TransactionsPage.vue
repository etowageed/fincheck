<template>
    <div>
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
            <h1 class="text-2xl md:text-3xl font-extrabold tracking-tight text-primary leading-tight">Transactions</h1>
            <div class="flex items-center gap-2 flex-wrap">
                <QuickLogButton @click="showQuickLog = true" />
                <ScanReceiptButton @click="showReceiptScan = true" />
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
import UserTransactions from '@/components/finances/UserTransactions.vue';
import QuickLogButton from '@/components/ai/QuickLogButton.vue';
import ScanReceiptButton from '@/components/ai/ScanReceiptButton.vue';
import QuickLogModal from '@/components/ai/QuickLogModal.vue';
import ReceiptScanModal from '@/components/ai/ReceiptScanModal.vue';
import AiTransactionConfirmModal from '@/components/ai/AiTransactionConfirmModal.vue';
import { useRouter, useRoute } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { useAuthStore } from '@/stores/auth';

const showQuickLog = ref(false);
const showReceiptScan = ref(false);

const route = useRoute();
const router = useRouter();
const toast = useToast();
const authStore = useAuthStore();

onMounted(() => {

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