import { createRouter, createWebHistory } from 'vue-router'
import PlanView from "@/views/PlanView.vue";
import SettingsView from "@/views/SettingsView.vue";

export enum RouteName {
  PLAN = 'plan',
  TABLE = 'table',
  SETTINGS = 'settings',
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/plan',
      alias: '/',
      name: 'plan',
      component: PlanView,
    },
    {
      path: '/settings',
      name: 'settings',
      component: SettingsView,
    }
  ],
})

export default router
