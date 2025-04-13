<script setup lang="ts">
import { RouterView } from 'vue-router'
import { theme } from "ant-design-vue";

theme.useToken();
</script>

<template>
  <a-config-provider :theme="{ token: { wireframe: true } }">
    <RouterView />
  </a-config-provider>
</template>

<style scoped>
</style>
