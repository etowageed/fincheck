<template>
  <Button
    :label="computedLabel"
    :icon="computedIcon"
    :size="size"
    :severity="computedSeverity"
    :class="[{ 'btn-cta': isCtaStyled }]"
    :loading="isLoading"
    :disabled="disabled || isLoading"
    @click="handleClick"
  />
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import Button from 'primevue/button';
import { useToast } from 'primevue/usetoast';
import { useAuthStore } from '@/stores/auth';
import api from '@/services/api';

const props = defineProps({
  action: {
    type: String,
    default: 'auto',
    validator: (val) => ['auto', 'checkout', 'portal', 'pricing'].includes(val),
  },
  label: {
    type: String,
    default: '',
  },
  icon: {
    type: String,
    default: '',
  },
  size: {
    type: String,
    default: undefined,
  },
  severity: {
    type: String,
    default: undefined,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  fallbackToPricing: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['completed']);

const authStore = useAuthStore();
const router = useRouter();
const toast = useToast();
const isLoading = ref(false);

const resolvedAction = computed(() => {
  if (props.action === 'auto') {
    return authStore.isPremium ? 'portal' : 'checkout';
  }
  return props.action;
});

const isPortal = computed(() => resolvedAction.value === 'portal');

const computedLabel = computed(() => {
  if (props.label) return props.label;
  return isPortal.value ? 'Manage Subscription' : 'Upgrade to Premium';
});

const computedIcon = computed(() => {
  if (props.icon !== '') return props.icon;
  return isPortal.value ? 'pi pi-cog' : 'pi pi-sparkles';
});

const computedSeverity = computed(() => {
  if (props.severity) return props.severity;
  return isPortal.value && props.action === 'portal' ? 'info' : undefined;
});

const isCtaStyled = computed(() => !(isPortal.value && props.action === 'portal'));

const handleClick = async () => {
  if (resolvedAction.value === 'pricing') {
    router.push('/pricing');
    emit('completed');
    return;
  }

  isLoading.value = true;
  try {
    if (isPortal.value) {
      const response = await api.post('/payment/portal');
      if (response.data?.portalUrl) {
        window.location.href = response.data.portalUrl;
      } else {
        throw new Error('Did not receive a valid portal URL.');
      }
    } else {
      const response = await api.post('/payment/checkout');
      if (response.data?.sessionUrl) {
        window.location.href = response.data.sessionUrl;
      } else if (props.fallbackToPricing) {
        router.push('/pricing');
      } else {
        throw new Error('Did not receive a valid session URL.');
      }
    }
  } catch (error) {
    if (props.fallbackToPricing && !isPortal.value) {
      router.push('/pricing');
    } else {
      toast.add({
        severity: 'error',
        summary: isPortal.value ? 'Access Failed' : 'Upgrade Failed',
        detail:
          error.response?.data?.message ||
          (isPortal.value
            ? 'Failed to access subscription portal.'
            : 'Failed to initiate checkout.'),
        life: 5000,
      });
    }
  } finally {
    isLoading.value = false;
    emit('completed');
  }
};
</script>
