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
        {{ message }}
      </div>
    
        <Button type="button"  aria-haspopup="true" aria-controls="overlay_tmenu" class="bg-transparent! border-0!" @click="toggle">
             <IsIcon name="more"/>
        </Button>
      </div>
      <span 
        :class="[
          'text-[10px] mt-1 text-gray-400', 
          isMe ? 'mr-1' : 'ml-1'
        ]"
      >
        {{ time }}
      </span>
    </div>
  </div>
<TieredMenu ref="menu" :model="items" popup>
  <template #item="{ item, props }">
    <a v-bind="props.action" class="flex items-center p-2 hover:bg-primary-50 hover:text-primary-700!">
       <IsIcon :name="item.icon" class=" text-primary-900! size-5" />
       <span class="text-sm ">{{ item.label }}</span>
    </a>
  </template>
</TieredMenu>

</template>

<script setup lang="ts">
defineProps<{
  message: string;  
  time: string;    
  isMe: boolean;    
}>();
import { ref } from "vue";

const menu = ref();
const items = ref([
    {
        label: 'ویرایش',
        icon: 'pen',

    },
        {
        label: 'حذف',
        icon: 'trash',

    },
        {
        label: 'پاسخ',
        icon: 'undo',

    },
]);

const toggle = (event) => {
    menu.value.toggle(event);
};
</script>
