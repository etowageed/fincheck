<template>
  <Dialog
    v-model:visible="visible"
    modal
    header="Review & Confirm AI Transactions"
    :style="{ width: '40rem' }"
    :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
    :dismissableMask="false"
  >
    <div class="space-y-4 py-1">
      <!-- Info Banner -->
      <div class="bg-primary rounded-lg shadow-sm border border-default p-4 flex items-start justify-between gap-3">
        <div class="flex items-start gap-2.5">
          <i class="pi pi-lightbulb text-accent-blue text-lg mt-0.5"></i>
          <div>
            <div class="mb-1">
              <span class="text-sm font-bold tracking-tight text-primary">Review Extracted Proposals</span>
            </div>
            <p class="text-xs sm:text-sm text-secondary leading-relaxed">
              Verify or adjust extracted merchant names, amounts, and categories before saving. No records are created until you confirm.
            </p>
          </div>
        </div>
      </div>

      <div v-if="items.length === 0" class="bg-primary rounded-lg border border-default p-6 text-center text-sm text-secondary shadow-sm">
        No proposals remaining. Click cancel to close and try again.
      </div>

      <div v-else class="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
        <div
          v-for="(item, index) in items"
          :key="index"
          class="bg-primary rounded-lg border border-default p-4 sm:p-6 shadow-sm space-y-4 transition-colors"
          :class="{ 'opacity-60': !item.selected }"
        >
          <!-- Item Header & Confidence Actions -->
          <div class="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-default">
            <div class="flex flex-wrap items-center gap-2">
              <input
                :id="`ai-item-select-${index}`"
                type="checkbox"
                v-model="item.selected"
                class="w-4 h-4 rounded border-default text-accent-blue focus:ring-accent-blue cursor-pointer"
              />
              <label :for="`ai-item-select-${index}`" class="text-xs font-bold text-primary uppercase tracking-wider cursor-pointer">
                Item #{{ index + 1 }}
              </label>
              <span
                v-if="item.isLowConfidence"
                class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-950/60 text-accent-yellow border border-amber-300 dark:border-amber-800/60"
              >
                <i class="pi pi-exclamation-triangle text-[10px]"></i> Low Confidence
              </span>
              <span
                v-else-if="item.confidenceApproved"
                class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-tertiary text-accent-green border border-default"
              >
                <i class="pi pi-check-circle text-[10px]"></i> Approved
              </span>
            </div>

            <div class="flex items-center gap-2">
              <span class="font-numeric font-bold text-sm text-primary">
                {{ formatCurrency(item.amount || 0, true) }}
              </span>
              <SuggestionActionButtons
                @approve="approveItemConfidence(index)"
                @reject="removeItem(index)"
              />
            </div>
          </div>

          <!-- Standard PrimeVue Form Inputs -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div class="flex flex-col gap-1.5">
              <label :for="`ai-desc-${index}`" class="text-xs font-semibold text-secondary">
                Description / Merchant
              </label>
              <InputText
                :id="`ai-desc-${index}`"
                v-model="item.description"
                placeholder="Merchant or description"
                class="w-full text-sm"
              />
            </div>

            <div class="flex flex-col gap-1.5">
              <label :for="`ai-amount-${index}`" class="text-xs font-semibold text-secondary">
                Amount
              </label>
              <InputNumber
                :id="`ai-amount-${index}`"
                v-model="item.amount"
                mode="currency"
                :currency="preferredCurrency"
                :locale="preferredLocale"
                placeholder="0.00"
                class="w-full text-sm font-numeric"
                inputClass="w-full font-numeric"
              />
            </div>

            <div class="flex flex-col gap-1.5">
              <label :for="`ai-category-${index}`" class="text-xs font-semibold text-secondary">
                Proposed Category
              </label>
              <Dropdown
                :id="`ai-category-${index}`"
                v-model="item.category"
                :options="availableCategoryNames"
                placeholder="Select a category"
                filter
                filterPlaceholder="Search categories..."
                class="w-full text-sm"
              />
            </div>

            <div class="flex flex-col gap-1.5">
              <label :for="`ai-date-${index}`" class="text-xs font-semibold text-secondary">
                Date
              </label>
              <InputText
                :id="`ai-date-${index}`"
                type="date"
                v-model="item.date"
                class="w-full text-sm font-numeric"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="pt-3 border-t border-default flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div class="text-xs sm:text-sm text-secondary font-medium">
          Selected: <span class="font-bold text-primary font-numeric">{{ selectedCount }}</span> of <span class="font-numeric">{{ items.length }}</span>
          <span v-if="selectedCount > 0" class="ml-2 text-primary font-bold font-numeric">
            ({{ formatCurrency(selectedTotalAmount, true) }})
          </span>
        </div>

        <div class="flex justify-end gap-2">
          <Button
            type="button"
            label="Cancel"
            severity="secondary"
            outlined
            size="small"
            @click="handleCancel"
            :disabled="isSaving"
          />
          <AiCtaButton
            :loading="isSaving"
            :disabled="selectedCount === 0"
            class="font-numeric"
            @click="handleConfirm"
          >
            Confirm &amp; Save ({{ selectedCount }})
          </AiCtaButton>
        </div>
      </div>
    </div>
  </Dialog>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import Dropdown from 'primevue/dropdown';
