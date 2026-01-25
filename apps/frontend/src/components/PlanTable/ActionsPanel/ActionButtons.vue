<template>
  <a-space>
    <a-button
      :icon="h(FilterOutlined)"
    />
    <a-button
      :icon="h(SearchOutlined)"
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
      <a-button :icon="h(CalendarOutlined)"/>
    </a-popover>
    <a-button
      :icon="h(PlusOutlined)"
    />
  </a-space>
</template>
<script setup lang="ts">
import { h, ref, watch } from "vue";

import {
  CalendarOutlined,
  FilterOutlined,
  PlusOutlined,
  SearchOutlined
} from "@ant-design/icons-vue";
import dayjs from "dayjs";
import { type SelectInfo } from "ant-design-vue/es/calendar/generateCalendar";

interface Props {
  currentDate: dayjs.Dayjs;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (event: 'date-select', date: dayjs.Dayjs): void;
}>();

const isCalendarOpen = ref<boolean>(false);
const selectedDate = ref<dayjs.Dayjs>(props.currentDate);

const onDateSelect = (date: dayjs.Dayjs, info: SelectInfo): void => {
  if (info.source !== 'date') {
    return;
  }
  isCalendarOpen.value = false;
  emit('date-select', date);
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
