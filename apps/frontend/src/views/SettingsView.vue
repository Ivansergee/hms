<template>
  <a-layout style="padding: 24px 0; background: #fff">
    <a-layout-sider width="200" style="background: #fff">
      <a-menu
        v-model:selectedKeys="selectedKeys"
        v-model:openKeys="openKeys"
        mode="inline"
        style="height: 100%"
      >
        <a-menu-item
          key="templates"
          :icon="h(CopyOutlined)"
        >
          {{ t('templates') }}
        </a-menu-item>
      </a-menu>
    </a-layout-sider>
    <a-layout-content :style="{ padding: '0 24px', minHeight: '280px' }">
      <a-typography-title :level="3">
        {{ t('templates') }}
      </a-typography-title>
      <TemplatesTable/>
    </a-layout-content>
  </a-layout>
</template>
<script setup lang="ts">
import { ref, h } from 'vue';
import { CopyOutlined } from '@ant-design/icons-vue';
import type { MenuProps } from 'ant-design-vue';
import { useScopedI18n } from "@/composables/useScopedI18n.ts";

defineOptions({ name: 'SettingsView' });
const { t } = useScopedI18n();

const selectedKeys = ref<string[]>(['1']);
const openKeys = ref<string[]>([]);

const handleClick: MenuProps['onClick'] = e => {
  console.log('click', e);
};
</script>
<style scoped>

</style>
