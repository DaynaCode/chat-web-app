<template>
  <RouterLink
    :to="{ name: 'ChatRoom', params: { id: conversation.id } }"
    class="group flex gap-2 justify-between items-center p-1.5 rounded-md cursor-pointer hover:bg-primary-500 hover:text-white text-t-secondary transition-all ease-in"
    active-class="bg-primary-600 text-white"
  >
    <div class="flex gap-2 items-center min-w-0">
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
        <p class="text-sm font-medium truncate">{{ displayName }}</p>
        <p v-if="conversation.lastMessage" class="text-xs text-gray-400 truncate group-hover:text-white group-[.router-link-active]:text-white">
          {{ conversation.lastMessage.text }}
        </p>
      </div>
    </div>
    <div class="shrink-0 text-[10px] text-gray-400 text-left group-hover:text-white group-[.router-link-active]:text-white">
      <span v-if="conversation.lastMessage">
        {{ formatTime(conversation.lastMessage.createdAt) }}
      </span>
    </div>
  </RouterLink>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useJwtService } from '@/composables/useJwtService';
import type { IConversation } from '@/types/conversation';

const props = defineProps<{
  conversation: IConversation;
  onlineUserIds?: number[];
}>();

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
