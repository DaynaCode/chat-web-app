import { reactive } from 'vue';
import type { App } from 'vue';
import { breakpoints } from '@/plugins/theme/dlsconfig';

export interface StaticScreenContext {
    width: number;
    xsUp: boolean;
    xsDown: boolean;
    smUp: boolean;
    smDown: boolean;
    mdUp: boolean;
    mdDown: boolean;
    lgUp: boolean;
    lgDown: boolean;
}

function getContext(width: number): StaticScreenContext {
    return {
        width,
        xsUp: width > breakpoints.xs,
        xsDown: width <= breakpoints.xs,
        smUp: width > breakpoints.sm,
        smDown: width <= breakpoints.sm,
        mdUp: width > breakpoints.md,
        mdDown: width <= breakpoints.md,
        lgUp: width > breakpoints.lg,
        lgDown: width <= breakpoints.lg
    };
}

export default {
    install(app: App) {
        const initialWidth =
            typeof window !== 'undefined' ? window.innerWidth : breakpoints.lg;
        const device = reactive(getContext(initialWidth));

        if (typeof window !== 'undefined') {
            window.addEventListener('resize', () => {
                const newWidth = window.innerWidth;
                const updated = getContext(newWidth);
                Object.assign(device, updated);
            });
        }

        app.provide<StaticScreenContext>('device', device);
        app.config.globalProperties.$device = device;
    }
};
