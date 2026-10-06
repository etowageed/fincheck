<template>
  <Dialog
    v-model:visible="visible"
    modal
    header="Unlock Premium AI Features"
    :style="{ width: '90vw', maxWidth: '480px' }"
    :dismissableMask="true"
  >
    <div class="space-y-4 text-center py-2">
      <div class="w-16 h-16 bg-amber-100 dark:bg-amber-950/60 rounded-full flex items-center justify-center mx-auto text-amber-600 dark:text-amber-400 text-2xl">
        <i class="pi pi-bolt"></i>
      </div>
      <div>
        <h3 class="text-xl font-bold text-gray-900 dark:text-white">
          {{ featureName }} Limit Reached
        </h3>
        <p class="text-sm text-secondary mt-1">
          You've used all free entries for this feature this month. Upgrade to Plete Premium for unlimited access to all AI features.
        </p>
      </div>

      <div class="bg-primary border border-default rounded-xl p-4 text-left space-y-2 text-xs">
        <div class="font-semibold text-secondary flex items-center gap-1">
          <i class="pi pi-check-circle text-emerald-500"></i> Unlimited Quick-Log & Receipt Scans
        </div>
        <div class="font-semibold text-secondary flex items-center gap-1">
          <i class="pi pi-check-circle text-emerald-500"></i> Unlimited AI Financial Coach & Ask Plete
        </div>
        <div class="font-semibold text-secondary flex items-center gap-1">
          <i class="pi pi-check-circle text-emerald-500"></i> Unlimited Budget Forecasts & Reports
        </div>
      </div>

      <div class="pt-2 flex flex-col gap-2">
        <button
          @click="goToUpgrade"
          :disabled="isCheckoutLoading"
          class="w-full py-3 px-4 bg-accent-blue hover:bg-blue-600 text-white font-medium rounded-xl shadow transition-colors flex items-center justify-center gap-2"
        >
          <i v-if="isCheckoutLoading" class="pi pi-spin pi-spinner"></i>
          <i v-else class="pi pi-sparkles"></i>
          Upgrade to Premium
        </button>
        <button
          @click="visible = false"
          class="w-full py-2 text-sm text-secondary hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          Maybe Later
        </button>
      </div>
    </div>
  </Dialog>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import Dialog from 'primevue/dialog';
import { useAiStore } from '@/stores/ai';
import api from '@/services/api';

const aiStore = useAiStore();
const router = useRouter();
const isCheckoutLoading = ref(false);

const visible = computed({
  get: () => aiStore.showUpgradePromptModal,
  set: (val) => {
    aiStore.showUpgradePromptModal = val;
  },
});

const featureName = computed(() => {
  const key = aiStore.exhaustedFeatureKey;
  if (!key) return 'Monthly Quota';
  return aiStore.featuresQuota[key]?.name || 'Feature';
});

const goToUpgrade = async () => {
  isCheckoutLoading.value = true;
  try {
    const response = await api.post('/payment/checkout');
    if (response.data?.sessionUrl) {
      window.location.href = response.data.sessionUrl;
    } else {
      router.push('/pricing');
    }
  } catch (err) {
    router.push('/pricing');
  } finally {
    isCheckoutLoading.value = false;
    visible.value = false;
  }
};
</script>
