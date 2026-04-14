<template>
  <div class="brand-logo" :class="['variant-' + variant]" :style="{ fontSize: size + 'px' }">
    <span class="brand-text">PLETE</span><span class="brand-dot">.</span>
  </div>
</template>

<script setup>
defineProps({
  size: {
    type: [Number, String],
    default: 24
  },
  variant: {
    type: String,
    default: 'primary' // primary, on-light, on-dark
  }
});
</script>

<style scoped>
.brand-logo {
  display: inline-flex;
  align-items: baseline;
  user-select: none;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-weight: 800;
  letter-spacing: -0.04em;
  line-height: 1;
}

.brand-dot {
  color: #D1FF4F; /* Always the brand lime */
}

/* Primary / On-Dark variant: All Lime */
.variant-primary .brand-text,
.variant-on-dark .brand-text {
  color: #D1FF4F;
}

/* On-Light variant: Dark text with Lime dot */
.variant-on-light .brand-text {
  color: #0F172A;
}
</style>
