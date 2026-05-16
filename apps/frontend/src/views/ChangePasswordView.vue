<template>
  <div class="change-password-view">
    <div class="change-password-card">
      <h1 class="change-password-title">
        {{ t('title') }}
      </h1>
      <ChangePasswordForm @changed="onChanged" />
    </div>
  </div>
</template>
<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useScopedI18n } from '@/composables/useScopedI18n.ts';

defineOptions({ name: 'ChangePasswordView' });
const { t } = useScopedI18n();

const router = useRouter();

const onChanged = async (): Promise<void> => {
  await router.push('/');
};
</script>
<style scoped>
.change-password-view {
  width: 100%;
  min-height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.change-password-card {
  width: 450px;
  max-width: calc(100% - 32px);
}

.change-password-title {
  margin: 0 0 24px;
  font-size: 24px;
  font-weight: 600;
  line-height: 32px;
  text-align: center;
}
</style>
