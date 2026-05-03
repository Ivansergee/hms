<template>
  <a-form-item
    :label="label"
    :validate-status="validateStatus"
    :help="errorMessage"
  >
    <a-input
      :value="displayValue"
      :placeholder="t('inputPlaceholder')"
      @input="onInput"
    >
      <template #suffix>
        <calendar-outlined
          style="cursor: pointer"
          @click="openPicker = true"
        />
      </template>
    </a-input>

    <a-date-picker
      v-model:value="pickerValue"
      :open="openPicker"
      style="position: absolute; opacity: 0; pointer-events: none"
      @open-change="(val) => (openPicker = val)"
    />
  </a-form-item>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import dayjs, { Dayjs } from 'dayjs';
import { CalendarOutlined } from '@ant-design/icons-vue';
import { useScopedI18n } from '@/composables/useScopedI18n.ts';

const props = defineProps<{
  modelValue?: string;
  label?: string;
}>();

const emit = defineEmits<{(e: 'update:modelValue', value?: string): void;
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

const onInput = (e: Event) => {
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
