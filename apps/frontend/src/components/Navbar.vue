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
    <a-dropdown
      trigger="click"
      :overlay-style="{ width: 'max-content' }"
    >
      <a-button
        class="navbar__user-button"
        type="text"
      >
        <UserOutlined />
      </a-button>
      <template #overlay>
        <a-menu
          class="navbar__user-menu"
          @click="onUserMenuClick"
        >
          <a-menu-item
            key="user-info"
            disabled
            class="navbar__user-meta-item"
          >
            <div class="navbar__user-meta">
              <a-typography-text class="navbar__user-name">
                {{ authStore.currentUser?.name }}
              </a-typography-text>
              <a-typography-text class="navbar__user-username">
                {{ authStore.currentUser?.username }}
              </a-typography-text>
            </div>
          </a-menu-item>
          <a-menu-divider />
          <a-menu-item :key="UserMenuKey.PROFILE">
            <a-space :size="8">
              <UserOutlined />
              <span>{{ t(UserMenuKey.PROFILE) }}</span>
            </a-space>
          </a-menu-item>
          <a-menu-item
            :key="UserMenuKey.LOGOUT"
            danger
          >
            <a-space :size="8">
              <PoweroffOutlined />
              <span>{{ t(UserMenuKey.LOGOUT) }}</span>
            </a-space>
          </a-menu-item>
        </a-menu>
      </template>
    </a-dropdown>
  </div>
</template>
<script setup lang="ts">
import { RouteName } from '@/router';
import {
  PoweroffOutlined,
  QuestionCircleOutlined,
  SettingOutlined,
  TableOutlined,
  UserOutlined,
} from '@ant-design/icons-vue';
import { computed, h } from 'vue';
import type { MenuInfo } from 'ant-design-vue/es/menu/src/interface';
import { useRoute, useRouter } from 'vue-router';
import { useScopedI18n } from '@/composables/useScopedI18n';
import { useAuthStore } from '@/stores/authStore.ts';
import { Modal } from 'ant-design-vue';

enum UserMenuKey {
  PROFILE = 'profile',
  LOGOUT = 'logout',
}

defineOptions({ name: 'Navbar' });
const { t } = useScopedI18n();

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const NAVBAR_ROUTE_KEYS = new Set<RouteName>([
  RouteName.PLAN,
  RouteName.TABLE,
  RouteName.SETTINGS,
]);

const selectedKeys = computed(() => {
  for (const matchedRoute of route.matched) {
    if (
      matchedRoute.name
      && NAVBAR_ROUTE_KEYS.has(matchedRoute.name as RouteName)
    ) {
      return [matchedRoute.name as RouteName];
    }
  }

  return route.name ? [route.name as RouteName] : [];
});

const onMenuClick = ({ key }: MenuInfo): void => {
  router.push({ name: key as RouteName });
};

const showLogoutConfirm = () => {
  Modal.confirm({
    title: t('logoutConfirm'),
    icon: h(QuestionCircleOutlined),
    okText: t('yes'),
    cancelText: t('cancel'),
    async onOk() {
      await authStore.logout();
      await router.push({ name: RouteName.LOGIN });
    },
  });
};

const onUserMenuClick = async ({ key }: MenuInfo): Promise<void> => {
  if (key === UserMenuKey.PROFILE) {
    await router.push({ name: RouteName.PROFILE });
    return;
  }

  if (key === UserMenuKey.LOGOUT) {
    showLogoutConfirm();
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
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.65);
  height: 34px;
  width: 34px;
  margin: 0 6px;
  border: 1px solid rgba(255, 255, 255, 0.65);
  border-radius: 50%;
}

.navbar__user-button:hover,
.navbar__user-button:focus {
  color: #fff;
  border-color: #fff;
  background: rgba(255, 255, 255, 0.16);
}

:deep(.navbar__user-menu) {
  min-width: max-content;
}

:deep(.navbar__user-menu .ant-menu-item) {
  white-space: nowrap;
}

:deep(.navbar__user-meta-item.ant-dropdown-menu-item-disabled) {
  cursor: default !important;
}

:deep(.navbar__user-meta-item .ant-dropdown-menu-title-content) {
  cursor: default;
}

.navbar__user-meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.navbar__user-name,
.navbar__user-username {
  line-height: 1.2;
}

.navbar__user-name {
  font-weight: 600;
}

:global(.navbar__user-meta-item .navbar__user-username) {
  color: rgba(0, 0, 0, 0.25);
}
</style>
