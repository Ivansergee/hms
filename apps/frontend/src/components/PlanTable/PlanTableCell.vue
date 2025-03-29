<template>
<div
  class="cell"
  @mousedown="onCellMouseDown"
  @dragover.prevent
  @dragstart.prevent
  @mouseenter="onMouseEnterCell"
  @mouseleave="onMouseLeaveCell"
>
  <div
    v-if="booking?.isStartDay"
    class="draggable-bar"
    :class="{ hidden: isDraggingComputed || isResizingComputed }"
    :style="bookingBarStyle"
    :draggable="!ghostBooking"
    @click="onBarClick"
    @dragstart.stop="onDragStart"
    @mousedown="onBarMouseDown"
    @mouseenter="onMouseEnterBar"
  >
    <div
      class="resize-handle left"
      @dragstart.stop
      @mousedown="onResizeStart(ResizeDirection.LEFT)"
    ></div>
    Booking
    <div
      class="resize-handle right"
      @dragstart.stop
      @mousedown="onResizeStart(ResizeDirection.RIGHT)"
    ></div>
  </div>
  <div
    v-if="isGhostBarShown"
    class="ghost-bar"
    :class="resizeDirection"
    :style="{
    '--bar-width': `${barWidth}px`,
    '--x-offset': `${xOffset}px`,
    '--visible-length': `${visibleLength}px`,
    '--start-offset': `${startOffset}px`,
    '--end-offset': `${endOffset}px`,
    '--ghost-bar-right': ghostBarRight,
  }"
  >
    Booking
  </div>
</div>
</template>
<script setup lang="ts">
import { computed, type CSSProperties, onUnmounted, ref, watch } from "vue";
import { useBookingStore } from "@/stores/bookingStore.ts";
import type { Booking, BookingWithFlags, GhostBooking } from "@/types/Booking.ts";
import {
  addDays,
  getDaysRange,
  getDifferenceInDays, getMaxDateByDay, getMinDateByDay,
  getTimeFromDate, timeToPercentOfDay
} from "@/utils/dateTimeUtils.ts";
import { CELL_WIDTH, getNewBooking, ResizeDirection } from "@/utils/planTableUtils.ts";
import { useHighlightStore } from "@/stores/highlightStore.ts";
import dayjs from "dayjs";

interface Props {
  roomId: number;
  day: string;
  visibleStartDate: dayjs.Dayjs;
  visibleEndDate: dayjs.Dayjs;
  xOffset: number;
  isCreating: boolean;
  isDragging: boolean;
  isResizing: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (event: 'bar-clicked', booking: Booking): void;
  (event: 'drag-start', payload: { booking: BookingWithFlags, dragStartDay: string }): void;
  (event: 'resize-start'): void;
  (event: 'resize-end', booking: Booking | undefined): void;
}>();

const bookingStore = useBookingStore();
const highlightStore = useHighlightStore();

const ghostBooking = ref<GhostBooking>();
const resizeDirection = ref<ResizeDirection>();
const mouseDownDay = ref<string>();
const isDraggingInner = ref<boolean>(false);
const isResizingInner = ref<boolean>(false);

const isDraggingComputed = computed<boolean>(() => {
  return props.isDragging && isDraggingInner.value;
});

const isResizingComputed = computed<boolean>(() => {
  return props.isResizing && isResizingInner.value;
});

const booking = computed<BookingWithFlags | undefined>(()  => {
  return bookingStore.bookingsMap[props.roomId]?.[props.day];
});

const visibleLength = computed<number>(() => {
  if (!booking.value) {
    return 0;
  }

  return getDifferenceInDays(
    getMaxDateByDay(booking.value.start, props.visibleStartDate),
    getMinDateByDay(booking.value.end, props.visibleEndDate),
  );
});

const startOffset = computed<number>(() => {
  if (!booking.value || props.visibleStartDate.isAfter(booking.value.start, 'd')) {
    return 0;
  }
  return timeToPercentOfDay(getTimeFromDate(booking.value.start)) * CELL_WIDTH
});

const endOffset = computed<number>(() => {
  if (!booking.value || props.visibleEndDate.isBefore(booking.value.end, 'd')) {
    return 0;
  }
  return CELL_WIDTH - (timeToPercentOfDay(getTimeFromDate(booking.value.end)) * CELL_WIDTH);
});

const barWidth = computed<number>(() => {
  const fullBarWidth = (visibleLength.value + 1) * CELL_WIDTH;
  const widthWithoutStartAndEnd = fullBarWidth - (CELL_WIDTH * 2);

  return widthWithoutStartAndEnd + (CELL_WIDTH - startOffset.value) + (CELL_WIDTH - endOffset.value);
});

const bookingRange = computed<string[]>(() => {
  if (!booking.value) {
    return [];
  }
  return getDaysRange(booking.value.start, booking.value.end);
});

