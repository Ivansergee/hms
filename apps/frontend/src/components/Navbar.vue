<template>
  <div class="navbar">
    <a-menu
      class="navbar__menu"
      :selected-keys="selectedKeys"
      theme="dark"
      mode="horizontal"
      @click="onMenuClick"
    >
      <a-menu-item :key="RouteName.PLAN">
        <span class="anticon anticon-setting">
          <svg
            focusable="false"
            width="1em"
            height="1em"
            fill="currentColor"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 512 512"
          >
            <path d="M0 96C0 78.3 14.3 64 32 64l384 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L32 128C14.3 128 0 113.7 0 96zM64 256c0-17.7 14.3-32 32-32l384 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L96 288c-17.7 0-32-14.3-32-32zM448 416c0 17.7-14.3 32-32 32L32 448c-17.7 0-32-14.3-32-32s14.3-32 32-32l384 0c17.7 0 32 14.3 32 32z" />
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
    <a-dropdown trigger="click">
      <a-button
        class="navbar__user-button"
        type="text"
      >
        <UserOutlined />
      </a-button>
      <template #overlay>
        <a-menu @click="onUserMenuClick">
          <a-menu-item :key="UserMenuKey.PREFERENCES">
            <ControlOutlined />
            {{ t('preferences') }}
          </a-menu-item>
          <a-menu-item
            :key="UserMenuKey.LOGOUT"
            danger
          >
            <LogoutOutlined />
            {{ t('logout') }}
          </a-menu-item>
        </a-menu>
      </template>
    </a-dropdown>
  </div>
</template>
<script setup lang="ts">
import { RouteName } from '@/router';
import {
  ControlOutlined,
  LogoutOutlined,
  SettingOutlined,
  TableOutlined,
  UserOutlined,
} from '@ant-design/icons-vue';
import { computed } from 'vue';
import type { MenuInfo } from 'ant-design-vue/es/menu/src/interface';
import { useRoute, useRouter } from 'vue-router';
import { useScopedI18n } from '@/composables/useScopedI18n';
import { useAuthStore } from '@/stores/authStore.ts';

enum UserMenuKey {
  PREFERENCES = 'preferences',
  LOGOUT = 'logout',
}

defineOptions({ name: 'Navbar' });
const { t } = useScopedI18n();

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const selectedKeys = computed(() => [route.name as RouteName]);

const onMenuClick = ({ key }: MenuInfo): void => {
  router.push({ name: key as RouteName });
};

const onUserMenuClick = async ({ key }: MenuInfo): Promise<void> => {
  if (key === UserMenuKey.PREFERENCES) {
    await router.push({ name: RouteName.SETTINGS });
    return;
  }

  if (key === UserMenuKey.LOGOUT) {
    await authStore.logout();
    await router.push({ name: RouteName.LOGIN });
  }
};
</script>
<style scoped>
.navbar {
  display: flex;
  align-items: center;
  height: 100%;
}

.navbar__menu {
  flex: 1;
  min-width: 0;
}

.navbar__user-button {
  color: rgba(255, 255, 255, 0.85);
  height: 45px;
  width: 45px;
}

.navbar__user-button:hover,
.navbar__user-button:focus {
  color: #fff;
  background: rgba(255, 255, 255, 0.12);
}
</style>
