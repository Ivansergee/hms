<template>
  <a-space>
    <a-button
      :icon="h(FilterOutlined)"
      :title="t('filters')"
    />
    <a-button
      :icon="h(SearchOutlined)"
      :title="t('search')"
    />
    <a-popover
      v-model:open="isCalendarOpen"
      trigger="click"
      placement="bottomLeft"
    >
      <template #content>
        <div class="calendar-container">
          <a-calendar
            v-model:value="selectedDate"
            :fullscreen="false"
            @select="onDateSelect"
          />
        </div>
      </template>
      <a-button
        :icon="h(CalendarOutlined)"
        :title="t('goToDate')"
      />
    </a-popover>
    <a-button
      :icon="h(PlusOutlined)"
      :title="t('newBooking')"
      @click="emit('create')"
    />
  </a-space>
</template>
<script setup lang="ts">
import { h, ref, watch } from 'vue';

import {
  CalendarOutlined,
  FilterOutlined,
  PlusOutlined,
  SearchOutlined,
} from '@ant-design/icons-vue';
import dayjs from 'dayjs';
import { type SelectInfo } from 'ant-design-vue/es/calendar/generateCalendar';
import { useScopedI18n } from '@/composables/useScopedI18n.ts';

interface Props {
  currentDate: dayjs.Dayjs;
}

defineOptions({ name: 'ActionButtons' });
const { t } = useScopedI18n();

const props = defineProps<Props>();
const emit = defineEmits<{(event: 'date-select', date: dayjs.Dayjs): void;
  (event: 'create'): void;
}>();

const isCalendarOpen = ref<boolean>(false);
const selectedDate = ref<dayjs.Dayjs>(props.currentDate);

const onDateSelect = (date: unknown, info: SelectInfo): void => {
  if (info.source !== 'date') {
    return;
  }
  isCalendarOpen.value = false;
  emit('date-select', date as dayjs.Dayjs);
};

watch(() => props.currentDate, (newDate) => {
  selectedDate.value = newDate;
});
</script>
<style scoped>
.calendar-container {
  width: 300px;
}
</style>
