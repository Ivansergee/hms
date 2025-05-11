<script lang="ts" setup>
import {
  TableOutlined,
  SettingOutlined,
} from '@ant-design/icons-vue';
import { ref } from 'vue';
const selectedKeys = ref<string[]>(['1']);
</script>

<template>
  <a-layout class="layout">
    <a-layout-header class="header">
      <div class="logo" />
      <a-menu v-model:selectedKeys="selectedKeys" theme="dark" mode="horizontal">
        <a-menu-item key="1">
          <span class="anticon anticon-setting">
            <svg focusable="false" width="1em" height="1em" fill="currentColor" aria-hidden="true"  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
              <path d="M0 96C0 78.3 14.3 64 32 64l384 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L32 128C14.3 128 0 113.7 0 96zM64 256c0-17.7 14.3-32 32-32l384 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L96 288c-17.7 0-32-14.3-32-32zM448 416c0 17.7-14.3 32-32 32L32 448c-17.7 0-32-14.3-32-32s14.3-32 32-32l384 0c17.7 0 32 14.3 32 32z"/></svg>
            </span>
          <span>Plan</span>
        </a-menu-item>
        <a-menu-item key="2">
          <TableOutlined />
          <span>Bookings</span>
        </a-menu-item>
        <a-menu-item key="3">
          <SettingOutlined />
          <span>Settings</span>
        </a-menu-item>
      </a-menu>
    </a-layout-header>
    <a-layout-content class="content">
      <PlanTable/>
    </a-layout-content>
  </a-layout>
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
