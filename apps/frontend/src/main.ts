import 'ant-design-vue/dist/reset.css';

import { createApp } from 'vue';
import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

import App from './App.vue';
import router from './router';
import { i18n } from '@/i18n/i18n';
import { useRoomStore } from "@/stores/roomStore.ts";
import { setupDayjsLocale } from "@/i18n/dayjsLocale.ts";

setupDayjsLocale();
const app = createApp(App);
const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

app.use(i18n);
app.use(pinia);
app.use(router);

async function initApp() {
  await useRoomStore().fetchRooms();
}

initApp().then(() => {
  app.mount('#app');
}).catch((err) => {
  console.error('Error initializing app', err);
});
