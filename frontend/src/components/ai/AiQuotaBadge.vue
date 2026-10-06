<template>
  <div v-if="quota" class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50">
    <i class="pi pi-sparkles text-amber-500"></i>
    <template v-if="quota.isPremium">
      <span>Unlimited Premium</span>
    </template>
    <template v-else>
      <span>{{ quota.remaining }} / {{ quota.limit }} {{ label || 'left' }}</span>
    </template>
    <button
      v-if="!quota.isPremium && showUpgradeBtn"
      @click.stop="$emit('open-upgrade')"
      class="ml-1 underline hover:text-blue-900 dark:hover:text-blue-100 transition-colors"
      title="Upgrade to Premium"
    >
      Upgrade
    </button>
  </div>
</template>

<script setup>
defineProps({
  quota: {
    type: Object,
    default: null,
  },
  label: {
    type: String,
    default: 'remaining',
  },
  showUpgradeBtn: {
    type: Boolean,
    default: true,
  },
});

defineEmits(['open-upgrade']);
</script>
