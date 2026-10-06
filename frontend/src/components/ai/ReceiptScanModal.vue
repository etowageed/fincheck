<template>
  <Dialog
    v-model:visible="visible"
    modal
    header="Scan Receipt or Note"
    :style="{ width: '90vw', maxWidth: '520px' }"
    :dismissableMask="true"
  >
    <div class="space-y-4 py-1">
      <div class="flex items-center justify-between text-xs text-secondary">
        <span>Upload physical receipt or handwritten financial note:</span>
        <AiQuotaBadge :quota="quota" @open-upgrade="aiStore.showUpgradePromptModal = true" />
      </div>

      <!-- File Dropzone -->
      <div
        @dragover.prevent="isDragging = true"
        @dragleave.prevent="isDragging = false"
        @drop.prevent="handleDrop"
        class="border-2 border-dashed rounded-2xl p-6 text-center transition-colors cursor-pointer"
        :class="[
          isDragging
            ? 'border-accent-blue bg-blue-50/50 dark:bg-blue-950/40'
            : 'border-default bg-primary hover:border-gray-400 dark:hover:border-gray-600',
        ]"
        @click="triggerFileInput"
      >
        <input
          ref="fileInput"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic,image/gif"
          class="hidden"
          @change="handleFileSelected"
        />

        <div v-if="!selectedFile" class="space-y-2">
          <div class="w-12 h-12 bg-blue-50 dark:bg-blue-950/60 rounded-full flex items-center justify-center mx-auto text-accent-blue text-xl">
            <i class="pi pi-camera"></i>
          </div>
          <div>
            <span class="text-sm font-medium text-gray-900 dark:text-white block">
              Click to upload or drag & drop receipt
            </span>
            <span class="text-xs text-secondary block mt-0.5">
              JPG, PNG, WebP or HEIC up to 5MB
            </span>
          </div>
        </div>

        <!-- File Preview -->
        <div v-else class="space-y-3">
          <div class="relative inline-block max-h-40 overflow-hidden rounded-lg border border-default">
            <img :src="previewUrl" alt="Receipt preview" class="max-h-40 object-contain mx-auto" />
            <button
              type="button"
              @click.stop="clearFile"
              class="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center text-xs hover:bg-black"
            >
              <i class="pi pi-times"></i>
            </button>
          </div>
          <p class="text-xs text-secondary font-medium truncate max-w-xs mx-auto">
            {{ selectedFile.name }} ({{ formatFileSize(selectedFile.size) }})
          </p>
        </div>
      </div>

      <p v-if="errorMessage" class="text-xs text-rose-500 font-medium text-center">
        {{ errorMessage }}
      </p>

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
          :disabled="!selectedFile || aiStore.isProcessingReceipt"
          class="px-5 py-2 text-sm bg-accent-blue hover:bg-blue-600 disabled:opacity-50 text-white font-medium rounded-xl shadow transition-colors flex items-center gap-2"
        >
          <i v-if="aiStore.isProcessingReceipt" class="pi pi-spin pi-spinner"></i>
          <i v-else class="pi pi-sparkles"></i>
          Scan & Extract
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
const fileInput = ref(null);
const selectedFile = ref(null);
const previewUrl = ref('');
const isDragging = ref(false);
const errorMessage = ref('');

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

const quota = computed(() => aiStore.getQuotaForKey('receiptScan'));

const triggerFileInput = () => {
  fileInput.value?.click();
};

const validateAndSetFile = (file) => {
  errorMessage.value = '';
  if (!file) return;

  if (file.size > 5 * 1024 * 1024) {
    errorMessage.value = 'File size exceeds 5MB limit.';
    return;
  }

  selectedFile.value = file;
  previewUrl.value = URL.createObjectURL(file);
};

const handleFileSelected = (e) => {
  const file = e.target.files?.[0];
  validateAndSetFile(file);
};

const handleDrop = (e) => {
  isDragging.value = false;
  const file = e.dataTransfer?.files?.[0];
  validateAndSetFile(file);
};

const clearFile = () => {
  selectedFile.value = null;
  previewUrl.value = '';
  errorMessage.value = '';
  if (fileInput.value) fileInput.value.value = '';
};

const formatFileSize = (bytes) => {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const handleSubmit = async () => {
  if (!selectedFile.value || aiStore.isProcessingReceipt) return;
  try {
    await aiStore.submitReceiptScan(selectedFile.value);
    clearFile();
    visible.value = false;
  } catch (err) {
    // Error handled in store/global toast
  }
};
</script>
