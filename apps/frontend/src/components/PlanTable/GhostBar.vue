<template>
<div
  class="ghost-bar"
  :style="getGhostBarStyle"
>
  Booking
</div>
</template>
<script setup lang="ts">
import { computed, type StyleValue, watch } from "vue";
import { CELL_WIDTH, ResizeDirection } from "@/utils/planTableUtils.ts";
import { getDaysRange, getDifferenceInDays } from "@/utils/dateTimeUtils.ts";

export interface GhostBooking {
  id?: number;
  roomId: number;
  start: string;
  end: string;
}

interface Props {
  data?: GhostBooking;
  direction?: ResizeDirection;
  xOffset: number;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (event: "ghostBarRange", value: string[]): void;
}>();

const resizeDirection = computed(() => {
  if (!props.direction) {
    return props.xOffset < 0 ? ResizeDirection.LEFT : ResizeDirection.RIGHT;
  } else {
    return props.direction;
  }
});

const getGhostBarStyle = computed((): StyleValue => {
  if (!props.data) {
    return;
  }

  const initialSpan = (getDifferenceInDays(props.data.end, props.data.start) + 1) * CELL_WIDTH;

  return resizeDirection.value === ResizeDirection.RIGHT
    ? { left: 0, width: `${initialSpan + props.xOffset}px` }
    : { right: 0, width: `${initialSpan - props.xOffset}px` };
});

const ghostBookingRange = computed(() => {
  if (!props.data) {
    return [];
  }
  let start = props.data.start;
  let end = props.data.end;
  if (resizeDirection.value === ResizeDirection.LEFT) {
    start += props.xOffset / CELL_WIDTH;
  }
  if (resizeDirection.value === ResizeDirection.RIGHT) {
    end += props.xOffset / CELL_WIDTH;
  }
  return getDaysRange(start, end);
});

watch(ghostBookingRange, (newRange) => {
    emit('ghostBarRange', newRange);
  });
</script>
<style scoped>
.ghost-bar {
  position: absolute;
  top: 0;
  height: 100%;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;
  z-index: 15;
  border-radius: 4px;
  background-color: rgb(121, 121, 121);
}
</style>
