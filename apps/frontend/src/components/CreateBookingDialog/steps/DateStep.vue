<template>
  <a-form
    ref="formRef"
    :model="formModel"
    :rules="rules"
    :hideRequiredMark="true"
    :colon="false"
  >
    <a-form-item name="range">
      <a-range-picker
        class="range-picker"
        v-model:value="formModel.range"
        :placeholder="[t('startDate'), t('endDate')]"
        :format="['DD.MM.YYYY', 'DD.MM.YYYY']"
        value-format="YYYY-MM-DD"
        @change="emitChange"
      />
    </a-form-item>
    <a-space>
      <a-form-item name="checkInTime">
        <template #label>
            <span class="anticon anticon-setting">
              <svg focusable="false" width="1.2em" height="1.2em" fill="currentColor" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                <path d="M352 96l64 0c17.7 0 32 14.3 32 32l0 256c0 17.7-14.3 32-32 32l-64 0c-17.7 0-32 14.3-32 32s14.3 32 32 32l64 0c53 0 96-43 96-96l0-256c0-53-43-96-96-96l-64 0c-17.7 0-32 14.3-32 32s14.3 32 32 32zm-9.4 182.6c12.5-12.5 12.5-32.8 0-45.3l-128-128c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L242.7 224 32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l210.7 0-73.4 73.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l128-128z"/>
              </svg>
            </span>
        </template>
        <a-time-picker
          v-model:value="formModel.checkInTime"
          format="HH:mm"
          value-format="HH:mm"
          :placeholder="t('checkInTime')"
          :allowClear="false"
          :showNow="false"
          @select="onCheckInTimeChange"
        />
      </a-form-item>
      <a-form-item name="checkOutTime">
        <template #label>
            <span class="anticon anticon-setting">
              <svg focusable="false" width="1.2em" height="1.2em" fill="currentColor" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                <path d="M502.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-128-128c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L402.7 224 192 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l210.7 0-73.4 73.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l128-128zM160 96c17.7 0 32-14.3 32-32s-14.3-32-32-32L96 32C43 32 0 75 0 128L0 384c0 53 43 96 96 96l64 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-64 0c-17.7 0-32-14.3-32-32l0-256c0-17.7 14.3-32 32-32l64 0z"/>
              </svg>
            </span>
        </template>
        <a-time-picker
          v-model:value="formModel.checkOutTime"
          format="HH:mm"
          value-format="HH:mm"
          :placeholder="t('checkOutTime')"
          :allowClear="false"
          :showNow="false"
          @select="onCheckOutTimeChange"
        />
      </a-form-item>
    </a-space>
  </a-form>
</template>
<script setup lang="ts">
import type { BookingFormState } from "@shared/types/booking.ts";
import { ref } from "vue";
import type { Dayjs } from "dayjs";
import type { RuleObject } from "ant-design-vue/es/form";
import { useScopedI18n } from "@/composables/useScopedI18n.ts";

interface Props {
  state: BookingFormState;
}

interface FormModel {
  range: [string, string];
  checkInTime: string;
  checkOutTime: string;
}

defineOptions({ name: 'DateStep' });
const { t } = useScopedI18n();

const props = defineProps<Props>();
const emit = defineEmits<{
  (event: 'change', bookingState: BookingFormState): void;
}>();

const formRef = ref();

const formModel = ref<Partial<FormModel>>({
  range: !props.state.start || !props.state.end
    ? undefined
    : [props.state.start, props.state.end],
  checkInTime: props.state.start?.split(' ')[1] ?? '14:00',
  checkOutTime: props.state.end?.split(' ')[1] ?? '12:00',
})

const onCheckInTimeChange = (value: Dayjs): void => {
  formModel.value.checkInTime = value.format('HH:mm');
  emitChange();
};

const onCheckOutTimeChange = (value: Dayjs): void => {
  formModel.value.checkOutTime = value.format('HH:mm');
  emitChange();
};

const emitChange = (): void => {
  emit('change', {
    ...props.state,
    start: `${formModel.value.range?.[0]} ${formModel.value.checkInTime}`,
    end: `${formModel.value.range?.[1]} ${formModel.value.checkOutTime}`,
  });
};

const rules: { [key: string]: RuleObject[] } = {
  range: [{
    required: true,
    message: t('rangeRequiredError'),
    type: 'array',
  }],
  checkInTime: [{
    required: true,
    message: t('checkInTimeRequiredError'),
  }],
  checkOutTime: [{
    required: true,
    message: t('checkOutTimeRequiredError'),
  }],
}

const validate = async (): Promise<boolean> => {
  try {
    await formRef.value?.validate();
    return true;
  } catch {
    return false;
  }
}

defineExpose({ validate });
</script>
<style scoped>
.range-picker  {
  display: flex;
  justify-content: center;
}
</style>
