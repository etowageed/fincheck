<template>
  <RouterLink
    :to="to"
    class="flex items-center px-4 py-3 font-medium text-base text-secondary rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-accent-blue transition-colors"
    active-class="bg-blue-50 dark:bg-blue-950/40 text-accent-blue"
    @click="emit('click', $event)"
  >
    <i :class="[icon, 'mr-3']"></i>
    <slot>{{ label }}</slot>
  </RouterLink>
</template>

<script setup>
defineProps({
  to: {
    type: String,
    required: true,
  },
  icon: {
    type: String,
    required: true,
  },
  label: {
    type: String,
    default: '',
  },
});

const emit = defineEmits(['click']);
</script>
