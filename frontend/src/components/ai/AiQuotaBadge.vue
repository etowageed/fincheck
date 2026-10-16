<template>
  <div
    v-if="quota"
    class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-950/50 text-accent-blue border border-blue-200 dark:border-blue-900/60"
  >
    <i class="pi pi-sparkles text-[10px]"></i>
    <template v-if="quota.isPremium">
      <span>Unlimited Premium</span>
    </template>
    <template v-else>
      <span class="font-numeric">{{ quota.remaining }} / {{ quota.limit }} {{ label || 'left' }}</span>
    </template>
    <button
      v-if="!quota.isPremium && showUpgradeBtn"
      type="button"
      @click.stop="$emit('open-upgrade')"
      class="ml-1 underline font-semibold text-accent-blue hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-accent-blue rounded transition-opacity cursor-pointer"
      title="Upgrade to Premium"
    >
      Upgrade
    </button>
  </div>
  <div
    v-else-if="loading"
    class="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium bg-secondary text-secondary border border-default"
  >
    <i class="pi pi-spinner pi-spin text-accent-blue"></i>
    <span>Loading quota...</span>
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
  loading: {
    type: Boolean,
    default: false,
  },
});

defineEmits(['open-upgrade']);
</script>
