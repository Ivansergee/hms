<template>
  <a-layout
    class="settings-view"
    style="padding: 24px 0; background: #fff"
  >
    <a-layout-sider
      width="200"
      style="background: #fff"
    >
      <a-menu
        v-model:selected-keys="selectedKeys"
        mode="inline"
        style="height: 100%"
        @click="onMenuClick"
      >
        <a-menu-item
          :key="SettingsRouteName.STAFF"
          :icon="h(TeamOutlined)"
        >
          {{ t(SettingsRouteName.STAFF) }}
        </a-menu-item>
        <a-menu-item
          :key="SettingsRouteName.TEMPLATES"
          :icon="h(CopyOutlined)"
        >
          {{ t(SettingsRouteName.TEMPLATES) }}
        </a-menu-item>
      </a-menu>
    </a-layout-sider>
    <a-layout-content class="settings-view__content">
      <div class="w100">
        <router-view />
      </div>
    </a-layout-content>
  </a-layout>
</template>
<script setup lang="ts">
import { h, computed } from 'vue';
import { CopyOutlined, TeamOutlined } from '@ant-design/icons-vue';
import { useScopedI18n } from '@/composables/useScopedI18n';
import { SettingsRouteName } from '@/router';
import { useRoute, useRouter } from 'vue-router';
import type { MenuInfo } from 'ant-design-vue/es/menu/src/interface';

defineOptions({ name: 'SettingsView' });
const { t } = useScopedI18n();

const route = useRoute();
const router = useRouter();

const selectedKeys = computed(() => [route.name as SettingsRouteName]);

const onMenuClick = ({ key }: MenuInfo) => {
  if (key === SettingsRouteName.STAFF) {
    router.push({ name: SettingsRouteName.STAFF });
  }

  if (key === SettingsRouteName.TEMPLATES) {
    router.push({ name: SettingsRouteName.TEMPLATES });
  }
};
</script>
<style scoped>
.settings-view__content {
  flex: 1;
  min-width: 0;
  width: 100%;
  padding: 0 24px;
  min-height: 280px;
}
</style>
