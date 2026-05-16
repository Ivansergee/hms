<template>
  <a-form
    :model="formState"
    :rules="rules"
    layout="vertical"
    :required-mark="false"
    class="change-password-form"
    @finish="onFinish"
  >
    <a-form-item
      name="currentPassword"
      :label="t('currentPassword')"
    >
      <a-input-password v-model:value="formState.currentPassword" />
    </a-form-item>

    <a-form-item
      name="newPassword"
      :label="t('newPassword')"
    >
      <a-input-password v-model:value="formState.newPassword" />
    </a-form-item>

    <a-form-item
      name="confirmPassword"
      :label="t('confirmPassword')"
    >
      <a-input-password v-model:value="formState.confirmPassword" />
    </a-form-item>

    <a-form-item>
      <a-button
        :disabled="disabled"
        type="primary"
        html-type="submit"
        class="change-password-form-button"
      >
        {{ t('changePassword') }}
      </a-button>
    </a-form-item>
  </a-form>
</template>
<script setup lang="ts">
import { useScopedI18n } from '@/composables/useScopedI18n.ts';
import { computed, reactive } from 'vue';
import { useAuthStore } from '@/stores/authStore.ts';
import type { Rule } from 'ant-design-vue/es/form';

interface FormState {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const emit = defineEmits(['changed']);

defineOptions({ name: 'ChangePasswordForm' });
const { t } = useScopedI18n();

const authStore = useAuthStore();

const formState = reactive<FormState>({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
});

const validateNewPassword = async (_rule: Rule, value: string) => {
  if (value === '') {
    return Promise.reject(Error(t('requiredField')));
  }
  if (value === formState.currentPassword) {
    return Promise.reject(Error(t('newPasswordShouldDiffer')));
  }
  return Promise.resolve();
};

const validatePassword = async (_rule: Rule, value: string) => {
  if (value === '') {
    return Promise.reject(Error(t('requiredField')));
  }
  if (value !== formState.newPassword) {
    return Promise.reject(Error(t('passwordsNotMatch')));
  }
  return Promise.resolve();
};

const rules: Record<string, Rule[]> = {
  currentPassword: [{ required: true, message: t('requiredField'), trigger: 'change' }],
  newPassword: [{ validator: validateNewPassword, trigger: 'change' }],
  confirmPassword: [{ validator: validatePassword, trigger: 'change' }],
};

const disabled = computed(() => !(formState.currentPassword && formState.newPassword && formState.confirmPassword));

const onFinish = async (values: FormState) => {
  await authStore.changePassword(values.currentPassword, values.newPassword);
  emit('changed');
};
</script>
<style scoped>
.change-password-form-button {
  width: 100%;
}
</style>
