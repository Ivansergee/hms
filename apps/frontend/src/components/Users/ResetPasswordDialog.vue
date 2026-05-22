<template>
  <a-modal
    :open="isOpen"
    :title="t('resetPassword')"
    :mask-closable="false"
    width="480px"
    @cancel="close"
  >
    <template #footer>
      <a-button @click="close">
        {{ t('cancel') }}
      </a-button>
      <a-button
        type="primary"
        @click="onConfirm"
      >
        {{ t('confirm') }}
      </a-button>
    </template>
    <a-form
      ref="formRef"
      :model="formState"
      :rules="rules"
      layout="vertical"
      :required-mark="false"
    >
      <a-form-item
        name="temporaryPassword"
        :label="t('temporaryPassword')"
      >
        <a-input-password v-model:value="formState.temporaryPassword" />
      </a-form-item>
      <a-form-item
        name="confirmPassword"
        :label="t('confirmPassword')"
      >
        <a-input-password v-model:value="formState.confirmPassword" />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import {
  h, reactive, ref, watch, type PropType,
} from 'vue';
import type { FormInstance, Rule } from 'ant-design-vue/es/form';
import { Modal } from 'ant-design-vue';
import { QuestionCircleOutlined } from '@ant-design/icons-vue';
import { useScopedI18n } from '@/composables/useScopedI18n.ts';
import type { UserListItem } from '@/queries/userQueries.ts';
import { useUserStore } from '@/stores/userStore.ts';

type ResetPasswordFormState = {
  temporaryPassword: string;
  confirmPassword: string;
};

defineOptions({ name: 'ResetPasswordDialog' });

const isOpen = defineModel<boolean>('open', { default: false });

const props = defineProps({
  user: {
    type: Object as PropType<UserListItem>,
  },
});

const { t } = useScopedI18n();
const userStore = useUserStore();

const formRef = ref<FormInstance>();
const formState = reactive<ResetPasswordFormState>({
  temporaryPassword: '',
  confirmPassword: '',
});

const validateConfirmPassword = async (_rule: Rule, value: string) => {
  if (value === '') {
    return Promise.reject(Error(t('requiredField')));
  }
  if (value !== formState.temporaryPassword) {
    return Promise.reject(Error(t('passwordsNotMatch')));
  }
  return Promise.resolve();
};

const rules: Record<string, Rule[]> = {
  temporaryPassword: [{ required: true, message: t('requiredField'), trigger: 'change' }],
  confirmPassword: [{ validator: validateConfirmPassword, trigger: 'change' }],
};

const resetForm = (): void => {
  formState.temporaryPassword = '';
  formState.confirmPassword = '';
  formRef.value?.clearValidate();
};

const close = (): void => {
  isOpen.value = false;
};

const resetUserPassword = async (): Promise<void> => {
  if (!props.user) {
    return;
  }

  await userStore.resetPassword(props.user.id, {
    password: formState.temporaryPassword,
    mustChangePassword: true,
  });
  close();
};

const onConfirm = async (): Promise<void> => {
  await formRef.value?.validate();

  Modal.confirm({
    title: t('resetPasswordConfirm'),
    icon: h(QuestionCircleOutlined),
    content: t('resetPasswordSessionWarning'),
    okText: t('yes'),
    cancelText: t('cancel'),
    onOk() {
      return resetUserPassword();
    },
  });
};

watch(isOpen, (open) => {
  if (open) {
    resetForm();
  }
});
</script>
