<template>
  <Dialog v-model:visible="visible" modal header="AI Magic Entry" :style="{ width: '34rem' }"
    :breakpoints="{ '1199px': '75vw', '575px': '90vw' }" :dismissableMask="true">
    <div class="bg-primary rounded-lg border border-default p-4 sm:p-6 shadow-sm space-y-4">
      <!-- AI Quota Counter Banner -->
      <div
        class="flex flex-wrap items-center justify-between gap-2 p-3 bg-secondary border border-default rounded-lg text-xs">
        <div class="flex items-center gap-2 text-primary font-semibold">
          <i class="pi pi-sparkles text-accent-blue"></i>
          <span>AI Magic Entries Usage</span>
        </div>
        <AiQuotaBadge :quota="quota" :loading="aiStore.isLoadingQuota"
          @open-upgrade="aiStore.openUpgradeModal('quickLog')" />
      </div>

      <div class="flex flex-col gap-2">
        <br>
        <label for="quickLogInput" class="text-sm font-medium text-secondary">
          Type or paste natural language text describing an entry:
        </label>
        <Textarea id="quickLogInput" v-model="inputText" rows="3" :placeholder="placeholderText"
          class="w-full text-sm bg-secondary border border-default rounded-lg text-primary"
          :disabled="aiStore.isProcessingQuickLog" @keydown.enter.prevent="handleKeydown" />
      </div>

      <!-- Parsing Skeleton State -->
      <div v-if="aiStore.isProcessingQuickLog" class="p-4 bg-secondary rounded-lg border border-default space-y-2.5">
        <div class="flex items-center gap-2 text-xs font-semibold text-primary">
          <i class="pi pi-spinner pi-spin text-accent-blue"></i>
          <span>Parsing transaction details and matching category...</span>
        </div>
        <Skeleton height="1.25rem" width="70%" class="rounded" />
        <Skeleton height="1.25rem" width="45%" class="rounded" />
      </div>
      <br>

      <!-- Quick example chips -->
      <div>
        <span class="text-xs text-muted block mb-2 font-semibold uppercase tracking-wider">Try an example:</span>
        <div class="flex flex-wrap gap-2">
          <PromptChip v-for="example in examples" :key="example" :label="example" quoted class="font-numeric"
            @click="inputText = example" />
        </div>
      </div>

      <!-- Footer action -->
      <div class="pt-2 flex justify-end gap-2">
        <Button type="button" label="Cancel" severity="secondary" outlined size="small" @click="visible = false"
          :disabled="aiStore.isProcessingQuickLog" />
        <AiCtaButton label="Parse Expense" :loading="aiStore.isProcessingQuickLog" :disabled="!inputText.trim()"
          @click="handleSubmit" />
      </div>
    </div>
  </Dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import Textarea from 'primevue/textarea';
import Skeleton from 'primevue/skeleton';
import { useToast } from 'primevue/usetoast';
import { useAiStore } from '@/stores/ai';
import { useCurrencyFormatter } from '@/composables/useCurrencyFormatter';
import AiQuotaBadge from './AiQuotaBadge.vue';
import AiCtaButton from './AiCtaButton.vue';
import PromptChip from './PromptChip.vue';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['update:modelValue']);

const aiStore = useAiStore();
const toast = useToast();
const { formatCurrency } = useCurrencyFormatter();
const inputText = ref('');

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

watch(
  visible,
  (newVal) => {
    if (newVal) {
      aiStore.fetchQuota();
    }
  },
  { immediate: true }
);

const quota = computed(() => aiStore.getQuotaForKey('quickLog'));

const placeholderText = computed(
  () => `e.g., "${formatCurrency(14.2, true)} coffee and sandwich yesterday" or "${formatCurrency(50)} groceries on Friday"`
);

const examples = computed(() => [
  `${formatCurrency(14.2, true)} coffee and lunch yesterday`,
  `${formatCurrency(65)} gas and snacks on Tuesday`,
  `${formatCurrency(35)} train ticket to work`,
]);

const handleKeydown = (e) => {
  if (e.shiftKey) return;
  handleSubmit();
};

const handleSubmit = async () => {
  if (!inputText.value.trim() || aiStore.isProcessingQuickLog) return;
  try {
    await aiStore.submitQuickLog(inputText.value.trim());
    inputText.value = '';
    visible.value = false;
  } catch (err) {
    toast.add({
      severity: 'error',
      summary: 'Quick-Log Failed',
      detail: err.response?.data?.message || 'Could not parse expense text.',
      life: 4000,
    });
  }
};
</script>
