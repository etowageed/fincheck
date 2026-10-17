<template>
  <button
    type="button"
    @click="emit('click', $event)"
    class="text-xs px-3 py-1.5 rounded-lg bg-secondary text-primary border border-default hover:border-accent-blue transition-colors cursor-pointer"
  >
    <slot>{{ quoted ? `"${label}"` : label }}</slot>
  </button>
</template>

<script setup>
defineProps({
  label: {
    type: String,
    default: '',
  },
  quoted: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['click']);
</script>
