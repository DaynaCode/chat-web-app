<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { toast } from 'vue3-toastify';
import { useJwtService } from '@/composables/useJwtService';
import { useWebSocket } from '@/composables/useWebSocket';

const { hasToken } = useJwtService();
const { connect, onMention, offMention } = useWebSocket();

function handleMention(data: { sender: string; text: string; conversationId: number }) {
  toast.info(`${data.sender} شما را منشن کرد: ${data.text}`, { rtl: true });
}

onMounted(() => {
  if (hasToken.value) {
    connect();
  }
  onMention(handleMention);
});

onUnmounted(() => {
  offMention(handleMention);
});
</script>

<template>
  <router-view />
</template>
