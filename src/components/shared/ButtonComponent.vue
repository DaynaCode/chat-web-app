<template>
  <Button v-bind="$attrs">
    <SpinnerComponent v-if="isLoading" />
    <slot v-else></slot>
  </Button>
</template>

<script setup lang="ts">
import SpinnerComponent from "@/components/shared/SpinnerComponent.vue";

const props = defineProps({
  isLoading: {
    type: Boolean,
    default: false
  }
});
</script>

<style scoped></style>
