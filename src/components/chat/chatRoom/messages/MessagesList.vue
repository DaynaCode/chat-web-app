<template>
  <div ref="listEl" class="flex-1 overflow-y-auto p-4 space-y-1 bg-gray-100 no-scrollbar">
    <div v-if="isLoading" class="flex justify-center py-8">
      <span class="size-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
    </div>
    <template v-else-if="messages.length">
      <MessageInfo
        v-for="msg in messages"
        :key="msg.id"
        :message="msg.text ?? ''"
        :time="formatTime(msg.createdAt)"
        :isMe="Number(msg.sender.id) === myId"
        :senderId="msg.sender.id"
      />
    </template>
    <div v-else class="flex justify-center py-8 text-sm text-gray-400" dir="rtl">
      هنوز پیامی ارسال نشده است
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch, nextTick, ref } from 'vue';
import { useJwtService } from '@/composables/useJwtService';
import type { IMessage } from '@/types/message';

const props = defineProps<{
  messages: IMessage[];
  isLoading?: boolean;
}>();

const { jwt } = useJwtService();
const myId = computed(() => Number(jwt.value?.userId ?? 0));
const listEl = ref<HTMLElement | null>(null);

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });
}

function scrollToBottom() {
  nextTick(() => {
    if (listEl.value) {
      listEl.value.scrollTop = listEl.value.scrollHeight;
    }
  });
}

watch(() => props.messages.length, scrollToBottom, { immediate: true });
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
</style>
