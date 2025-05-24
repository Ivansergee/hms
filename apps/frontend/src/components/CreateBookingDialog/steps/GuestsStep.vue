<template>
  <a-form
    ref="formRef"
    :model="formModel"
    :hideRequiredMark="true"
    :colon="false"
    :label-col="labelCol"
    :wrapper-col="wrapperCol"
  >
    <div
      v-for="(guest, index) in formModel.guests"
      :key="guest.id"
    >
      <a-space size="small">
        <span>{{ t('guest') }} {{ index + 1 }}</span>
        <a-typography-text
          v-if="index === 0"
          type="secondary"
        >
          {{ t('mainGuest') }}
        </a-typography-text>
        <MinusCircleOutlined
          v-if="formModel.guests.length > 1"
          :style="{ color: 'red' }"
          @click="removeGuest(index)"
        />
      </a-space>
      <a-form-item
        :label="t('lastName')"
        :name="['guests', index, 'lastName']"
        :rules="{ required: true, message: t('errorRequiredField') }"
      >
        <a-input v-model:value="guest.lastName" />
      </a-form-item>
      <a-form-item
        :label="t('firstName')"
        :name="['guests', index, 'firstName']"
        :rules="{ required: true, message: t('errorRequiredField') }"
      >
        <a-input v-model:value="guest.firstName" />
      </a-form-item>
      <a-form-item
        :label="t('parentName')"
        :name="['guests', index, 'parentName']"
      >
        <a-input v-model:value="guest.parentName" />
      </a-form-item>
      <a-form-item
        :label="t('phone')"
        :name="['guests', index, 'phone']"
      >
        <a-input v-model:value="guest.phone" />
      </a-form-item>
      <a-form-item
        :label="t('email')"
        :name="['guests', index, 'email']"
        :rules="{
          type: 'email',
          message: t('errorNotValidEmail'),
          trigger: 'blur',
        }"
      >
        <a-input v-model:value="guest.email" />
      </a-form-item>
      <a-divider/>
    </div>
    <a-button
      class="add-guest-button"
      type="dashed"
      @click="addGuest"
    >
      <PlusOutlined />
      {{ t('addGuest') }}
    </a-button>
  </a-form>
</template>
<script setup lang="ts">
import type { BookingFormState } from "@shared/types/booking.ts";
import type { GuestCreate } from "@shared/types/guest.ts";
import { ref, watch } from "vue";
import {
  PlusOutlined,
  MinusCircleOutlined,
} from "@ant-design/icons-vue";
import { useScopedI18n } from "@/composables/useScopedI18n.ts";

interface Props {
  state: BookingFormState;
}

interface FormModel {
  guests: Array<Partial<GuestCreate>>;
}

defineOptions({ name: 'GuestsStep' });
const { t } = useScopedI18n();

const props = defineProps<Props>();
const emit = defineEmits<{
  (event: 'change', bookingState: BookingFormState): void;
}>();

const labelCol = { style: { width: '150px' } };
const wrapperCol = { span: 14 };

const formRef = ref();

const formModel = ref<FormModel>({
  guests: props.state.guests.length ? props.state.guests : [{ id: Date.now() }],
})

const addGuest = (): void => {
  formModel.value.guests.push({ id: Date.now() })
};

const removeGuest = (index: number): void => {
  if (!formModel.value.guests) {
    return;
  }
  formModel.value.guests.splice(index, 1);
};

const emitChange = (): void => {
  emit('change', {
    ...props.state,
    guests: formModel.value.guests,
  });
};

watch(formModel.value.guests, () => emitChange());

const validate = async (): Promise<boolean> => {
  try {
    await formRef.value?.validate();
    return true;
  } catch (error) {
    return false;
  }
}

defineExpose({ validate });
</script>
<style scoped>
.add-guest-button {
  width: 58%;
  left: 150px;
}
</style>
