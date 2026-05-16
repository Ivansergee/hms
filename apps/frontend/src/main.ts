import 'ant-design-vue/dist/reset.css';
import './assets/styles/global.css';
import './assets/styles/utilities.scss';

import { createApp } from 'vue';
import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';

import { i18n } from '@/i18n/i18n';
import { setupDayjsLocale } from '@/i18n/dayjsLocale';
import { registerEnums } from '@/i18n/registerEnums.ts';
import { useAuthStore } from '@/stores/authStore.ts';
import router from './router';
import App from './App.vue';

setupDayjsLocale();

const app = createApp(App);
const pinia = createPinia();

pinia.use(piniaPluginPersistedstate);

app.use(i18n);
app.use(pinia);

registerEnums();

const authStore = useAuthStore();
await authStore.restore();

app.use(router);
app.mount('#app');
