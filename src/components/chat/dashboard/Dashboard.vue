<template>
  <div
    class="relative w-full h-screen flex flex-col border-l border-zinc-200 py-3 container mx-auto"
  >
    <!-- Top Bar: Avatar + Logout -->
    <div class="flex items-center justify-between px-2 pb-3">
      <button
        @click="showProfile = true"
        class="flex items-center gap-2 group"
        title="پروفایل کاربری"
      >
        <div class="size-9 rounded-full overflow-hidden bg-gray-100 border border-gray-200 flex items-center justify-center flex-shrink-0">
          <img
            v-if="profile?.avatar"
            :src="profile.avatar"
            alt="avatar"
            class="w-full h-full object-cover"
          />
          <IsIcon v-else name="user" class="size-5 text-gray-400" />
        </div>
        <div class="text-right leading-tight" dir="rtl">
          <p class="text-xs font-semibold text-gray-800 group-hover:text-primary-600 transition-colors">
            {{ profile?.displayName || profile?.username || 'کاربر' }}
          </p>
          <p class="text-[10px] text-gray-400 font-mono" dir="ltr">#{{ userId }}</p>
        </div>
      </button>

      <button
        @click="handleLogout"
        :disabled="isLogoutPending"
        class="size-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
        title="خروج از حساب"
      >
        <span v-if="isLogoutPending" class="size-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
        <IsIcon v-else name="logout" class="size-4" />
      </button>
    </div>

    <!-- Tabs -->
    <div
      class="h-14 border-b border-gray-200 flex items-center justify-around bg-white p-2 shrink-0"
    >
      <button @click="activeTab = 'all'" :class="tabClass('all')">همه</button>
      <button @click="activeTab = 'private'" :class="tabClass('private')">شخصی</button>
      <button @click="activeTab = 'group'" :class="tabClass('group')">گروه</button>
    </div>

    <!-- Search -->
    <div class="shrink-0 py-3">
      <AppInput
        v-model="search"
        type="text"
        name="search"
        placeholder="جست و جو . . . . . ."
      >
        <template #icon>
          <IsIcon name="search" class="text-gray-400" />
        </template>
      </AppInput>
    </div>

    <!-- Chat List -->
    <div class="flex-1 overflow-y-auto">
      <ChatList :search="search" :activeTab="activeTab" />
    </div>
  </div>

  <!-- Profile Modal -->
  <UserProfileModal
    v-model:visible="showProfile"
    :profile="profile"
  />
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import type { TActiveTabChat } from '@/types/chat';
import { useJwtService } from '@/composables/useJwtService';
import { useUserProfile } from '@/api/user';
import { useLogout } from '@/api/auth';
import { useWebSocket } from '@/composables/useWebSocket';

const router = useRouter();
const { jwt } = useJwtService();
const { data: profile } = useUserProfile();
const { mutate: logout, isPending: isLogoutPending } = useLogout();
const { disconnect } = useWebSocket();

const userId = computed(() => jwt.value?.userId ?? 0);
const activeTab = ref<TActiveTabChat>('all');
const search = ref<string>('');
const showProfile = ref(false);

const tabClass = (tab: string) => [
  'flex-1 h-full text-xs transition-colors rounded-xl',
  'flex items-center justify-center',
  activeTab.value === tab ? 'text-primary bg-primary-800 text-white' : 'text-gray-500',
];

function handleLogout() {
  logout(undefined, {
    onSettled: () => {
      disconnect();
      router.push({ name: 'Login' });
    },
  });
}
</script>
