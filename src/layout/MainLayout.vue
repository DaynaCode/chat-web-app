<template>
  <div class="flex h-screen overflow-hidden">
    <div
      v-if="showSidebar"
      class="w-full md:w-87.5 border-r border-outline-variant"
    >
      <Dashboard />
    </div>
    <div
      v-if="showChat"
      class="w-full"
    >
      <router-view />
    </div>

  </div>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue';
import { useRoute } from 'vue-router';

import Dashboard from '@/components/chat/dashboard/Dashboard.vue';

import type { StaticScreenContext } from '@/plugins/device';

const route = useRoute();

const device = inject<StaticScreenContext>('device');

const hasChatOpen = computed(() => {
  return !!route.params.id;
});

const showSidebar = computed(() => {

  if (device?.mdUp) return true;


  return !hasChatOpen.value;
});

const showChat = computed(() => {
  if (device?.mdUp) return true;
  return hasChatOpen.value;
});
</script>