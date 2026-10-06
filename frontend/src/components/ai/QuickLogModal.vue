<template>
  <Dialog
    v-model:visible="visible"
    modal
    header="AI Quick-Log Expense"
    :style="{ width: '90vw', maxWidth: '520px' }"
    :dismissableMask="true"
  >
    <div class="space-y-4 py-1">
      <div class="flex items-center justify-between text-xs text-secondary">
        <span>Type or paste natural language expense text:</span>
        <AiQuotaBadge :quota="quota" @open-upgrade="aiStore.showUpgradePromptModal = true" />
      </div>

      <div>
        <textarea
          v-model="inputText"
          rows="3"
          placeholder='e.g., "£14.20 coffee and sandwich yesterday" or "$50 groceries at Tesco on Friday"'
          class="w-full p-3 text-sm bg-primary border border-default rounded-xl focus:ring-2 focus:ring-accent-blue focus:outline-none dark:text-white"
          :disabled="aiStore.isProcessingQuickLog"
          @keydown.enter.prevent="handleKeydown"
        ></textarea>
      </div>

      <!-- Quick example chips -->
      <div>
        <span class="text-xs text-secondary block mb-1.5 font-medium">Try an example:</span>
        <div class="flex flex-wrap gap-1.5">
          <button
            v-for="example in examples"
            :key="example"
            type="button"
            @click="inputText = example"
            class="text-xs px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-secondary transition-colors"
          >
            "{{ example }}"
          </button>
        </div>
      </div>

      <!-- Footer action -->
      <div class="pt-2 flex justify-end gap-2">
        <button
          type="button"
          @click="visible = false"
          class="px-4 py-2 text-sm text-secondary hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          @click="handleSubmit"
          :disabled="!inputText.trim() || aiStore.isProcessingQuickLog"
          class="px-5 py-2 text-sm bg-accent-blue hover:bg-blue-600 disabled:opacity-50 text-white font-medium rounded-xl shadow transition-colors flex items-center gap-2"
        >
          <i v-if="aiStore.isProcessingQuickLog" class="pi pi-spin pi-spinner"></i>
          <i v-else class="pi pi-sparkles"></i>
          Parse Expense
        </button>
      </div>
    </div>
  </Dialog>
</template>

<script setup>
import { ref, computed } from 'vue';
import Dialog from 'primevue/dialog';
import { useAiStore } from '@/stores/ai';
import AiQuotaBadge from './AiQuotaBadge.vue';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['update:modelValue']);

const aiStore = useAiStore();
const inputText = ref('');

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

const quota = computed(() => aiStore.getQuotaForKey('quickLog'));

const examples = [
  '£14.20 coffee and lunch yesterday',
  '$65 gas and snacks on Tuesday',
  '£35 train ticket to London',
];

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
    // Handled in store/global toast
  }
};
</script>
