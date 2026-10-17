<template>
  <button
    type="button"
    @click="emit('click', $event)"
    class="btn-cta px-3.5 py-2 text-sm rounded-lg shadow-sm inline-flex items-center cursor-pointer"
  >
    <i class="pi pi-sparkles mr-2"></i>
    <slot>{{ label }}</slot>
  </button>
</template>

<script setup>
defineProps({
  label: {
    type: String,
    default: 'Scan Receipt',
  },
});

const emit = defineEmits(['click']);
</script>
