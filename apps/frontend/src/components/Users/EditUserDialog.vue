<template>
  <a-modal
    :open="isOpen"
    :title="user ? t('editUser') : t('addUser')"
    :mask-closable="false"
    width="640px"
    @cancel="emit('close')"
  >
    <template #footer>
      <a-button
        v-if="user"
        :danger="user.isActive"
        @click="onStatusChange"
      >
        {{ user.isActive ? t('blockUser') : t('unblockUser') }}
      </a-button>
      <a-button
        type="primary"
        @click="onSave"
      >
        {{ t('save') }}
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
        name="username"
        :label="t('username')"
      >
        <a-input
          v-model:value="formState.username"
          :disabled="isEditMode"
          autocomplete="none"
        />
      </a-form-item>
      <a-form-item
        name="name"
        :label="t('name')"
      >
        <a-input
          v-model:value="formState.name"
          :disabled="isEditMode"
          autocomplete="none"
        />
      </a-form-item>
      <a-form-item
        name="email"
        :label="t('email')"
      >
        <a-input
          v-model:value="formState.email"
          :disabled="isEditMode"
          autocomplete="none"
        />
      </a-form-item>
      <a-form-item
        v-if="!isEditMode"
        name="password"
        :label="t('password')"
      >
        <a-input-password v-model:value="formState.password" />
      </a-form-item>
      <a-form-item
        v-if="!isEditMode"
        name="confirmPassword"
        :label="t('confirmPassword')"
      >
        <a-input-password v-model:value="formState.confirmPassword" />
      </a-form-item>
      <a-form-item
        name="roleIds"
        :label="t('roles')"
      >
        <a-select
          v-model:value="formState.roleIds"
          mode="multiple"
          :options="roleOptions"
          :placeholder="t('roles')"
        />
      </a-form-item>
    </a-form>
  </a-modal>
</template>
<script setup lang="ts">
import {
  computed, reactive, ref, type PropType, watch, h,
} from 'vue';
import type { FormInstance, Rule } from 'ant-design-vue/es/form';
import { useScopedI18n } from '@/composables/useScopedI18n.ts';
import type { UserListItem } from '@/queries/userQueries.ts';
import { useUserStore } from '@/stores/userStore.ts';
import { Modal } from 'ant-design-vue';
import { ExclamationCircleOutlined } from '@ant-design/icons-vue';

type UserFormState = {
  username: string;
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  roleIds: number[];
};

defineOptions({ name: 'EditUserDialog' });
const { t } = useScopedI18n();

const userStore = useUserStore();

const props = defineProps({
  isOpen: {
    type: Boolean,
  },
  user: {
    type: Object as PropType<UserListItem>,
  },
});

const emit = defineEmits<{
  close: [];
}>();

const formRef = ref<FormInstance>();
const formState = reactive<UserFormState>({
  username: '',
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  roleIds: [],
});

const isEditMode = computed(() => !!props.user);
const roleOptions = computed(() => userStore.roles.map((role) => ({
  label: role.name,
  value: role.id,
})));

const validatePassword = async (_rule: Rule, value: string) => {
  if (value === '' && !props.user) {
    return Promise.reject(Error(t('requiredField')));
  }
  return Promise.resolve();
};

const validateConfirmPassword = async (_rule: Rule, value: string) => {
  if (value === '' && !props.user) {
    return Promise.reject(Error(t('requiredField')));
  }
  if (value !== formState.password) {
    return Promise.reject(Error(t('passwordsNotMatch')));
  }
  return Promise.resolve();
};

const rules: Record<string, Rule[]> = {
  username: [{ required: true, message: t('requiredField'), trigger: 'change' }],
  name: [{ required: true, message: t('requiredField'), trigger: 'change' }],
  email: [{ type: 'email', message: t('invalidEmail'), trigger: 'blur' }],
  password: [{ validator: validatePassword, trigger: 'change' }],
  confirmPassword: [{ validator: validateConfirmPassword, trigger: 'change' }],
};

const resetForm = (): void => {
  formState.username = props.user?.username ?? '';
  formState.name = props.user?.name ?? '';
  formState.email = props.user?.email ?? '';
  formState.password = '';
  formState.confirmPassword = '';
  formState.roleIds = props.user?.roles.map((role) => role.id) ?? [];
  formRef.value?.clearValidate();
};

const onSave = async (): Promise<void> => {
  await formRef.value?.validate();

  if (props.user) {
    await userStore.updateRoles(props.user.id, formState.roleIds);
  } else {
    await userStore.create({
      username: formState.username,
      name: formState.name,
      email: formState.email || undefined,
      password: formState.password,
      roleIds: formState.roleIds,
    });
  }

  emit('close');
};

const toggleUserStatus = async (): Promise<void> => {
  if (!props.user) {
    return;
  }

  if (props.user.isActive) {
    await userStore.disable(props.user.id);
  } else {
    await userStore.enable(props.user.id);
  }
};

const onStatusChange = (): void => {
  if (!props.user) {
    return;
  }

  const content = props.user.isActive
    ? `${t('blockConfirm')} ${props.user.name}?`
    : `${t('unblockConfirm')} ${props.user.name}?`;

  Modal.confirm({
    title: props.user.isActive ? t('blockConfirm') : t('unblockConfirm'),
    icon: h(ExclamationCircleOutlined),
    content,
    okText: t('yes'),
    cancelText: t('cancel'),
    onOk() {
      toggleUserStatus();
    },
  });
};

watch(
  () => props.isOpen,
  (isOpen: boolean) => {
    if (isOpen) {
      resetForm();
    }
  },
  { immediate: true },
);
</script>
<style scoped>

</style>
