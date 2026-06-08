<template>
  <div
    class="relative w-full h-screen flex flex-col border-l border-zinc-200 py-3 container mx-auto"
  >
    <div class="flex justify-between">
    <div></div>
    <IsIcon name="close" class="size-4"/>
    </div>
    <div
      class="h-14 border-b border-gray-200 flex items-center justify-around bg-white p-2 shrink-0"
    >
      <button @click="activeTab = 'all'" :class="tabClass('all')">همه</button>

      <button @click="activeTab = 'private'" :class="tabClass('private')">
        شخصی
      </button>

      <button @click="activeTab = 'group'" :class="tabClass('group')">
        گروه
      </button>
    </div>
    <div class="shrink-0 py-3">
      <AppInput
        v-model="search"
        type="text"
        name="userName"
        placeholder="جست و جو . . . . . ."
      >
        <template #icon>
          <IsIcon name="search" class="text-gray-400" />
        </template>
      </AppInput>
    </div>
    <div class="flex-1 overflow-y-auto">
      <ChatList />
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from "vue";
import type { TActiveTabChat } from "@/types/chat";

const activeTab = ref<TActiveTabChat>("all");
const search = ref<string>("");
const tabClass = (tab: string) => {
  return [
    "flex-1 h-full text-xs transition-colors rounded-xl",
    "flex items-center justify-center ",

    activeTab.value === tab
      ? "text-primary bg-primary-800 text-white"
      : "text-gray-500",
  ];
};
</script>
