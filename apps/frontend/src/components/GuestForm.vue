<template>
  <div class="guest-form">
    <div class="guest-form__header">
      <div>
        <strong>{{ t('guest') }} {{ index }}</strong>
        <a-tag
          v-if="isMainGuest"
          class="guest-form__main-guest"
          :bordered="false"
          color="processing"
        >
          {{ t('mainGuest') }}
        </a-tag>
      </div>
      <MinusCircleOutlined
        v-if="isRemoveButtonVisible"
        class="guest-form__remove-button"
        :title="t('removeGuest')"
        @click="$emit('remove')"
      />
    </div>
    <a-row :gutter="12">
      <a-col :span="12">
        <a-form-item
          :label="t('lastName')"
          :rules="{ required: true, message: t('errorRequiredField') }"
        >
          <a-input
            v-model:value="guest.lastName"
            autocomplete="none"
          />
        </a-form-item>
      </a-col>
      <a-col :span="12">
        <a-form-item
          :label="t('firstName')"
          :rules="{ required: true, message: t('errorRequiredField') }"
        >
          <a-input
            v-model:value="guest.firstName"
            autocomplete="none"
          />
        </a-form-item>
      </a-col>
    </a-row>

    <a-row :gutter="12">
      <a-col :span="12">
        <a-form-item
          :label="t('parentName')"
        >
          <a-input
            v-model:value="guest.parentName"
            autocomplete="none"
          />
        </a-form-item>
      </a-col>
      <a-col :span="12">
        <a-form-item
          :label="t('birthdate')"
        >
          <DateInput v-model="guest.birthdate" />
        </a-form-item>
      </a-col>
    </a-row>

    <a-row :gutter="12">
      <a-col :span="12">
        <a-form-item
          :label="t('phone')"
        >
          <a-input
            v-model:value="guest.phone"
            autocomplete="none"
          />
        </a-form-item>
      </a-col>
      <a-col :span="12">
        <a-form-item
          :label="t('email')"
          :rules="{
            type: 'email',
            message: t('errorNotValidEmail'),
            trigger: 'blur',
          }"
        >
          <a-input
            v-model:value="guest.email"
            autocomplete="none"
          />
        </a-form-item>
      </a-col>
    </a-row>
  </div>
</template>
<script setup lang="ts">
import { type PropType } from 'vue';
import { MinusCircleOutlined } from '@ant-design/icons-vue';
import { useScopedI18n } from '@/composables/useScopedI18n.ts';
import type { Guest } from '@shared/types/guest.ts';

defineProps({
  guest: {
    type: Object as PropType<Partial<Guest>>,
    required: true,
  },
  index: {
    type: Number,
    required: true,
  },
  isMainGuest: {
    type: Boolean,
  },
  isRemoveButtonVisible: {
    type: Boolean,
  },
});
defineEmits<{
  remove: [];
}>();

defineOptions({ name: 'GuestForm' });
const { t } = useScopedI18n();
</script>
<style scoped>
.guest-form {
  border-radius: 10px;
  padding: 14px 16px;
  margin-bottom: 12px;
  background: #fff;
  border: 1px solid #f0f0f0;
}

.guest-form__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.guest-form__header strong {
  font-size: 14px;
}

.guest-form__main-guest {
  margin-left: 8px;
  font-size: 11px;
}

.guest-form__remove-button {
  color: #ff4d4f;
  font-size: 16px;
}

.ant-form-item {
  margin-bottom: 12px;
}

.ant-form-item-label > label {
  color: #666;
}
</style>
