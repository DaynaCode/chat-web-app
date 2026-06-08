<template>
    <component :is="icon" v-if="icon" v-bind="$attrs" />
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import icons from './';
import type {SvgComponent} from './';


interface Props {
    name: string;
}

const props = defineProps<Props>();

const icon = computed<SvgComponent | undefined>(() => {
    return icons[props.name]
});
</script>
