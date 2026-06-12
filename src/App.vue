<script setup lang="ts">
import { onMounted } from 'vue';
import { useJwtService } from '@/composables/useJwtService';
import { useWebSocket } from '@/composables/useWebSocket';

const { hasToken } = useJwtService();
const { connect } = useWebSocket();

onMounted(() => {
  if (hasToken.value) {
    connect();
  }
});
</script>

<template>
  <router-view />
</template>
