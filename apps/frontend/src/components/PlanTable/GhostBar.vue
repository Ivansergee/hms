<template>
<div
  class="ghost-bar"
  :style="getGhostBarStyle"
>
  Booking
</div>
</template>
<script setup lang="ts">
import { computed, type StyleValue } from "vue";
import { CELL_WIDTH, ResizeDirection } from "@/components/PlanTable/planTableUtils.ts";
import { type Booking } from "@/types/Booking.ts";

interface Props {
  booking?: Booking;
  direction?: ResizeDirection;
}

const props = defineProps<Props>();

const getGhostBarStyle = computed((): StyleValue => {
  if (!props.booking || !props.direction) {
    return;
  }

  const daysSpan = props.booking.end - props.booking.start + 1
  const width = daysSpan * CELL_WIDTH;

  return props.direction === ResizeDirection.RIGHT
    ? { left: 0, width: `${width}px` }
    : { right: 0, width: `${width}px` };
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
