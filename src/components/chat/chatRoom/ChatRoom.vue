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
    <MessagesList
      :messages="messages"
      :isLoading="isLoading"
      @delete="handleDelete"
      @edit="handleEditRequest"
      @reply="handleReplyRequest"
    />

    <!-- Reply / Edit banner -->
    <div
      v-if="replyTarget || editTarget"
      class="w-full bg-primary-50 border-t border-primary-200 px-4 py-2 flex items-center justify-between gap-2 shrink-0"
      dir="rtl"
    >
      <div class="flex items-center gap-2 min-w-0">
        <IsIcon :name="editTarget ? 'pen' : 'undo'" class="size-4 text-primary-600 shrink-0" />
        <div class="text-xs text-gray-600 truncate">
          <span class="font-semibold text-primary-700">{{ editTarget ? 'ویرایش پیام' : `پاسخ به ${replyTarget?.sender.username}` }}</span>
          <p class="truncate text-gray-500">{{ editTarget ? editTarget.text : replyTarget?.text }}</p>
        </div>
      </div>
      <button @click="cancelContext" class="shrink-0 size-5">
        <IsIcon name="close" class="text-gray-400 size-4" />
      </button>
    </div>

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
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { useRoute } from 'vue-router';
import { useQueryClient } from '@tanstack/vue-query';
import { toast } from 'vue3-toastify';
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
const {
  onMessage, offMessage,
  onMessageEdited, offMessageEdited,
  onMessageDeleted, offMessageDeleted,
  onStatus, offStatus,
  onError, offError,
  sendMessage: wsSend,
  editMessage: wsEdit,
  deleteMessage: wsDelete,
  isConnected,
} = useWebSocket();
const queryClient = useQueryClient();

const messageText = ref('');
const showProfile = ref(false);
const onlineUserIds = ref<number[]>([]);
const replyTarget = ref<IMessage | null>(null);
const editTarget = ref<IMessage | null>(null);

const messages = computed<IMessage[]>(() => {
  const data = messagesPage.value;
  let list: IMessage[] = [];
  if (!data) return list;
  list = Array.isArray(data) ? data : ((data as any).results ?? []);
  return [...list].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
});

const currentConversation = computed(() =>
  conversations.value?.find((c) => c.id === conversationId.value)
);

const otherParticipant = computed(() => {
  const conv = currentConversation.value;
  if (!conv || conv.type !== 'private') return null;
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

function updateCache(updater: (old: IMessage[]) => IMessage[]) {
  queryClient.setQueryData(
    ['messages', conversationId.value],
    (old: IMessage[] | undefined) => updater(Array.isArray(old) ? old : (old as any)?.results ?? [])
  );
}

function addMessage(msg: IMessage) {
  updateCache((list) => {
    const exists = list.some(
      (m) => m.id === msg.id || (msg.clientMessageId && m.clientMessageId === msg.clientMessageId)
    );
    return exists ? list : [...list, msg];
  });
}

function handleWsEdited({ id, text, editedAt }: { id: number; conversationId: number; text: string; editedAt: string }) {
  updateCache((list) =>
    list.map((m) => m.id === id ? { ...m, text, editedAt } : m)
  );
}

function handleWsDeleted({ messageId }: { messageId: number; conversationId: number }) {
  updateCache((list) => list.filter((m) => m.id !== messageId));
}

function handleDelete(id: number) {
  const sent = wsDelete(id);
  if (!sent) toast.error('اتصال WebSocket برقرار نیست', { rtl: true });
}

function handleEditRequest(id: number) {
  const msg = messages.value.find((m) => m.id === id);
  if (!msg) return;
  editTarget.value = msg;
  replyTarget.value = null;
  messageText.value = msg.text ?? '';
  nextTick(() => document.querySelector<HTMLTextAreaElement>('textarea')?.focus());
}

function handleReplyRequest(msg: IMessage) {
  replyTarget.value = msg;
  editTarget.value = null;
  nextTick(() => document.querySelector<HTMLTextAreaElement>('textarea')?.focus());
}

function cancelContext() {
  replyTarget.value = null;
  editTarget.value = null;
  messageText.value = '';
}

function handleWsError(detail: string) {
  toast.error(detail, { rtl: true });
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

  if (editTarget.value) {
    const id = editTarget.value.id;
    const sent = wsEdit(id, text);
    if (!sent) toast.error('اتصال WebSocket برقرار نیست', { rtl: true });
    cancelContext();
    return;
  }

  messageText.value = '';
  const repliedToId = replyTarget.value?.id ?? null;
  replyTarget.value = null;

  if (isConnected.value) {
    const clientMessageId = wsSend({ conversationId: conversationId.value, text, repliedToId });
    if (clientMessageId) {
      addMessage({
        id: -Date.now(),
        conversation: conversationId.value,
        sender: { id: myId.value, username: '' },
        text,
        image: null,
        createdAt: new Date().toISOString(),
        editedAt: null,
        isDeleted: false,
        repliedTo: null,
        clientMessageId,
      });
    }
  } else {
    sendMessageRest({ text, repliedToId }, { onSuccess: (msg) => addMessage(msg) });
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
  onError(handleWsError);
  onMessageEdited(handleWsEdited);
  onMessageDeleted(handleWsDeleted);
});

onUnmounted(() => {
  unregisterWsHandlers(conversationId.value);
  offStatus(handleStatus);
  offError(handleWsError);
  offMessageEdited(handleWsEdited);
  offMessageDeleted(handleWsDeleted);
});

watch(conversationId, (newId, oldId) => {
  unregisterWsHandlers(oldId);
  registerWsHandlers(newId);
  cancelContext();
});
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
</style>
