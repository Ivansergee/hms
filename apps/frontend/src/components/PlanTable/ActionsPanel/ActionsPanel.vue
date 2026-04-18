<template>
  <a-row justify="space-around" :gutter="[8, 8]">
    <a-col>
      <DateNavigator
        :currentDate="currentDate"
        @select="onDateSelect"
      />
    </a-col>
    <a-col>
      <ActionButtons
        :currentDate="currentDate"
        @date-select="onDateSelect"
        @create="$emit('create')"
      />
    </a-col>
  </a-row>
</template>
<script setup lang="ts">
import dayjs from "dayjs";

interface Props {
  currentDate: dayjs.Dayjs;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (event: 'navigate', date: dayjs.Dayjs): void;
  (event: 'create'): void;
}>();

const onDateSelect = (date: dayjs.Dayjs): void => {
  emit('navigate', date);
};
</script>
<style scoped>

</style>
