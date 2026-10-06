<template>
  <Dialog
    v-model:visible="visible"
    modal
    header="Review & Confirm Transactions"
    :style="{ width: '95vw', maxWidth: '640px' }"
    :dismissableMask="false"
  >
    <div class="space-y-4 py-2">
      <div class="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-xl text-xs text-amber-800 dark:text-amber-200 flex items-start gap-2">
        <i class="pi pi-info-circle text-base text-amber-600 dark:text-amber-400 mt-0.5"></i>
        <div>
          <span class="font-bold">Review required:</span> Verify or adjust details before saving to your financial records. No transactions are created until you confirm.
        </div>
      </div>

      <div v-if="items.length === 0" class="text-center py-6 text-sm text-secondary">
        No proposals extracted. Click cancel to try again.
      </div>

      <div v-else class="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
        <div
          v-for="(item, index) in items"
          :key="index"
          class="p-4 bg-primary border border-default rounded-xl space-y-3 relative group"
        >
          <!-- Item Header & Low Confidence Warning -->
          <div class="flex items-center justify-between gap-2">
            <div class="flex items-center gap-2">
              <input
                type="checkbox"
                v-model="item.selected"
                class="rounded border-gray-300 text-accent-blue focus:ring-accent-blue"
              />
              <span class="text-xs font-semibold text-secondary uppercase tracking-wider">
                Item #{{ index + 1 }}
              </span>
              <span
                v-if="item.isLowConfidence"
                class="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300"
              >
                Needs Review
              </span>
            </div>
            <button
              type="button"
              @click="removeItem(index)"
              class="text-xs text-rose-500 hover:text-rose-700 p-1 transition-colors"
              title="Remove item"
            >
              <i class="pi pi-trash"></i>
            </button>
          </div>

          <!-- Edit Form Fields -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label class="block font-medium text-secondary mb-1">Description / Payee</label>
              <input
                type="text"
                v-model="item.description"
                class="w-full p-2 border border-default rounded-lg bg-secondary focus:ring-2 focus:ring-accent-blue text-gray-900 dark:text-white"
                placeholder="Description"
              />
            </div>

            <div>
              <label class="block font-medium text-secondary mb-1">Amount</label>
              <input
                type="number"
                step="0.01"
                min="0"
                v-model.number="item.amount"
                class="w-full p-2 border border-default rounded-lg bg-secondary focus:ring-2 focus:ring-accent-blue text-gray-900 dark:text-white font-semibold"
                placeholder="0.00"
              />
            </div>

            <div>
              <label class="block font-medium text-secondary mb-1">Category</label>
              <select
                v-model="item.category"
                class="w-full p-2 border border-default rounded-lg bg-secondary focus:ring-2 focus:ring-accent-blue text-gray-900 dark:text-white"
              >
                <option v-for="cat in availableCategoryNames" :key="cat" :value="cat">
                  {{ cat }}
                </option>
              </select>
            </div>

            <div>
              <label class="block font-medium text-secondary mb-1">Date</label>
              <input
                type="date"
                v-model="item.date"
                class="w-full p-2 border border-default rounded-lg bg-secondary focus:ring-2 focus:ring-accent-blue text-gray-900 dark:text-white"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="pt-3 border-t border-default flex items-center justify-between">
        <span class="text-xs text-secondary">
          Selected: {{ selectedCount }} of {{ items.length }}
        </span>

        <div class="flex gap-2">
          <button
            type="button"
            @click="handleCancel"
            class="px-4 py-2 text-sm text-secondary hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            @click="handleConfirm"
            :disabled="selectedCount === 0 || isSaving"
            class="px-5 py-2 text-sm bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-medium rounded-xl shadow transition-colors flex items-center gap-2"
          >
            <i v-if="isSaving" class="pi pi-spin pi-spinner"></i>
            <i v-else class="pi pi-check"></i>
            Confirm & Save ({{ selectedCount }})
          </button>
        </div>
      </div>
    </div>
  </Dialog>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import Dialog from 'primevue/dialog';
import { useAiStore } from '@/stores/ai';
import { useCategoriesStore } from '@/stores/categories';
import { useTransactionsStore } from '@/stores/transactions';
import { useDashboardStore } from '@/stores/dashboard';

const aiStore = useAiStore();
const categoriesStore = useCategoriesStore();
const transactionsStore = useTransactionsStore();
const dashboardStore = useDashboardStore();

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
        amount: p.amount || 0,
        category: p.category || 'Uncategorised',
        date: p.date ? p.date.split('T')[0] : new Date().toISOString().split('T')[0],
        type: p.type || 'expense',
        notes: p.notes || '',
        isLowConfidence: Boolean(p.isLowConfidence),
        selected: true,
      }));
    } else {
      items.value = [];
    }
  },
  { immediate: true }
);

const selectedCount = computed(() => items.value.filter((i) => i.selected).length);

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

    // Refresh application stores
    if (transactionsStore.fetchTransactions) {
      await transactionsStore.fetchTransactions();
    }
    if (dashboardStore.fetchDashboardData) {
      await dashboardStore.fetchDashboardData();
    }

    visible.value = false;
  } catch (err) {
    console.error('Failed to save confirmed transactions:', err);
  } finally {
    isSaving.value = false;
  }
};
</script>
