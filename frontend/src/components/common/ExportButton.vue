<template>
  <Button
    :label="computedLabel"
    :icon="computedIcon"
    :severity="computedSeverity"
    :size="size"
    @click="handleClick"
  />
  <ExportModal v-model:visible="showExportModal" :default-type="defaultType" />
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import Button from 'primevue/button';
import { useAuthStore } from '@/stores/auth';
import ExportModal from './ExportModal.vue';

const props = defineProps({
  label: {
    type: String,
    default: 'Export Data',
  },
  defaultType: {
    type: String,
    default: 'all',
    validator: (value) => ['transactions', 'budget', 'income', 'expense', 'savings', 'all'].includes(value),
  },
  size: {
    type: String,
    default: 'small',
  },
  severity: {
    type: String,
    default: 'secondary',
  },
  gatePremium: {
    type: Boolean,
    default: false,
  },
});

const authStore = useAuthStore();
const router = useRouter();
const showExportModal = ref(false);

const isLocked = computed(() => props.gatePremium && !authStore.isPremium);

const computedLabel = computed(() =>
  isLocked.value ? 'Upgrade to Export Data' : props.label
);

const computedIcon = computed(() =>
  isLocked.value ? 'pi pi-lock' : 'pi pi-download'
);

const computedSeverity = computed(() => {
  if (props.gatePremium) {
    return authStore.isPremium ? 'help' : 'secondary';
  }
  return props.severity;
});

const handleClick = () => {
  if (isLocked.value) {
    router.push('/pricing');
  } else {
    showExportModal.value = true;
  }
};
</script>
