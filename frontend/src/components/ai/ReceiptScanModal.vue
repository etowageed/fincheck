<template>
  <Dialog
    v-model:visible="visible"
    modal
    header="Scan Receipt or Note"
    :style="{ width: '34rem' }"
    :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
    :dismissableMask="true"
  >
    <div class="bg-primary rounded-lg border border-default p-4 sm:p-6 shadow-sm space-y-4">
      <!-- AI Quota Counter Banner -->
      <div class="flex flex-wrap items-center justify-between gap-2 p-3 bg-secondary border border-default rounded-lg text-xs">
        <div class="flex items-center gap-2 text-primary font-semibold">
          <i class="pi pi-sparkles text-accent-blue"></i>
          <span>AI Receipt Scan Usage</span>
        </div>
        <AiQuotaBadge
          :quota="quota"
          :loading="aiStore.isLoadingQuota"
          @open-upgrade="aiStore.openUpgradeModal('receiptScan')"
        />
      </div>

      <p class="text-sm font-medium text-secondary">
        Upload a physical receipt or handwritten financial note for OCR extraction:
      </p>

      <!-- File Dropzone -->
      <div
        role="button"
        tabindex="0"
        aria-label="Upload receipt image"
        @dragover.prevent="isDragging = true"
        @dragleave.prevent="isDragging = false"
        @drop.prevent="handleDrop"
        @click="triggerFileInput"
        @keydown.enter.prevent="triggerFileInput"
        @keydown.space.prevent="triggerFileInput"
        class="border-2 border-dashed border-default hover:border-accent-blue bg-secondary/50 rounded-lg p-6 transition-colors cursor-pointer text-center focus:outline-none focus:ring-2 focus:ring-accent-blue"
        :class="{ 'border-accent-blue bg-secondary': isDragging }"
      >
        <input
          ref="fileInput"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic,image/gif"
          class="hidden"
          @change="handleFileSelected"
        />

        <div v-if="!selectedFile" class="space-y-2">
          <div class="w-12 h-12 bg-tertiary rounded-full flex items-center justify-center mx-auto text-accent-blue text-xl border border-default">
            <i class="pi pi-camera"></i>
          </div>
          <div>
            <span class="text-sm font-semibold text-primary block">
              Click to upload or drag &amp; drop receipt
            </span>
            <span class="text-xs text-muted block mt-1">
              JPG, PNG, WebP or HEIC up to 5MB
            </span>
          </div>
        </div>

        <!-- File Preview -->
        <div v-else class="space-y-3">
          <div class="relative inline-block max-h-40 overflow-hidden rounded-lg border border-default bg-primary p-1">
            <img :src="previewUrl" alt="Receipt preview" class="max-h-36 object-contain mx-auto rounded" />
            <Button
              type="button"
              icon="pi pi-times"
              size="small"
              rounded
              text
              severity="danger"
              aria-label="Remove selected file"
              @click.stop="clearFile"
              class="!absolute top-1.5 right-1.5 bg-primary/90"
            />
          </div>
          <p class="text-xs text-secondary font-medium truncate max-w-xs mx-auto font-numeric">
            {{ selectedFile.name }} ({{ formatFileSize(selectedFile.size) }})
          </p>
        </div>
      </div>

      <!-- Scanning Skeleton State -->
      <div v-if="aiStore.isProcessingReceipt" class="p-4 bg-secondary rounded-lg border border-default space-y-3">
        <div class="flex items-center gap-2 text-xs font-semibold text-primary">
          <i class="pi pi-spinner pi-spin text-accent-blue"></i>
          <span>Extracting merchant, amount, and category from receipt...</span>
        </div>
        <Skeleton height="1.25rem" width="65%" class="rounded" />
        <Skeleton height="1.25rem" width="40%" class="rounded" />
      </div>

      <p v-if="errorMessage" class="text-xs text-accent-red font-medium text-center">
        <i class="pi pi-exclamation-triangle mr-1"></i>{{ errorMessage }}
      </p>

      <!-- Footer action -->
      <div class="pt-2 flex justify-end gap-2">
        <Button
          type="button"
          label="Cancel"
          severity="secondary"
          outlined
          size="small"
          @click="visible = false"
          :disabled="aiStore.isProcessingReceipt"
        />
        <AiCtaButton
          label="Scan & Extract"
          :loading="aiStore.isProcessingReceipt"
          :disabled="!selectedFile"
          @click="handleSubmit"
        />
      </div>
    </div>
  </Dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import Skeleton from 'primevue/skeleton';
import { useToast } from 'primevue/usetoast';
import { useAiStore } from '@/stores/ai';
import AiQuotaBadge from './AiQuotaBadge.vue';
import AiCtaButton from './AiCtaButton.vue';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['update:modelValue']);

const aiStore = useAiStore();
const toast = useToast();
const fileInput = ref(null);
const selectedFile = ref(null);
const previewUrl = ref('');
const isDragging = ref(false);
const errorMessage = ref('');

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

const quota = computed(() => aiStore.getQuotaForKey('receiptScan'));

const triggerFileInput = () => {
  fileInput.value?.click();
};

const validateAndSetFile = (file) => {
  errorMessage.value = '';
  if (!file) return;

  if (file.size > 5 * 1024 * 1024) {
    errorMessage.value = 'File size exceeds 5MB limit.';
    toast.add({
      severity: 'warn',
      summary: 'File Too Large',
      detail: 'Please upload an image smaller than 5MB.',
      life: 4000,
    });
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
    toast.add({
      severity: 'error',
      summary: 'Receipt Scan Failed',
      detail: err.response?.data?.message || 'Unable to extract details from the receipt.',
      life: 4000,
    });
  }
};
</script>
