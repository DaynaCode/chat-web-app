<template>
  <div class="fixed inset-0 z-40 flex justify-center items-start pt-16 px-4" @click.self="$emit('close')">
    <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[70vh] flex flex-col overflow-hidden" dir="rtl">
      <!-- Header -->
      <div class="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div class="flex items-center gap-2">
          <IsIcon name="pin" class="size-4 text-primary-600" />
          <span class="text-sm font-bold text-gray-800">پیام‌های سنجاق‌شده</span>
          <span class="text-xs text-white bg-primary-600 rounded-full px-2 py-0.5">{{ pins.length }}</span>
        </div>
        <button @click="$emit('close')" class="size-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
          <IsIcon name="close" class="size-3.5 text-gray-500" />
        </button>
      </div>

      <!-- List -->
      <div class="flex-1 overflow-y-auto">
        <div v-if="isLoading" class="flex justify-center py-8">
          <span class="size-5 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
        </div>
        <div v-else-if="!pins.length" class="py-10 text-center text-sm text-gray-400">
          هیچ پیامی سنجاق نشده است
        </div>
        <div v-else class="divide-y divide-gray-50">
          <div
            v-for="pin in pins"
            :key="pin.id"
            class="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors group"
          >
            <div class="flex-1 min-w-0">
              <p class="text-xs font-semibold text-primary-600 mb-0.5">
                {{ pin.sender.displayName || pin.sender.username }}
              </p>
              <p v-if="pin.text" class="text-sm text-gray-700 line-clamp-2">{{ pin.text }}</p>
              <p v-else-if="pin.image" class="text-sm text-gray-400 flex items-center gap-1">
                <span>📷</span> تصویر
              </p>
              <p class="text-[11px] text-gray-400 mt-0.5">{{ formatTime(pin.createdAt) }}</p>
            </div>
            <button
              @click="$emit('unpin', pin.id)"
              class="shrink-0 size-7 rounded-full opacity-0 group-hover:opacity-100 bg-red-50 hover:bg-red-100 flex items-center justify-center transition-all"
              title="برداشتن پین"
            >
              <IsIcon name="close" class="size-3 text-red-500" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { IMessage } from '@/types/message';

defineProps<{
  pins: IMessage[];
  isLoading?: boolean;
}>();

defineEmits<{
  (e: 'close'): void;
  (e: 'unpin', messageId: number): void;
}>();

function formatTime(iso: string): string {
  return new Date(iso).toLocaleDateString('fa-IR', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}
</script>
