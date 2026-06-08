<template>
  <div class="bg-gray-50 w-full h-dvh flex flex-col overflow-hidden">
    <div class="bg-white w-full py-3 shadow-sm border-b border-gray-200 shrink-0">
      <div
        class="flex gap-2 items-center cursor-pointer px-4"
        @click="showProfile = true"
      >
        <Avatar label="م م" class="text-sm!" shape="circle" size="large" />
        <p class="text-sm font-bold">محمدرضا مرادی</p>
      </div>
    </div>
    <MessagesList/>
    <div class="w-full bg-white shadow-2xl p-3 flex items-start gap-2 border-t border-gray-200 shrink-0">
      <div class="w-10 h-10 bg-primary-800 rounded-full flex justify-center items-center cursor-pointer shrink-0">
        <IsIcon name="send" class="rotate-90"/>
      </div>
      <div class="flex-1">
        <Textarea 
          v-model="userName" 
          autoResize 
          rows="1" 
          class="w-full max-h-16 overflow-y-auto resize-none focus:ring-0"
        />
      </div>
      <div class="w-10 h-10 flex justify-center items-center cursor-pointer shrink-0">
        <IsIcon name="attachment" class="size-6 text-zinc-500"/>
      </div>
    </div>

  </div>
 <AppModal v-model:visible="showProfile">
    <template #container>
      <div class="p-6">
        <div class="flex justify-end mb-2">
          <button
            @click="showProfile = false"
            class="cursor-pointer size-7"
          >
            <IsIcon name="close" class="text-gray-500" />
          </button>
        </div>
        <div class="w-full flex flex-col justify-center items-center gap-3">
          <Avatar
            label="م م"
            class="text-xl! bg-blue-100 text-blue-600"
            shape="circle"
            size="xlarge"
          />
          <div class="text-center flex flex-col gap-2">
            <p class="text-lg font-bold text-gray-900">محمدرضا مرادی</p>
            <p class="text-xs text-gray-400">@m_moradi</p>
          </div>
        </div>
        <Divider />
        <div class="flex flex-col gap-4 py-2">
          <div class="flex items-center gap-3 text-sm">
            <IsIcon name="phone" />
            <span class="font-semibold! text-gray-700">تلفن ضروری :</span>
            <span class="text-gray-600">۰۹۱۲۳۴۵۶۷۸۹</span>
          </div>
          <div class="flex items-center gap-3 text-sm">
            <IsIcon name="envelope" class="text-gray-400" />
            <span class="font-semibold! text-gray-700">ایمیل :</span>
            <span class="text-gray-600">example@email.com</span>
          </div>
          <div class="text-sm text-gray-600 leading-6">
            <p class="font-semibold mb-1">درباره من:</p>
            اینجا فضایی است که کاربر می‌تواند بیوگرافی یا وضعیت فعلی خود را
            بنویسد.
          </div>
        </div>
      </div>
    </template>
  </AppModal>
</template>


<script setup lang="ts">
import { ref } from 'vue';
const showProfile = ref<boolean>(false);
const userName = ref('');
</script>
<style scoped>

.no-scrollbar::-webkit-scrollbar {
  display: none;
}


.no-scrollbar {
  -ms-overflow-style: none;  
  scrollbar-width: none;  
}
</style>
