<template>
  <RouterLink :to="{ name: 'ChatRoom', params: { id: 2 } }"
    class="flex gap-2 justify-between items-center p-1.5 rounded-md cursor-pointer hover:bg-primary-500 hover:text-white text-t-secondary transition-all ease-in"
    active-class="bg-primary-600 text-white"
  >
    <div class="flex gap-2 items-center">
        <OverlayBadge  severity="success" size="small">
      <Avatar
        label="م م"
        size="large"
        shape="square"
        class="text-sm! flex! justify-center! items-center! bg-primary-100! text-t-secondary!"
      />
    </OverlayBadge>
    <p class="text-sm font-medium">محمدرضا مرادزاده</p>
    </div>
    <div>
        <IsIcon name="pin" class="size-5"/>
    </div>
  </RouterLink>
</template>
<script setup lang="ts"></script>
