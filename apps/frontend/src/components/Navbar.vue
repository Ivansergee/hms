<template>
  <div class="logo" />
  <a-menu
    :selectedKeys="selectedKeys"
    theme="dark"
    mode="horizontal"
    @click="onMenuClick"
  >
    <a-menu-item :key="RouteName.PLAN">
      <span class="anticon anticon-setting">
        <svg focusable="false" width="1em" height="1em" fill="currentColor" aria-hidden="true"  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
          <path d="M0 96C0 78.3 14.3 64 32 64l384 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L32 128C14.3 128 0 113.7 0 96zM64 256c0-17.7 14.3-32 32-32l384 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L96 288c-17.7 0-32-14.3-32-32zM448 416c0 17.7-14.3 32-32 32L32 448c-17.7 0-32-14.3-32-32s14.3-32 32-32l384 0c17.7 0 32 14.3 32 32z"/>
        </svg>
      </span>
      <span>{{ t('plan') }}</span>
    </a-menu-item>
    <a-menu-item :key="RouteName.TABLE">
      <TableOutlined />
      <span>{{ t('bookings') }}</span>
    </a-menu-item>
    <a-menu-item :key="RouteName.SETTINGS">
      <SettingOutlined />
      <span>{{ t('settings') }}</span>
    </a-menu-item>
  </a-menu>
</template>
<script setup lang="ts">
import { RouteName } from "@/router";
import { SettingOutlined, TableOutlined } from "@ant-design/icons-vue";
import { computed } from "vue";
import type { MenuInfo } from "ant-design-vue/es/menu/src/interface";
import { useRoute, useRouter } from "vue-router";
import { useScopedI18n } from "@/composables/useScopedI18n.ts";

defineOptions({ name: 'Navbar' });
const { t } = useScopedI18n();

const router = useRouter();
const route = useRoute();

const selectedKeys = computed(() => [route.name as RouteName]);

const onMenuClick = ({ key }: MenuInfo): void => {
  router.push({ name: key as RouteName });
};
</script>
<style scoped>

</style>
