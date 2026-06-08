import { createApp } from 'vue'
import './assets/styles/style.css'
import '@/assets/styles/font.css';
import "vue3-toastify/dist/index.css";
import themePlugin from '@/plugins/theme/index';
import device from '@/plugins/device';
import App from './App.vue'
import router from "@/routes.ts";
import Vue3Toastify, { type ToastContainerOptions } from 'vue3-toastify';
import appQueryOptions from '@/plugins/appQuery';
export const app = createApp(App);
app.use(themePlugin);
app.use(router);
app.use(appQueryOptions);
app.use(device);
app.use(Vue3Toastify, {
    autoClose: 3000,
    position: 'bottom-right',
    rtl: true,
    theme: 'light',
    hideProgressBar: true,
    closeButton: true,
    pauseOnHover: true,
} as ToastContainerOptions);
app.mount('#app')