import type { App } from 'vue';
import {
    VueQueryPlugin,
    QueryClient,
    type VueQueryPluginOptions
} from '@tanstack/vue-query';

// Create the query client with default options
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        refetchOnMount: false,
        retry: false,
    },
  },
});

const appQueryOptions: VueQueryPluginOptions = {
    queryClient,
};

export default {
    install(app: App) {
        app.use(VueQueryPlugin, appQueryOptions);
    }
};