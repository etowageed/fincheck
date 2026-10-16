<template>
  <Dialog
    v-model:visible="visible"
    modal
    header="Unlock Premium AI Features"
    :style="{ width: '30rem' }"
    :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
    :dismissableMask="true"
  >
    <div class="bg-primary rounded-lg border border-default p-4 sm:p-6 shadow-sm space-y-4 text-center">
      <div class="w-14 h-14 bg-tertiary border border-default rounded-full flex items-center justify-center mx-auto text-accent-blue text-2xl">
        <i class="pi pi-sparkles"></i>
      </div>
      <div>
        <h3 class="text-xl font-bold tracking-tight text-primary">
          {{ featureName }} Limit Reached
        </h3>
        <p class="text-sm text-secondary mt-1 leading-relaxed">
          You've used all free entries for this feature this month. Upgrade to Plete Premium for unlimited access to all AI features.
        </p>
      </div>

      <div class="bg-secondary border border-default rounded-lg p-4 text-left space-y-2.5 text-sm">
        <div class="font-medium text-primary flex items-center gap-2">
          <i class="pi pi-check-circle text-accent-green"></i>
          <span>Unlimited Quick-Log &amp; Receipt Scans</span>
        </div>
        <div class="font-medium text-primary flex items-center gap-2">
          <i class="pi pi-check-circle text-accent-green"></i>
          <span>Unlimited AI Financial Coach &amp; Ask Plete</span>
        </div>
        <div class="font-medium text-primary flex items-center gap-2">
          <i class="pi pi-check-circle text-accent-green"></i>
          <span>Unlimited Budget Forecasts &amp; Reports</span>
        </div>
      </div>

      <div class="pt-2 flex flex-col gap-2">
        <button
          type="button"
          @click="goToUpgrade"
          :disabled="isCheckoutLoading"
          class="btn-cta w-full py-2.5 px-4 text-sm rounded-lg shadow-sm flex items-center justify-center cursor-pointer disabled:opacity-50"
        >
          <i v-if="isCheckoutLoading" class="pi pi-spinner pi-spin text-accent-blue mr-2"></i>
          <i v-else class="pi pi-sparkles mr-2"></i>
          <span>Upgrade to Premium</span>
        </button>
        <Button
          type="button"
          label="Maybe Later"
          severity="secondary"
          outlined
          size="small"
          class="w-full"
          @click="visible = false"
        />
      </div>
    </div>
  </Dialog>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
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
