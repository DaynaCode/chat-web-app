<template>
  <div :class="['flex w-full mb-2', isMe ? 'justify-start' : 'justify-end']">
    <div :class="['flex flex-col max-w-[75%]', isMe ? 'items-end' : 'items-start']">
      <div :class="['flex items-start', isMe ? '' : 'flex-row-reverse']">
        <div
          :class="[
            'p-3 rounded-2xl text-sm font-normal shadow-sm',
            isMe
              ? 'bg-primary-800 text-white rounded-tr-none'
              : 'bg-white text-gray-800 rounded-tl-none'
          ]"
        >
          <!-- replied-to preview -->
          <div
            v-if="repliedTo"
            :class="[
              'mb-2 px-2 py-1 rounded-lg border-r-2 text-xs opacity-80 cursor-pointer',
              isMe ? 'border-white/60 bg-white/10 text-white' : 'border-primary-400 bg-gray-100 text-gray-600'
            ]"
            dir="rtl"
          >
            <span class="font-medium">{{ repliedTo.sender.username }}</span>
            <p class="truncate">{{ repliedTo.text }}</p>
          </div>
          {{ message }}
        </div>

        <Button
          v-if="isMe"
          type="button"
          aria-haspopup="true"
          class="bg-transparent! border-0!"
          @click="toggle"
        >
          <IsIcon name="more" />
        </Button>
        <Button
          v-else
          type="button"
          class="bg-transparent! border-0!"
          @click="$emit('reply')"
        >
          <IsIcon name="undo" />
        </Button>
      </div>
      <span
        :class="['text-[10px] mt-1 text-gray-400', isMe ? 'mr-1' : 'ml-1']"
      >
        {{ time }}
        <span v-if="isEdited" class="italic"> (ویرایش شده)</span>
      </span>
    </div>
  </div>

  <TieredMenu ref="menu" :model="items" popup>
    <template #item="{ item, props }">
      <a
        v-bind="props.action"
        class="flex items-center p-2 hover:bg-primary-50 hover:text-primary-700!"
        @click="item.command"
      >
        <IsIcon :name="item.icon" class="text-primary-900! size-5" />
        <span class="text-sm">{{ item.label }}</span>
      </a>
    </template>
  </TieredMenu>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { IMessage } from '@/types/message';

const props = defineProps<{
  message: string;
  time: string;
  isMe: boolean;
  messageId: number;
  isEdited?: boolean;
  repliedTo?: IMessage | null;
}>();

const emit = defineEmits<{
  (e: 'delete', id: number): void;
  (e: 'edit', id: number): void;
  (e: 'reply'): void;
}>();

const menu = ref();

const items = computed(() => [
  {
    label: 'پاسخ',
    icon: 'undo',
    command: () => emit('reply'),
  },
  {
    label: 'ویرایش',
    icon: 'pen',
    command: () => emit('edit', props.messageId),
  },
  {
    label: 'حذف',
    icon: 'trash',
    command: () => emit('delete', props.messageId),
  },
]);

const toggle = (event: Event) => {
  menu.value.toggle(event);
};
</script>
