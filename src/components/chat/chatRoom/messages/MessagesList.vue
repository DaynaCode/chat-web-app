<template>
  <div ref="listEl" class="flex-1 overflow-y-auto p-4 space-y-1 no-scrollbar chat-bg">
    <div v-if="isLoading" class="flex justify-center py-8">
      <span class="size-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
    </div>
    <template v-else-if="groupedMessages.length">
      <template v-for="group in groupedMessages" :key="group.date">
        <!-- Date Separator -->
        <div class="flex items-center gap-3 my-4">
          <div class="flex-1 h-px bg-gray-200/70" />
          <span class="text-[11px] text-gray-400 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm border border-gray-100">
            {{ group.label }}
          </span>
          <div class="flex-1 h-px bg-gray-200/70" />
        </div>

        <MessageInfo
          v-for="msg in group.messages"
          :key="msg.id"
          :message="msg.text ?? ''"
          :time="formatTime(msg.createdAt)"
          :isMe="Number(msg.sender.id) === myId"
          :messageId="msg.id"
          :isEdited="!!msg.editedAt"
          :isPinned="pinnedIds.has(msg.id)"
          :repliedTo="msg.repliedTo ?? null"
          :imageUrl="msg.image"
          :imageOriginalUrl="msg.imageOriginalUrl"
          @delete="$emit('delete', $event)"
          @edit="$emit('edit', $event)"
          @reply="$emit('reply', msg)"
          @pin="$emit('pin', $event)"
          @unpin="$emit('unpin', $event)"
        />
      </template>
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
  pinnedIds?: Set<number>;
}>();

defineEmits<{
  (e: 'delete', id: number): void;
  (e: 'edit', id: number): void;
  (e: 'reply', msg: IMessage): void;
  (e: 'pin', id: number): void;
  (e: 'unpin', id: number): void;
}>();

const pinnedIds = computed(() => props.pinnedIds ?? new Set<number>());

const { jwt } = useJwtService();
const myId = computed(() => Number(jwt.value?.userId ?? 0));
const listEl = ref<HTMLElement | null>(null);

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });
}

function formatDateLabel(iso: string): string {
  const date = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  if (isSameDay(date, today)) return 'امروز';
  if (isSameDay(date, yesterday)) return 'دیروز';
  return date.toLocaleDateString('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' });
}

function getDateKey(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

const groupedMessages = computed(() => {
  const groups: { date: string; label: string; messages: IMessage[] }[] = [];
  for (const msg of props.messages) {
    const key = getDateKey(msg.createdAt);
    const last = groups[groups.length - 1];
    if (last && last.date === key) {
      last.messages.push(msg);
    } else {
      groups.push({ date: key, label: formatDateLabel(msg.createdAt), messages: [msg] });
    }
  }
  return groups;
});

function scrollToBottom() {
  nextTick(() => {
    if (listEl.value) {
      listEl.value.scrollTop = listEl.value.scrollHeight;
    }
  });
}

watch(
  () => props.messages.at(-1)?.id,
  (newId, oldId) => { if (newId !== oldId) scrollToBottom(); },
  { immediate: true }
);
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

.chat-bg {
  background-color: #f0f4f8;
  background-image:
    radial-gradient(ellipse at 20% 20%, rgba(99, 102, 241, 0.06) 0%, transparent 60%),
    radial-gradient(ellipse at 80% 80%, rgba(139, 92, 246, 0.05) 0%, transparent 60%),
    radial-gradient(ellipse at 50% 50%, rgba(59, 130, 246, 0.04) 0%, transparent 70%);
}
</style>
