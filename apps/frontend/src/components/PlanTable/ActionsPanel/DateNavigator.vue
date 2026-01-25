<template>
<a-space-compact>
  <a-button
    type="text"
    :icon="h(DoubleLeftOutlined)"
    @click="emit('select', currentDate.subtract(1, 'month'))"
  />
  <a-button
    type="text"
    :icon="h(LeftOutlined)"
    @click="emit('select', currentDate.subtract(1, 'week'))"
  />
  <a-button
    type="text"
    @click="emit('select', dayjs())"
  >{{ t('today') }}</a-button>
  <a-button
    type="text"
    :icon="h(RightOutlined)"
    @click="emit('select', currentDate.add(1, 'week'))"
  />
  <a-button
    type="text"
    :icon="h(DoubleRightOutlined)"
    @click="emit('select', currentDate.add(1, 'month'))"
  />
</a-space-compact>
</template>
<script setup lang="ts">
import dayjs from "dayjs";
import { useScopedI18n } from "@/composables/useScopedI18n.ts";
import { h } from "vue";
import {
  DoubleLeftOutlined,
  DoubleRightOutlined,
  LeftOutlined,
  RightOutlined
} from "@ant-design/icons-vue";

interface Props {
  currentDate: dayjs.Dayjs;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (event: 'select', date: dayjs.Dayjs): void;
}>();

defineOptions({ name: 'DateNavigator' });
const { t } = useScopedI18n();
</script>
<style scoped>

</style>
