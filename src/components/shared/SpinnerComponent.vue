<template>
  <div
      class="spinner"
      :style="{
            width: size,
            height: size,
            borderWidth: borderWidth,
            borderColor: color,
            borderLeftColor: 'transparent',
            animationDuration: speed
        }"
  ></div>
</template>

<script setup lang="ts">
defineProps({
  color: { type: String, default: 'currentColor' },
  size: { type: String, default: '18px' },
  speed: { type: String, default: '0.8s' },
  borderWidth: { type: String, default: '2px' }
});
</script>

<style scoped>
.spinner {
  display: inline-block;
  border-radius: 50%;
  border-style: solid;
  animation: spin infinite linear;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
