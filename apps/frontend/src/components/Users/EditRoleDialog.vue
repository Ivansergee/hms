<template>
  <a-modal
    :open="isOpen"
    :title="role ? t('editRole') : t('addRole')"
    :mask-closable="false"
    width="640px"
    @cancel="emit('close')"
  >
    <template #footer>
      <a-tooltip
        v-if="role"
        :title="deleteButtonTitle"
      >
        <a-button
          danger
          :disabled="isDeleteDisabled"
          class="mr-8"
          @click="onDelete"
        >
          {{ t('delete') }}
        </a-button>
      </a-tooltip>
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
        name="name"
        :label="t('name')"
      >
        <a-input
          v-model:value="formState.name"
          autocomplete="none"
        />
      </a-form-item>
      <a-form-item
        name="permissionKeys"
        :label="t('permissions')"
      >
        <a-select
          v-model:value="formState.permissionKeys"
          mode="multiple"
          :options="permissionOptions"
          :placeholder="t('permissions')"
        />
      </a-form-item>
    </a-form>
  </a-modal>
</template>
<script setup lang="ts">
import {
  computed, h, reactive, ref, type PropType, watch,
} from 'vue';
import type { FormInstance, Rule } from 'ant-design-vue/es/form';
import { Modal } from 'ant-design-vue';
import { ExclamationCircleOutlined } from '@ant-design/icons-vue';
import type { Role } from '@shared/types/user.ts';
import { useScopedI18n } from '@/composables/useScopedI18n.ts';
import { useUserStore } from '@/stores/userStore.ts';
import { translateEnum } from '@/i18n/i18n.ts';
import { Permission } from '@shared/enums/Permission.ts';

type RoleFormState = {
  name: string;
  permissionKeys: Permission[];
};

defineOptions({ name: 'EditRoleDialog' });

const { t } = useScopedI18n();
const userStore = useUserStore();

const props = defineProps({
  isOpen: {
    type: Boolean,
  },
  role: {
    type: Object as PropType<Role>,
    default: undefined,
  },
});

const emit = defineEmits<{
  close: [];
}>();

const formRef = ref<FormInstance>();
const formState = reactive<RoleFormState>({
  name: '',
  permissionKeys: [],
});

const permissionOptions = computed(() => userStore.rolePermissions.map((permission) => ({
  label: translateEnum(Permission, permission),
  value: permission,
})));
const isDeleteDisabled = computed(() => !props.role || props.role.isSystem);
const deleteButtonTitle = computed(() => (props.role?.isSystem ? t('systemRoleCannotBeDeleted') : undefined));

const rules: Record<string, Rule[]> = {
  name: [{ required: true, message: t('requiredField'), trigger: 'change' }],
};

const resetForm = (): void => {
  formState.name = props.role?.name ?? '';
  formState.permissionKeys = props.role?.permissions ?? [];
  formRef.value?.clearValidate();
};

const onSave = async (): Promise<void> => {
  await formRef.value?.validate();

  const data = {
    name: formState.name,
    permissionKeys: formState.permissionKeys,
  };

  if (props.role) {
    await userStore.updateRole(props.role.id, data);
  } else {
    await userStore.createRole(data);
  }

  emit('close');
};

const deleteRole = async (): Promise<void> => {
  if (!props.role) {
    return;
  }

  await userStore.deleteRole(props.role.id);
  emit('close');
};

const onDelete = (): void => {
  if (isDeleteDisabled.value || !props.role) {
    return;
  }

  Modal.confirm({
    title: t('deleteRole'),
    icon: h(ExclamationCircleOutlined),
    content: `${t('deleteConfirm')} ${props.role.name}?`,
    okText: t('yes'),
    cancelText: t('cancel'),
    onOk() {
      return deleteRole();
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