const bookingBarStyle = computed<CSSProperties>(() => {
  return {
    width: `${barWidth.value}px`,
    marginLeft: `${startOffset.value}px`,
    marginRight: `${endOffset.value}px`,
  };
});

const isGhostBarShown = computed<boolean>(() => {
  return props.isCreating || isResizingComputed.value;
});

const ghostBarRight = computed(() =>
  resizeDirection.value === ResizeDirection.RIGHT ? 'unset' : `-${visibleLength.value * CELL_WIDTH}px`
);


const onMouseEnterCell = (): void => {
  if (booking.value || props.isResizing) {
    return;
  }

  highlightStore.highlightedDays = [props.day];
  highlightStore.highlightedRoom = props.roomId;
};

const onMouseEnterBar = (): void => {
  if (booking.value && !isResizingComputed.value) {
    highlightStore.highlightedDays = getDaysRange(booking.value.start, booking.value.end);
    highlightStore.highlightedRoom = booking.value.roomId;
  }
};

const onMouseLeaveCell = (): void => {
  if (!props.isResizing) {
    highlightStore.highlightedDays = [];
    highlightStore.highlightedRoom = undefined;
  }
};

const onBarClick = (): void => {
  if (booking.value) {
    emit('bar-clicked', booking.value);
  }
};

const onCellMouseDown = (): void => {
  if (!booking.value) {
    ghostBooking.value = getNewBooking(props.roomId, props.day);
  }
};

const onBarMouseDown = (e: MouseEvent) => {
  if (!booking.value) {
    return;
  }

  let mouseDownCellIndex;
  if (e.offsetX < (CELL_WIDTH - startOffset.value)) {
    mouseDownCellIndex = 0;
  } else if (e.offsetX > (barWidth.value - (CELL_WIDTH - endOffset.value))) {
    mouseDownCellIndex = visibleLength.value - 1;
  } else {
    mouseDownCellIndex = Math.floor((e.offsetX + startOffset.value) / CELL_WIDTH);
  }

  mouseDownDay.value = bookingRange.value[booking.value.startDayIndex + mouseDownCellIndex];
};

const onDragStart = (): void => {
  if (booking.value && mouseDownDay.value) {
    isDraggingInner.value = true;
    emit('drag-start', { booking: booking.value, dragStartDay: mouseDownDay.value });
  }
};

const onResizeStart = (direction: ResizeDirection) => {
  if (!booking.value) {
    return;
  }

  isResizingInner.value = true;
  resizeDirection.value = direction;
  ghostBooking.value = {
    id: booking.value.id,
    roomId: booking.value.roomId,
    start: booking.value.start,
    end: booking.value.end,
  };

  window.addEventListener("mouseup", onResizeEnd);

  emit('resize-start');
};

const getResizedBooking = (): Booking | undefined => {
  if (!booking.value) {
    return;
  }

  return {
    ...booking.value,
    start: resizeDirection.value === ResizeDirection.RIGHT
      ? booking.value.start
      : addDays(booking.value.start, (props.xOffset / CELL_WIDTH)),
    end: resizeDirection.value === ResizeDirection.RIGHT
      ? addDays(booking.value.end, (props.xOffset / CELL_WIDTH))
      : booking.value.end,
  };
};

const onResizeEnd = () => {
  isResizingInner.value = false;
  isDraggingInner.value = false;
  window.removeEventListener("mouseup", onResizeEnd);
  emit('resize-end', getResizedBooking());
};

const totalResizedWidth = computed(() => {
  return barWidth.value + (resizeDirection.value === ResizeDirection.RIGHT ? props.xOffset : -props.xOffset);
});

const resizedCellCount = computed(() => {
  return Math.floor((totalResizedWidth.value + startOffset.value) / CELL_WIDTH);
});

watch(resizedCellCount, (newCount, oldCount) => {
  if (newCount !== oldCount && isResizingComputed.value) {
    const resizedBooking = getResizedBooking();
    if (resizedBooking) {
      highlightStore.highlightedDays = getDaysRange(resizedBooking?.start, resizedBooking?.end);
    }
  }
});

onUnmounted(() => {
  window.removeEventListener("mouseup", onResizeEnd);
});
</script>
<style scoped>
.cell {
  min-height: 40px;
  position: relative;
  /* Prevents accidental text selection and dragging */
  user-select: none;
  -webkit-user-drag: none;
}

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

.ghost-bar {
  --bar-width: 0px;
  --x-offset: 0px;
  --visible-length: 0px;
  --start-offset: 0px;
  --end-offset: 0px;
  --ghost-bar-right: 0px;
  margin-left: var(--start-offset);
  margin-right: var(--end-offset);
  right: var(--ghost-bar-right);
  transition: width 0.05s;
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

.ghost-bar.right {
  left: 0;
  width: calc(var(--bar-width) + var(--x-offset));
}

.ghost-bar.left {
  width: calc(var(--bar-width) - var(--x-offset));
}
</style>
