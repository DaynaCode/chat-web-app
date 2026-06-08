<template>
    <Dialog
        :visible="visible"
        :dismissableMask="true"
        :blockScroll="true"
        :closable="true"
        :position="modalPosition"
        :style="dialogStyle"
        :breakpoints="DIALOG_BREAKPOINTS"
        modal
    >
        <template #container>
            <slot name="container"></slot>
        </template>
    </Dialog>
</template>

<script setup lang="ts">
import { DIALOG_BREAKPOINTS } from '@/variables/ui';
import type { StaticScreenContext } from '@/plugins/device';
import { inject,computed } from 'vue';
const device = inject<StaticScreenContext>('device')!;

const modalPosition = computed(() => (device.smDown ? 'bottom' : 'center'));

const visible = defineModel<boolean>('visible');

const dialogStyle = computed(() => ({
    width: device.smDown ? '100vw !important' : '564px !important',
    margin: device.smDown ? '0' : undefined,
    borderBottomLeftRadius: device.smDown ? '0' : '8px',
    borderBottomRightRadius: device.smDown ? '0' : '8px'
}));
</script>
