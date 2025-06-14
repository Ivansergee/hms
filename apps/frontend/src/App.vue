<script setup lang="ts">
import { RouterView } from 'vue-router'
import { theme } from "ant-design-vue";
import enUS from 'ant-design-vue/es/locale/en_US';
import ruRU from 'ant-design-vue/es/locale/ru_RU';

theme.useToken();
</script>

<template>
  <a-config-provider :locale="ruRU">
    <a-layout class="layout">
      <a-layout-header class="header">
        <Navbar/>
      </a-layout-header>
      <a-layout-content class="content">
        <RouterView />
      </a-layout-content>
    </a-layout>
  </a-config-provider>
</template>

<style scoped>
.header {
  position: fixed;
  width: 100%;
  height: 45px;
  line-height: 45px;
}

.content {
  margin-top: 45px;
}
</style>
