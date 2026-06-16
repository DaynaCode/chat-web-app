<template>
  <div class="bg-gray-50 w-full h-full flex flex-col overflow-hidden">
    <!-- Header -->
    <div class="bg-white/95 backdrop-blur-sm w-full shrink-0 border-b border-gray-100 shadow-sm">
      <div class="flex items-center justify-between px-4 py-3">
        <div class="flex items-center gap-3 cursor-pointer flex-1 min-w-0" @click="showProfile = true">
          <div class="relative shrink-0">
            <div class="size-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-700 flex items-center justify-center text-white text-sm font-semibold select-none">
              {{ conversationLabel.substring(0, 2) }}
            </div>
            <span
              v-if="isOnline"
              class="absolute bottom-0 right-0 size-3 bg-green-400 rounded-full border-2 border-white"
            />
          </div>
          <div dir="rtl" class="min-w-0">
            <p class="text-sm font-bold text-gray-900 truncate">{{ conversationLabel }}</p>
            <p v-if="isOnline" class="text-xs text-green-500 font-medium">آنلاین</p>
            <p v-else-if="otherUsername" class="text-xs text-gray-400"><bdi>@{{ otherUsername }}</bdi></p>
          </div>
        </div>

        <div class="flex items-center gap-1 shrink-0">
          <button class="size-9 rounded-xl flex items-center justify-center text-gray-400 hover:text-primary-600 hover:bg-primary-50 transition-colors">
            <IsIcon name="search" class="size-4" />
          </button>
          <button class="size-9 rounded-xl flex items-center justify-center text-gray-400 hover:text-primary-600 hover:bg-primary-50 transition-colors">
            <IsIcon name="more" class="size-4" />
          </button>
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

    <!-- Image preview before send -->
    <div
      v-if="pendingImage"
      class="shrink-0 px-4 py-2 bg-white border-t border-gray-100 flex items-center gap-3"
      dir="rtl"
    >
      <div class="relative">
        <img :src="pendingImagePreview!" class="size-16 rounded-xl object-cover border border-gray-200" />
        <button
          @click="clearPendingImage"
          class="absolute -top-1.5 -right-1.5 size-5 bg-red-500 text-white rounded-full flex items-center justify-center shadow"
        >
          <IsIcon name="close" class="size-3" />
        </button>
      </div>
      <p class="text-xs text-gray-500">تصویر آماده ارسال</p>
    </div>

    <!-- Reply / Edit banner -->
    <div
      v-if="replyTarget || editTarget"
      class="w-full bg-primary-50 border-t border-primary-100 px-4 py-2 flex items-center justify-between gap-2 shrink-0"
      dir="rtl"
    >
      <div class="flex items-center gap-2 min-w-0">
        <div :class="['w-0.5 h-8 rounded-full shrink-0', editTarget ? 'bg-amber-400' : 'bg-primary-500']" />
        <div class="text-xs text-gray-600 truncate">
          <span :class="['font-semibold block', editTarget ? 'text-amber-600' : 'text-primary-600']">
            {{ editTarget ? 'ویرایش پیام' : `پاسخ به ${replyTarget?.sender.displayName || replyTarget?.sender.username}` }}
          </span>
          <p class="truncate text-gray-400 text-[11px]">{{ editTarget ? editTarget.text : replyTarget?.text }}</p>
        </div>
      </div>
      <button @click="cancelContext" class="shrink-0 size-6 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
        <IsIcon name="close" class="text-gray-400 size-3" />
      </button>
    </div>

    <!-- Input -->
    <div class="w-full bg-white border-t border-gray-100 shadow-lg p-3 flex items-end gap-2 shrink-0">
      <!-- File upload -->
      <label class="w-9 h-9 flex justify-center items-center cursor-pointer shrink-0 rounded-xl text-gray-400 hover:text-primary-600 hover:bg-primary-50 transition-colors">
        <IsIcon name="attachment" class="size-5" />
        <input type="file" accept="image/jpeg,image/png,image/webp" class="hidden" ref="fileInput" @change="onFileChange" />
      </label>

      <div class="flex-1">
        <Textarea
          v-model="messageText"
          autoResize
          rows="1"
          placeholder="پیام بنویسید..."
          class="w-full max-h-28 overflow-y-auto resize-none focus:ring-0 rounded-2xl! text-sm"
          dir="rtl"
          @keydown.enter.exact.prevent="sendMsg"
        />
      </div>

      <button
        @click="sendMsg"
        :disabled="!messageText.trim() && !pendingImage"
        class="w-9 h-9 bg-primary-700 hover:bg-primary-800 rounded-xl flex justify-center items-center cursor-pointer shrink-0 disabled:opacity-40 transition-colors shadow-sm"
      >
        <IsIcon name="send" class="rotate-90 size-4" />
      </button>
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
          <div class="relative">
            <div class="size-20 rounded-full bg-gradient-to-br from-primary-400 to-primary-700 flex items-center justify-center text-white text-2xl font-bold select-none">
              {{ conversationLabel.substring(0, 2) }}
            </div>
            <span
              v-if="isOnline"
              class="absolute bottom-1 right-1 size-3.5 bg-green-400 rounded-full border-2 border-white"
            />
          </div>
          <div class="text-center">
            <p class="text-lg font-bold text-gray-900">{{ conversationLabel }}</p>
            <p v-if="otherUsername" class="text-sm text-gray-400">@{{ otherUsername }}</p>
            <span v-if="isOnline" class="mt-1 inline-block text-xs text-green-500 bg-green-50 px-2 py-0.5 rounded-full">آنلاین</span>
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
import { useMessages, useSendMessageRest, useUploadImage } from '@/api/conversations';
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
const { mutate: uploadImage, isPending: isUploading } = useUploadImage();
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
const fileInput = ref<HTMLInputElement | null>(null);
const pendingImage = ref<File | null>(null);
const pendingImagePreview = ref<string | null>(null);

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
  conversations.value?.find((c) => Number(c.id) === conversationId.value)
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
    const optimisticIndex = msg.clientMessageId
      ? list.findIndex((m) => m.clientMessageId === msg.clientMessageId)
      : -1;
    if (optimisticIndex !== -1) {
      const updated = [...list];
      updated[optimisticIndex] = msg;
      return updated;
    }
    if (list.some((m) => m.id === msg.id)) return list;
    return [...list, msg];
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

