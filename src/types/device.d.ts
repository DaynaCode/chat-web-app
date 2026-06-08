import type { StaticScreenContext } from '@/plugins/device';

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $device: StaticScreenContext;
  }
}

export {};