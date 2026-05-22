<template>
  <div class="profile-view">
    <div class="profile-view__content">
      <h1 class="profile-view__title">
        {{ t('title') }}
      </h1>

      <a-form
        ref="formRef"
        :model="formState"
        :rules="rules"
        layout="vertical"
        :required-mark="false"
      >
        <a-form-item :label="t('username')">
          <a-input
            v-model:value="formState.username"
            disabled
          />
        </a-form-item>

        <a-form-item
          name="name"
          :label="t('name')"
        >
          <a-input
            v-model:value="formState.name"
          />
        </a-form-item>

        <a-form-item
          name="email"
          :label="t('email')"
        >
          <a-input
            v-model:value="formState.email"
          />
        </a-form-item>

        <a-form-item :label="t('role')">
          <a-input
            :value="roleNames"
            disabled
          />
        </a-form-item>

        <a-form-item>
          <a-space>
            <a-button
              type="primary"
              :disabled="isSaveDisabled"
              @click="onSave"
            >
              {{ t('save') }}
            </a-button>
            <a-button @click="isChangePasswordModalOpen = true">
              {{ t('changePassword') }}
            </a-button>
          </a-space>
        </a-form-item>
      </a-form>
    </div>

    <a-modal
      :open="isChangePasswordModalOpen"
      :title="t('changePassword')"
      :footer="null"
      :mask-closable="false"
      width="450px"
      @cancel="isChangePasswordModalOpen = false"
    >
      <ChangePasswordForm @changed="onPasswordChanged" />
    </a-modal>
  </div>
</template>
<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import { useScopedI18n } from '@/composables/useScopedI18n.ts';
import { useAuthStore } from '@/stores/authStore.ts';
import ChangePasswordForm from '@/components/ChangePasswordForm.vue';
import type { FormInstance, Rule } from 'ant-design-vue/es/form';
import { useRouter } from 'vue-router';
import { RouteName } from '@/router';

interface ProfileFormState {
  username: string;
  name: string;
  email: string;
}

defineOptions({ name: 'ProfileView' });

const { t } = useScopedI18n();
const authStore = useAuthStore();
const router = useRouter();

const isChangePasswordModalOpen = ref(false);
const formRef = ref<FormInstance>();

const formState = reactive<ProfileFormState>({
  username: '',
  name: '',
  email: '',
});

const roleNames = computed(() => authStore.currentUser?.roles.map((role) => role.name).join(', ') ?? '');
const isSaveDisabled = computed(() => {
  const currentUser = authStore.currentUser;

  return !currentUser
    || !formState.name
    || (
      formState.name === currentUser.name
      && formState.email === (currentUser.email ?? '')
    );
});

const rules: Record<string, Rule[]> = {
  name: [{ required: true, message: t('requiredField'), trigger: 'change' }],
  email: [{ type: 'email', message: t('invalidEmail'), trigger: 'blur' }],
};

const resetForm = (): void => {
  formState.username = authStore.currentUser?.username ?? '';
  formState.name = authStore.currentUser?.name ?? '';
  formState.email = authStore.currentUser?.email ?? '';
  formRef.value?.clearValidate();
};

const onPasswordChanged = async (): Promise<void> => {
  isChangePasswordModalOpen.value = false;
  await router.push({ name: RouteName.LOGIN });
};

const onSave = async (): Promise<void> => {
  await formRef.value?.validate();
  await authStore.updateProfile({
    name: formState.name,
    email: formState.email || null,
  });
};

watch(
  () => authStore.currentUser,
  resetForm,
  { immediate: true },
);
</script>
<style scoped>
.profile-view {
  width: 100%;
  min-height: 100%;
  padding: 32px;
}

.profile-view__content {
  width: 560px;
  max-width: 100%;
}

.profile-view__title {
  margin: 0 0 24px;
  font-size: 24px;
  font-weight: 600;
  line-height: 32px;
}
</style>
