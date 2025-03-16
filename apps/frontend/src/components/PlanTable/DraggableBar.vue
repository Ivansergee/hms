<template>
  <div
    class="draggable-bar"
    :class="{ hidden: isHidden }"
    :style="getBookingBarStyle"
    :draggable="isDraggable"
    @dragstart.stop="onDragStart"
    @mousedown="handleMouseDown"
    @click="onBarClick"
  >
    <div
      class="resize-handle left"
      @dragstart.stop
      @mousedown="handleResizeStart(ResizeDirection.LEFT)"
    ></div>
    Booking
    <div
      class="resize-handle right"
      @dragstart.stop
      @mousedown="handleResizeStart(ResizeDirection.RIGHT)"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, type StyleValue } from "vue";
import { type Booking } from "@/types/Booking.ts";
import { CELL_WIDTH, ResizeDirection } from "@/utils/planTableUtils.ts";
import { getDifferenceInDays, getTimeFromDate, timeToPercentOfDay } from "@/utils/dateTimeUtils.ts";

interface Props {
  booking: Booking;
  isDraggable: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (event: 'resize', payload: { booking: Booking, direction: ResizeDirection }): void;
  (event: 'bar-clicked', booking: Booking): void;
  (event: 'drag-start', payload: { booking: Booking, clickedCellIndex: number }): void;
}>();

const isHidden = ref<boolean>(false);
const mouseDownCellIndex = ref<number>(0);
const startOffset = ref<number>(0);
const endOffset = ref<number>(0);
const barWidth = ref<number>(0);

const handleResizeStart = (direction: ResizeDirection): void => {
  emit('resize', { booking: props.booking, direction });
};

const getBookingBarStyle = computed((): StyleValue => {
  return {
    width: `${barWidth.value}px`,
    marginLeft: `${startOffset.value}px`,
    marginRight: `${endOffset.value}px`,
  };
});

const daysSpan = computed(() => {
  return getDifferenceInDays(props.booking.end, props.booking.start) + 1;
});

const onBarClick = (): void => {
  emit('bar-clicked', props.booking);
};

const onDragStart = (): void => {
  isHidden.value = true;
  emit('drag-start', { booking: props.booking, clickedCellIndex: mouseDownCellIndex.value });
};

const handleMouseDown = (e: MouseEvent) => {
  if (e.offsetX < (CELL_WIDTH - startOffset.value)) {
    mouseDownCellIndex.value = 0;
  } else if (e.offsetX > (barWidth.value - (CELL_WIDTH - endOffset.value))) {
    mouseDownCellIndex.value = daysSpan.value - 1;
  } else {
    mouseDownCellIndex.value = Math.floor((e.offsetX + startOffset.value) / CELL_WIDTH);
  }
};

onMounted(() => {
  const fullBarWidth = daysSpan.value * CELL_WIDTH;
  const widthWithoutStartAndEnd = fullBarWidth - (CELL_WIDTH * 2);

  startOffset.value = timeToPercentOfDay(getTimeFromDate(props.booking.start)) * CELL_WIDTH;
  endOffset.value = CELL_WIDTH - (timeToPercentOfDay(getTimeFromDate(props.booking.end)) * CELL_WIDTH);
  barWidth.value = widthWithoutStartAndEnd + (CELL_WIDTH - startOffset.value) + (CELL_WIDTH - endOffset.value);
});
</script>

<style scoped>
.draggable-bar {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;
  z-index: 10;
  cursor: pointer;
  border-radius: 4px;
  background-color: #1890ff;
}

.draggable-bar.hidden {
  transition: 0.01s;
  transform: translateX(-9999px);
}

.resize-handle {
  position: absolute;
  width: 6px;
  height: 100%;
  background-color: #1890ff;
  cursor: ew-resize;
  top: 0;
  border-radius: 4px;
}

.resize-handle.left {
  left: 0;
}

.resize-handle.right {
  right: 0;
}
</style>
