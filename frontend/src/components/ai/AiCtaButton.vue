<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    @click="emit('click', $event)"
    class="btn-cta px-4 py-2 text-sm rounded-lg shadow-sm inline-flex items-center justify-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
  >
    <i
      v-if="loading"
      class="pi pi-spinner pi-spin text-accent-blue"
      :class="{ 'mr-2': hasContent }"
    ></i>
    <i
      v-else-if="icon"
      :class="[icon, { 'mr-2': hasContent }]"
    ></i>
    <span v-if="hasContent">
      <slot>{{ label }}</slot>
    </span>
  </button>
</template>

<script setup>
import { computed, useSlots } from 'vue';

const props = defineProps({
  label: {
    type: String,
    default: '',
  },
  icon: {
    type: String,
    default: 'pi pi-sparkles',
  },
  loading: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  type: {
    type: String,
    default: 'button',
  },
});

const emit = defineEmits(['click']);
const slots = useSlots();

const hasContent = computed(() => Boolean(props.label || slots.default));
</script>
