<template>
  <div class="flex flex-col gap-0.5 py-4">
    <div v-if="isLoading" class="flex justify-center py-8">
      <span class="size-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
    </div>
    <template v-else-if="filteredConversations.length">
      <ChatListItem
        v-for="conv in filteredConversations"
        :key="conv.id"
        :conversation="conv"
        :onlineUserIds="onlineUserIds"
      />
    </template>
    <div v-else class="flex flex-col items-center gap-2 py-8 text-gray-400 text-sm" dir="rtl">
      <IsIcon name="empty-page" class="size-12 opacity-40" />
      <p>{{ search ? 'نتیجه‌ای یافت نشد' : 'هیچ مکالمه‌ای وجود ندارد' }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useConversations } from '@/api/conversations';
import { useWebSocket } from '@/composables/useWebSocket';

const props = defineProps<{
  search?: string;
  activeTab?: string;
}>();

const { data: conversations, isLoading } = useConversations();
const { onStatus, offStatus } = useWebSocket();
const onlineUserIds = ref<number[]>([]);

const filteredConversations = computed(() => {
  let list = conversations.value ?? [];

  if (props.activeTab && props.activeTab !== 'all') {
    list = list.filter((c) => c.type === props.activeTab);
  }

  if (props.search?.trim()) {
    const q = props.search.trim().toLowerCase();
    list = list.filter((c) => {
      if (c.type === 'group') {
        return c.group?.name?.toLowerCase().includes(q);
      }
      return c.participants.some(
        (p) =>
          p.displayName?.toLowerCase().includes(q) ||
          p.username.toLowerCase().includes(q)
      );
    });
  }

  return list;
});

function handleStatus({ userId, status }: { userId: number; status: string }) {
  if (status === 'online') {
    if (!onlineUserIds.value.includes(userId)) {
      onlineUserIds.value = [...onlineUserIds.value, userId];
    }
  } else {
    onlineUserIds.value = onlineUserIds.value.filter((id) => id !== userId);
  }
}

onMounted(() => onStatus(handleStatus));
onUnmounted(() => offStatus(handleStatus));
</script>
