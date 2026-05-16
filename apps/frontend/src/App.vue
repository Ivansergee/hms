<script setup lang="ts">
import { RouterView } from 'vue-router';
import { theme } from 'ant-design-vue';
import enUS from 'ant-design-vue/es/locale/en_US';
import ruRU from 'ant-design-vue/es/locale/ru_RU';
import { computed } from 'vue';
import { useAuthStore } from '@/stores/authStore.ts';

theme.useToken();

const authStore = useAuthStore();

const isLoginRequired = computed<boolean>(() => {
  return !authStore.currentUser || authStore.currentUser.mustChangePassword;
});
</script>

<template>
  <a-config-provider :locale="ruRU">
    <a-layout class="layout">
      <a-layout-header
        v-if="!isLoginRequired"
        class="header"
      >
        <Navbar />
      </a-layout-header>
      <a-layout-content class="content">
        <RouterView />
      </a-layout-content>
    </a-layout>
  </a-config-provider>
</template>

<style scoped>
.header {
  height: 45px;
  line-height: 45px;
  padding-inline: unset;
}
</style>
