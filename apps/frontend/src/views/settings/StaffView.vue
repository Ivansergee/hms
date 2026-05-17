<template>
  <a-typography-title :level="3">
    {{ t('staff') }}
  </a-typography-title>
  <a-tabs v-model:active-key="activeTab">
    <a-tab-pane
      :key="StaffTabKey.USERS"
      :tab="t(StaffTabKey.USERS)"
    >
      <UsersTable />
    </a-tab-pane>
    <a-tab-pane
      :key="StaffTabKey.ROLES"
      :tab="t(StaffTabKey.ROLES)"
    >
      Content of Tab Pane 2
    </a-tab-pane>
  </a-tabs>
</template>
<script setup lang="ts">
import { useScopedI18n } from '@/composables/useScopedI18n.ts';
import { ref } from 'vue';

enum StaffTabKey {
  USERS = 'users',
  ROLES = 'roles',
}

defineOptions({ name: 'StaffView' });
const { t } = useScopedI18n();

const activeTab = ref<StaffTabKey>(StaffTabKey.USERS);
</script>
<style scoped>

</style>
