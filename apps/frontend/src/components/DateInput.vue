<template>
  <a-form-item
    :label="label"
    :validate-status="validateStatus"
    :help="errorMessage"
  >
    <a-input
      :value="displayValue"
      :placeholder="t('inputPlaceholder')"
      :disabled="disabled"
      @input="onInput"
    >
      <template #suffix>
        <calendar-outlined
          :style="{ cursor: disabled ? 'not-allowed' : 'pointer' }"
          @click="openDatePicker"
        />
      </template>
    </a-input>

    <a-date-picker
      v-model:value="pickerValue"
      :open="openPicker"
      style="position: absolute; opacity: 0; pointer-events: none"
      :disabled="disabled"
      @open-change="(val) => (openPicker = val)"
    />
  </a-form-item>
</template>

<script setup lang="ts">
import {
  ref, computed, type PropType, watch,
} from 'vue';
import dayjs, { Dayjs } from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { CalendarOutlined } from '@ant-design/icons-vue';
import { useScopedI18n } from '@/composables/useScopedI18n.ts';

dayjs.extend(customParseFormat);

const props = defineProps({
  modelValue: {
    type: String as PropType<string | undefined>,
    required: false,
    default: undefined,
  },
  label: {
    type: String as PropType<string | undefined>,
    required: false,
    default: undefined,
  },
  disabled: {
    type: Boolean,
  },
});

const emit = defineEmits<{
  'update:modelValue': [value?: string];
}>();

defineOptions({ name: 'DateInput' });
const { t } = useScopedI18n();

const openPicker = ref(false);
const pickerValue = ref<Dayjs>();
const rawDigits = ref('');
const errorMessage = ref<string>();

const displayValue = computed(() => {
  const d = rawDigits.value;

  if (d.length <= 2) {
    return d;
  }
  if (d.length <= 4) {
    return `${d.slice(0, 2)}.${d.slice(2)}`;
  }
  return `${d.slice(0, 2)}.${d.slice(2, 4)}.${d.slice(4, 8)}`;
});

const validateStatus = computed(() => (errorMessage.value ? 'error' : undefined));

const openDatePicker = (): void => {
  if (!props.disabled) {
    openPicker.value = true;
  }
};

const onInput = (e: Event) => {
  if (props.disabled) {
    return;
  }

  const { value } = (e.target as HTMLInputElement);

  const digits = value.replace(/\D/g, '').slice(0, 8);
  rawDigits.value = digits;
  errorMessage.value = undefined;

  if (digits.length === 8) {
    const day = digits.slice(0, 2);
    const month = digits.slice(2, 4);
    const year = digits.slice(4, 8);

    const iso = `${year}-${month}-${day}`;
    const date = dayjs(iso, 'YYYY-MM-DD', true);

    if (!date.isValid()) {
      errorMessage.value = t('invalidDate');
      emit('update:modelValue', undefined);
      return;
    }

    emit('update:modelValue', iso);
    pickerValue.value = date;
    return;
  }

  emit('update:modelValue', undefined);
};

watch(pickerValue, (val) => {
  if (props.disabled) {
    return;
  }

  if (!val) {
    emit('update:modelValue', undefined);
    rawDigits.value = '';
    errorMessage.value = undefined;
    return;
  }

  const iso = val.format('YYYY-MM-DD');
  emit('update:modelValue', iso);
  rawDigits.value = val.format('DDMMYYYY');
  errorMessage.value = undefined;
});

watch(
  () => props.modelValue,
  (val) => {
    if (!val) {
      rawDigits.value = '';
      pickerValue.value = undefined;
      errorMessage.value = undefined;
      return;
    }

    const d = dayjs(val, 'YYYY-MM-DD', true);

    if (d.isValid()) {
      pickerValue.value = d;
      rawDigits.value = d.format('DDMMYYYY');
      errorMessage.value = undefined;
    }
  },
  { immediate: true },
);
</script>
