<template>
  <a-space-compact>
    <a-button
      type="text"
      :icon="h(DoubleLeftOutlined)"
      :title="t('previousMonth')"
      @click="emit('select', currentDate.subtract(1, 'month'))"
    />
    <a-button
      type="text"
      :icon="h(LeftOutlined)"
      :title="t('previousWeek')"
      @click="emit('select', currentDate.subtract(1, 'week'))"
    />
    <a-button
      type="text"
      @click="emit('select', dayjs())"
    >
      {{ t('today') }}
    </a-button>
    <a-button
      type="text"
      :icon="h(RightOutlined)"
      :title="t('nextWeek')"
      @click="emit('select', currentDate.add(1, 'week'))"
    />
    <a-button
      type="text"
      :icon="h(DoubleRightOutlined)"
      :title="t('nextMonth')"
      @click="emit('select', currentDate.add(1, 'month'))"
    />
  </a-space-compact>
</template>
<script setup lang="ts">
import dayjs from 'dayjs';
import { useScopedI18n } from '@/composables/useScopedI18n.ts';
import { h, type PropType } from 'vue';
import {
  DoubleLeftOutlined,
  DoubleRightOutlined,
  LeftOutlined,
  RightOutlined,
} from '@ant-design/icons-vue';

defineProps({
  currentDate: {
    type: Object as PropType<dayjs.Dayjs>,
    required: true,
  },
});
const emit = defineEmits<{
  select: [date: dayjs.Dayjs];
}>();

defineOptions({ name: 'DateNavigator' });
const { t } = useScopedI18n();
</script>
<style scoped>

</style>
