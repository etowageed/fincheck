<template>
  <div class="flex items-center gap-1">
    <Button
      type="button"
      icon="pi pi-check"
      size="small"
      rounded
      text
      severity="success"
      :aria-label="approveLabel"
      v-tooltip.top="approveTooltip || undefined"
      @click="emit('approve', $event)"
    />
    <Button
      type="button"
      icon="pi pi-times"
      size="small"
      rounded
      text
      severity="danger"
      :aria-label="rejectLabel"
      v-tooltip.top="rejectTooltip || undefined"
      @click="emit('reject', $event)"
    />
  </div>
</template>

<script setup>
import Button from 'primevue/button';
import TooltipDirective from 'primevue/tooltip';

const vTooltip = TooltipDirective;

defineProps({
  approveLabel: {
    type: String,
    default: 'Approve suggestion',
  },
  rejectLabel: {
    type: String,
    default: 'Reject suggestion',
  },
  approveTooltip: {
    type: String,
    default: '',
  },
  rejectTooltip: {
    type: String,
    default: '',
  },
});

const emit = defineEmits(['approve', 'reject']);
</script>
