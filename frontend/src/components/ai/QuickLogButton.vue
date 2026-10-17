<template>
  <button
    type="button"
    @click="emit('click', $event)"
    class="px-3.5 py-2 text-sm font-semibold rounded-lg bg-secondary text-primary border border-default hover:border-accent-blue transition-colors inline-flex items-center cursor-pointer"
  >
    <i class="pi pi-sparkles text-accent-blue mr-2"></i>
    <slot>{{ label }}</slot>
  </button>
</template>

<script setup>
defineProps({
  label: {
    type: String,
    default: 'Magic Entry',
  },
});

const emit = defineEmits(['click']);
</script>
