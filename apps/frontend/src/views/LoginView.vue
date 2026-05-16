<template>
  <div class="login-view">
    <a-form
      :model="formState"
      class="login-form"
      @finish="onFinish"
    >
      <a-form-item
        name="username"
        :rules="[{ required: true, message: t('usernameRequired') }]"
      >
        <a-input v-model:value="formState.username">
          <template #prefix>
            <UserOutlined class="site-form-item-icon" />
          </template>
        </a-input>
      </a-form-item>

      <a-form-item
        name="password"
        :rules="[{ required: true, message: t('passwordRequired') }]"
      >
        <a-input-password v-model:value="formState.password">
          <template #prefix>
            <LockOutlined class="site-form-item-icon" />
          </template>
        </a-input-password>
      </a-form-item>

      <a-form-item>
        <a-button
          :disabled="disabled"
          type="primary"
          html-type="submit"
          class="login-form-button"
        >
          {{ t('login') }}
        </a-button>
      </a-form-item>
    </a-form>
  </div>
</template>
<script lang="ts" setup>
import { reactive, computed } from 'vue';
import { UserOutlined, LockOutlined } from '@ant-design/icons-vue';
import { useScopedI18n } from '@/composables/useScopedI18n.ts';
import { useAuthStore } from '@/stores/authStore.ts';
import { useRouter } from 'vue-router';

interface FormState {
  username: string;
  password: string;
}

defineOptions({ name: 'LoginView' });
const { t } = useScopedI18n();

const authStore = useAuthStore();
const router = useRouter();

const formState = reactive<FormState>({
  username: '',
  password: '',
});

const disabled = computed(() => !(formState.username && formState.password));

const onFinish = async (values: FormState) => {
  await authStore.login(values.username, values.password);
  await router.push('/');
};
</script>
<style scoped>
.login-view {
  width: 100%;
  min-height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-form {
  width: 450px;
  max-width: calc(100% - 32px);
}
.login-form-button {
  width: 100%;
}
</style>
