<template>
  <div :class="['flex w-full mb-1', isMe ? 'justify-start' : 'justify-end']">
    <div :class="['flex flex-col max-w-[75%]', isMe ? 'items-end' : 'items-start']">
      <div :class="['flex items-end gap-1', isMe ? '' : 'flex-row-reverse']">

        <!-- Message bubble -->
        <div
          :class="[
            'relative px-3 pt-2 pb-2 rounded-2xl text-sm font-normal shadow-sm min-w-[60px]',
            isMe
              ? 'bg-primary-800 text-white rounded-br-sm'
              : 'bg-white text-gray-800 rounded-bl-sm'
          ]"
        >
          <!-- Reply preview (Telegram style) -->
          <div
            v-if="repliedTo"
            :class="[
              'mb-2 px-2.5 py-1.5 rounded-xl border-r-[3px] text-xs cursor-pointer',
              isMe
                ? 'border-white/70 bg-white/15 text-white/90'
                : 'border-primary-500 bg-primary-50 text-gray-600'
            ]"
            dir="rtl"
          >
            <p :class="['font-semibold text-[11px] mb-0.5', isMe ? 'text-white/70' : 'text-primary-600']">
              {{ repliedTo.sender.displayName || repliedTo.sender.username }}
            </p>
            <p class="truncate opacity-80">{{ repliedTo.text || (repliedTo.image ? '📷 تصویر' : '') }}</p>
          </div>

          <!-- Image -->
          <div v-if="imageUrl" class="mb-1">
            <img
              :src="imageUrl"
              alt="تصویر"
              class="rounded-xl max-w-full max-h-60 object-cover cursor-pointer"
              @click="openImage"
            />
          </div>

          <!-- Text -->
          <p v-if="message" dir="rtl" class="leading-relaxed whitespace-pre-wrap">{{ message }}</p>

          <!-- Time + edited -->
          <div :class="['flex items-center gap-1 mt-1', isMe ? 'justify-start' : 'justify-end']">
            <span v-if="isEdited" :class="['text-[10px] italic', isMe ? 'text-white/50' : 'text-gray-400']">ویرایش شده</span>
            <span :class="['text-[10px]', isMe ? 'text-white/60' : 'text-gray-400']">{{ time }}</span>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex flex-col gap-1 mb-1">
          <Button
            v-if="isMe"
            type="button"
            aria-haspopup="true"
            class="bg-white/80! border-0! shadow-sm! size-7! p-0! rounded-full!"
            @click="toggle"
          >
            <IsIcon name="more" class="size-3.5 text-gray-500" />
          </Button>
          <button
            v-else
            class="bg-white/80 hover:bg-white shadow-sm size-7 p-0 rounded-full flex items-center justify-center transition-colors"
            @click="$emit('reply')"
          >
            <IsIcon name="undo" class="size-3.5 text-gray-500" />
          </button>
        </div>
      </div>
    </div>
  </div>

  <TieredMenu ref="menu" :model="items" popup>
    <template #item="{ item, props }">
      <a
        v-bind="props.action"
        class="flex items-center gap-2 p-2 hover:bg-primary-50 hover:text-primary-700!"
        @click="item.command"
      >
        <IsIcon :name="item.icon" class="text-primary-900! size-4" />
        <span class="text-sm">{{ item.label }}</span>
      </a>
    </template>
  </TieredMenu>

  <!-- Image lightbox -->
  <div
    v-if="lightboxOpen"
    class="fixed inset-0 z-50 bg-black/80 flex items-center justify-center"
    @click="lightboxOpen = false"
  >
    <img :src="imageOriginalUrl ?? imageUrl ?? ''" class="max-w-[90vw] max-h-[90vh] rounded-xl object-contain" />
  </div>
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
  imageUrl?: string | null;
  imageOriginalUrl?: string | null;
}>();

const emit = defineEmits<{
  (e: 'delete', id: number): void;
  (e: 'edit', id: number): void;
  (e: 'reply'): void;
}>();

const menu = ref();
const lightboxOpen = ref(false);

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

function openImage() {
  if (props.imageUrl) lightboxOpen.value = true;
}
</script>
