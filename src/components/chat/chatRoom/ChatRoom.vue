<template>
  <div class="bg-gray-50 w-full h-dvh flex flex-col overflow-hidden">
    <!-- Header -->
    <div class="bg-white w-full py-3 shadow-sm border-b border-gray-200 shrink-0">
      <div class="flex gap-2 items-center cursor-pointer px-4" @click="showProfile = true">
        <Avatar :label="conversationLabel.substring(0, 2)" class="text-sm!" shape="circle" size="large" />
        <div dir="rtl">
          <p class="text-sm font-bold">{{ conversationLabel }}</p>
          <p v-if="isOnline" class="text-xs text-green-500">آنلاین</p>
        </div>
      </div>
    </div>

    <!-- Messages -->
    <MessagesList :messages="messages" :isLoading="isLoading" />

    <!-- Input -->
    <div class="w-full bg-white shadow-2xl p-3 flex items-start gap-2 border-t border-gray-200 shrink-0">
      <button
        @click="sendMsg"
        :disabled="!messageText.trim()"
        class="w-10 h-10 bg-primary-800 rounded-full flex justify-center items-center cursor-pointer shrink-0 disabled:opacity-50"
      >
        <IsIcon name="send" class="rotate-90" />
      </button>
      <div class="flex-1">
        <Textarea
          v-model="messageText"
          autoResize
          rows="1"
          class="w-full max-h-16 overflow-y-auto resize-none focus:ring-0"
          @keydown.enter.exact.prevent="sendMsg"
        />
      </div>
      <div class="w-10 h-10 flex justify-center items-center cursor-pointer shrink-0">
        <IsIcon name="attachment" class="size-6 text-zinc-500" />
      </div>
    </div>
  </div>

  <!-- Contact Profile Modal -->
  <AppModal v-model:visible="showProfile">
    <template #container>
      <div class="p-6" dir="rtl">
        <div class="flex justify-end mb-2">
          <button @click="showProfile = false" class="cursor-pointer size-7">
            <IsIcon name="close" class="text-gray-500" />
          </button>
        </div>
        <div class="w-full flex flex-col justify-center items-center gap-3">
          <Avatar :label="conversationLabel.substring(0, 2)" class="text-xl! bg-blue-100 text-blue-600" shape="circle" size="xlarge" />
          <div class="text-center">
            <p class="text-lg font-bold text-gray-900">{{ conversationLabel }}</p>
            <p v-if="otherUsername" class="text-sm text-gray-400">@{{ otherUsername }}</p>
          </div>
        </div>
      </div>
    </template>
  </AppModal>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useQueryClient } from '@tanstack/vue-query';
import { useMessages, useSendMessageRest } from '@/api/conversations';
import { useConversations } from '@/api/conversations';
import { useWebSocket } from '@/composables/useWebSocket';
import { useJwtService } from '@/composables/useJwtService';
import type { IMessage } from '@/types/message';

const route = useRoute();
const conversationId = computed(() => Number(route.params.id));

const { jwt } = useJwtService();
const myId = computed(() => Number(jwt.value?.userId ?? 0));

const { data: messagesPage, isLoading } = useMessages(conversationId);
const { data: conversations } = useConversations();
const { mutate: sendMessageRest } = useSendMessageRest(conversationId);
const { onMessage, offMessage, onStatus, offStatus, sendMessage: wsSend, isConnected } = useWebSocket();
const queryClient = useQueryClient();

const messageText = ref('');
const showProfile = ref(false);
const onlineUserIds = ref<number[]>([]);

const messages = computed<IMessage[]>(() => messagesPage.value?.results ?? []);

const currentConversation = computed(() =>
  conversations.value?.find((c) => c.id === conversationId.value)
);

const otherParticipant = computed(() => {
  const conv = currentConversation.value;
  if (!conv || conv.type !== 'private') return null;
  // cast both to Number to avoid type mismatch
  return conv.participants.find((p) => Number(p.id) !== myId.value) ?? null;
});

const conversationLabel = computed(() => {
  const conv = currentConversation.value;
  if (!conv) return '...';
  if (conv.type === 'group') return conv.group?.name ?? 'گروه';
  const other = otherParticipant.value;
  return other?.displayName || other?.username || 'کاربر';
});

const otherUsername = computed(() => otherParticipant.value?.username ?? null);

const isOnline = computed(() =>
  otherParticipant.value != null &&
  onlineUserIds.value.includes(Number(otherParticipant.value.id))
);

function addMessage(msg: IMessage) {
  queryClient.setQueryData(
    ['messages', conversationId.value],
    (old: { results: IMessage[]; nextCursor: string | null } | undefined) => {
      if (!old) return { results: [msg], nextCursor: null };
      const exists = old.results.some(
        (m) => m.id === msg.id ||
          (msg.clientMessageId && m.clientMessageId === msg.clientMessageId)
      );
      if (exists) return old;
      return { ...old, results: [...old.results, msg] };
    }
  );
}

function handleStatus({ userId, status }: { userId: number; status: string }) {
  if (status === 'online') {
    if (!onlineUserIds.value.includes(userId)) onlineUserIds.value = [...onlineUserIds.value, userId];
  } else {
    onlineUserIds.value = onlineUserIds.value.filter((id) => id !== userId);
  }
}

function sendMsg() {
  const text = messageText.value.trim();
  if (!text) return;
  messageText.value = '';

  if (isConnected.value) {
    // send via WebSocket — server will broadcast new_message back to us
    wsSend({ conversationId: conversationId.value, text });
  } else {
    // fallback: REST API, add to list manually
    sendMessageRest({ text }, { onSuccess: (msg) => addMessage(msg) });
  }
}

function registerWsHandlers(id: number) {
  onMessage(id, addMessage);
}

function unregisterWsHandlers(id: number) {
  offMessage(id, addMessage);
}

onMounted(() => {
  registerWsHandlers(conversationId.value);
  onStatus(handleStatus);
});

onUnmounted(() => {
  unregisterWsHandlers(conversationId.value);
  offStatus(handleStatus);
});

watch(conversationId, (newId, oldId) => {
  unregisterWsHandlers(oldId);
  registerWsHandlers(newId);
});
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
</style>
