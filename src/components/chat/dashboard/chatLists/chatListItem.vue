<template>
  <div class="group relative flex gap-2 items-center p-1.5 rounded-md transition-all ease-in"
    :class="isFavorite ? 'bg-amber-50 hover:bg-amber-100' : 'hover:bg-primary-500 hover:text-white text-t-secondary'"
  >
    <RouterLink
      :to="{ name: 'ChatRoom', params: { id: conversation.id } }"
      class="flex gap-2 items-center min-w-0 flex-1"
      active-class=""
    >
      <OverlayBadge :severity="isOnline ? 'success' : 'secondary'" size="small">
        <Avatar
          :label="avatarLabel"
          :image="avatarImage ?? undefined"
          size="large"
          shape="square"
          class="text-sm! flex! justify-center! items-center! bg-primary-100! text-t-secondary! shrink-0"
        />
      </OverlayBadge>
      <div class="min-w-0 flex-1" dir="rtl">
        <div class="flex items-center gap-1">
          <p class="text-sm font-medium truncate">{{ displayName }}</p>
          <span v-if="isFavorite" class="text-amber-400 text-xs">★</span>
        </div>
        <p v-if="conversation.lastMessage" class="text-xs text-gray-400 truncate group-hover:text-white"
          :class="isFavorite ? 'group-hover:text-amber-700!' : ''">
          {{ conversation.lastMessage.text }}
        </p>
      </div>
    </RouterLink>

    <div class="flex items-center gap-1 shrink-0">
      <span v-if="conversation.lastMessage" class="text-[10px] text-gray-400 group-hover:text-white"
        :class="isFavorite ? 'group-hover:text-amber-700!' : ''">
        {{ formatTime(conversation.lastMessage.createdAt) }}
      </span>
      <button
        @click.prevent="toggleFavorite"
        :title="isFavorite ? 'حذف از علاقه‌مندی‌ها' : 'افزودن به علاقه‌مندی‌ها'"
        class="size-6 rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
        :class="isFavorite ? 'opacity-100! text-amber-400 hover:text-amber-500' : 'text-gray-300 hover:text-amber-400'"
      >
        {{ isFavorite ? '★' : '☆' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useJwtService } from '@/composables/useJwtService';
import type { IConversation } from '@/types/conversation';

const props = defineProps<{
  conversation: IConversation;
  onlineUserIds?: number[];
  isFavorite?: boolean;
}>();

const emit = defineEmits<{
  (e: 'toggleFavorite', id: number): void;
}>();

function toggleFavorite() {
  emit('toggleFavorite', props.conversation.id);
}

const { jwt } = useJwtService();
const myId = computed(() => Number(jwt.value?.userId ?? 0));

const otherParticipant = computed(() => {
  if (props.conversation.type === 'private') {
    return props.conversation.participants.find((p) => Number(p.id) !== myId.value) ?? null;
  }
  return null;
});

const displayName = computed(() => {
  if (props.conversation.type === 'group') {
    return props.conversation.group?.name ?? 'گروه';
  }
  return otherParticipant.value?.displayName || otherParticipant.value?.username || 'کاربر';
});

const avatarLabel = computed(() => {
  const name = displayName.value;
  return name.substring(0, 2);
});

const avatarImage = computed<string | null>(() => null);

const isOnline = computed(() => {
  if (!props.onlineUserIds) return false;
  if (props.conversation.type === 'private' && otherParticipant.value) {
    return props.onlineUserIds.includes(otherParticipant.value.id);
  }
  return false;
});

function formatTime(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });
}
</script>
