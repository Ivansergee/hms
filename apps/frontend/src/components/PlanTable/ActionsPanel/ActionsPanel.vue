<template>
  <a-row
    justify="space-around"
    :gutter="[8, 8]"
  >
    <a-col>
      <DateNavigator
        :current-date="currentDate"
        @select="onDateSelect"
      />
    </a-col>
    <a-col>
      <ActionButtons
        :current-date="currentDate"
        @date-select="onDateSelect"
        @create="$emit('create')"
      />
    </a-col>
  </a-row>
</template>
<script setup lang="ts">
import dayjs from 'dayjs';
import { type PropType } from 'vue';

defineProps({
  currentDate: {
    type: Object as PropType<dayjs.Dayjs>,
    required: true,
  },
});
const emit = defineEmits<{
  navigate: [date: dayjs.Dayjs];
  create: [];
}>();

const onDateSelect = (date: dayjs.Dayjs): void => {
  emit('navigate', date);
};
</script>
<style scoped>

</style>