import { useToast } from 'primevue/usetoast';
import { useAiStore } from '@/stores/ai';
import { useCategoriesStore } from '@/stores/categories';
import { useTransactionsStore } from '@/stores/transactions';
import { useDashboardStore } from '@/stores/dashboard';
import { useCurrencyFormatter } from '@/composables/useCurrencyFormatter';
import SuggestionActionButtons from '@/components/common/SuggestionActionButtons.vue';
import AiCtaButton from './AiCtaButton.vue';

const aiStore = useAiStore();
const categoriesStore = useCategoriesStore();
const transactionsStore = useTransactionsStore();
const dashboardStore = useDashboardStore();
const toast = useToast();
const { preferredCurrency, preferredLocale, formatCurrency } = useCurrencyFormatter();

const isSaving = ref(false);
const items = ref([]);

const visible = computed({
  get: () => aiStore.showConfirmModal,
  set: (val) => {
    aiStore.showConfirmModal = val;
  },
});

onMounted(async () => {
  if (categoriesStore.categories.length === 0) {
    await categoriesStore.fetchCategories();
  }
});

const availableCategoryNames = computed(() => {
  const cats = categoriesStore.getAllCategories.map((c) => c.name);
  if (!cats.includes('Uncategorised')) cats.push('Uncategorised');
  if (!cats.includes('Uncategorized')) cats.push('Uncategorized');
  return cats;
});

watch(
  () => aiStore.pendingProposals,
  (newVal) => {
    if (Array.isArray(newVal)) {
      items.value = newVal.map((p) => ({
        description: p.description || p.merchant || 'Expense',
        merchant: p.merchant || '',
        amount: Number(p.amount) || 0,
        category: p.category || 'Uncategorised',
        date: p.date ? p.date.split('T')[0] : new Date().toISOString().split('T')[0],
        type: p.type || 'expense',
        notes: p.notes || '',
        isLowConfidence: Boolean(p.isLowConfidence),
        confidenceApproved: false,
        selected: true,
      }));
    } else {
      items.value = [];
    }
  },
  { immediate: true }
);

const selectedCount = computed(() => items.value.filter((i) => i.selected).length);

const selectedTotalAmount = computed(() =>
  items.value
    .filter((i) => i.selected)
    .reduce((sum, i) => sum + (Number(i.amount) || 0), 0)
);

const approveItemConfidence = (idx) => {
  if (!items.value[idx]) return;
  items.value[idx].isLowConfidence = false;
  items.value[idx].confidenceApproved = true;
  items.value[idx].selected = true;
};

const removeItem = (idx) => {
  items.value.splice(idx, 1);
};

const handleCancel = () => {
  aiStore.pendingProposals = [];
  visible.value = false;
};

const handleConfirm = async () => {
  const selectedItems = items.value.filter((i) => i.selected);
  if (selectedItems.length === 0) return;

  isSaving.value = true;
  try {
    await aiStore.saveConfirmedTransactions(selectedItems);

    if (transactionsStore.fetchTransactions) {
      await transactionsStore.fetchTransactions();
    }
    if (dashboardStore.fetchDashboardData) {
      await dashboardStore.fetchDashboardData();
    }

    toast.add({
      severity: 'success',
      summary: 'Transactions Saved',
      detail: `Successfully added ${selectedItems.length} AI-extracted transaction(s).`,
      life: 4000,
    });

    visible.value = false;
  } catch (err) {
    console.error('Failed to save confirmed transactions:', err);
    toast.add({
      severity: 'error',
      summary: 'Save Failed',
      detail: err.response?.data?.message || 'Could not save confirmed transactions.',
      life: 4000,
    });
  } finally {
    isSaving.value = false;
  }
};
</script>
