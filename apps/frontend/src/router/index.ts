import { createRouter, createWebHistory } from 'vue-router';
import PlanView from '@/views/PlanView.vue';
import SettingsView from '@/views/SettingsView.vue';
import { useAuthStore } from '@/stores/authStore.ts';
import LoginView from '@/views/LoginView.vue';
import ChangePasswordView from '@/views/ChangePasswordView.vue';

export enum RouteName {
  PLAN = 'plan',
  TABLE = 'table',
  SETTINGS = 'settings',
  LOGIN = 'login',
  CHANGE_PASSWORD = 'changePassword',
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: RouteName.LOGIN,
      component: LoginView,
      meta: { public: true },
    },
    {
      path: '/change-password',
      name: RouteName.CHANGE_PASSWORD,
      component: ChangePasswordView,
    },
    {
      path: '/plan',
      alias: '/',
      name: RouteName.PLAN,
      component: PlanView,
    },
    {
      path: '/settings',
      name: RouteName.SETTINGS,
      component: SettingsView,
    },
  ],
});

router.beforeEach(async (to) => {
  const authStore = useAuthStore();

  const isLoggedIn = !!authStore.currentUser;
  const isPublicRoute = to.meta.public === true;

  if (!isLoggedIn && !isPublicRoute) {
    return { name: RouteName.LOGIN };
  }

  if (isLoggedIn && to.name === RouteName.LOGIN) {
    return { name: RouteName.PLAN };
  }

  if (
    authStore.currentUser?.mustChangePassword
    && to.name !== RouteName.CHANGE_PASSWORD
  ) {
    return { name: RouteName.CHANGE_PASSWORD };
  }

  if (
    isLoggedIn
    && !authStore.currentUser?.mustChangePassword
    && to.name === RouteName.CHANGE_PASSWORD
  ) {
    return { name: RouteName.PLAN };
  }

  return true;
});

export default router;
