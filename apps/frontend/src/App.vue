<script setup lang="ts">
import { RouterView } from 'vue-router'
import { theme } from "ant-design-vue";
import enUS from 'ant-design-vue/es/locale/en_US';
import ruRU from 'ant-design-vue/es/locale/ru_RU';

theme.useToken();
</script>

<template>
  <a-config-provider
    :locale="ruRU"
  >
    <RouterView />
  </a-config-provider>
</template>

<style scoped>
</style>