function onFileChange(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;
  if (!file.type.startsWith('image/')) {
    toast.error('فقط فایل‌های تصویری مجاز هستند', { rtl: true });
    return;
  }
  if (file.size > 2 * 1024 * 1024) {
    toast.error('حجم تصویر نباید بیشتر از ۲ مگابایت باشد', { rtl: true });
    return;
  }
  pendingImage.value = file;
  pendingImagePreview.value = URL.createObjectURL(file);
}

function clearPendingImage() {
  pendingImage.value = null;
  pendingImagePreview.value = null;
  if (fileInput.value) fileInput.value.value = '';
}

function sendMsg() {
  const text = messageText.value.trim();
  if (!text && !pendingImage.value) return;

  if (editTarget.value) {
    const id = editTarget.value.id;
    const sent = wsEdit(id, text);
    if (sent) {
      cancelContext();
    } else {
      toast.error('اتصال WebSocket برقرار نیست', { rtl: true });
    }
    return;
  }

  const repliedToId = replyTarget.value?.id ?? null;
  replyTarget.value = null;
  messageText.value = '';

  if (pendingImage.value) {
    const imageFile = pendingImage.value;
    clearPendingImage();
    uploadImage(imageFile, {
      onSuccess: (uploaded) => {
        sendMessageRest(
          { ...(text ? { text } : {}), repliedToId, imageId: uploaded.id },
          { onSuccess: (msg) => addMessage(msg) }
        );
      },
      onError: () => toast.error('آپلود تصویر ناموفق بود', { rtl: true }),
    });
    return;
  }

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
