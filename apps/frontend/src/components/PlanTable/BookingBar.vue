<template>
<div
  class="booking-bar"
  :class="{
    hidden: isDragging,
    creating: isCreating,
  }"
  :style="{
    '--bar-width': `${barWidthResized}px`,
    '--min-bar-width': `${MIN_BAR_WIDTH}px`,
    '--start-offset': `${startOffsetResized}px`,
    '--max-start-offset': `${maxStartOffset}px`,
  }"
  :draggable="!isResizing && !isCreating"
  @click="onBarClick"
  @mouseenter="onMouseEnterBar"
  @dragstart.stop="onDragStart"
>
  <div
    v-if="!isCreating"
    class="resize-handle left"
    @dragstart.stop
    @mousedown="onResizeStart(ResizeDirection.LEFT)"
  ></div>
  {{ barTitle }}
  <div
    v-if="!isCreating"
    class="resize-handle right"
    @dragstart.stop
    @mousedown="onResizeStart(ResizeDirection.RIGHT)"
  ></div>
</div>
</template>
<script setup lang="ts">
import { CELL_WIDTH, ResizeDirection } from "@/utils/planTableUtils.ts";
import type { Booking, BookingFormState } from "@shared/types/booking.ts";
import { computed, ref, watch } from "vue";
import {
  addDays,
  getDaysRange,
  getDifferenceInMinutes,
  getMinutesFromDayStart, subtractDays
} from "@/utils/dateTimeUtils.ts";
import { useHighlightStore } from "@/stores/highlightStore.ts";
import { useEventListener } from "@vueuse/core";
import dayjs from "dayjs";

interface Props {
  booking: Booking;
  isCreating: boolean;
  onCreate: (createFormState: BookingFormState) => Promise<void>;
  onConfirm: (after: Booking | undefined, before: Booking | undefined) => Promise<void>;
}

const MINUTES_IN_DAY = 1440;
const MINUTES_PER_PIXEL = MINUTES_IN_DAY / CELL_WIDTH;
const MIN_BAR_WIDTH = Math.round(CELL_WIDTH / 2);


const props = defineProps<Props>();
const emit = defineEmits<{
  (event: 'drag-start', clickedDate: string): void;
  (event: 'bar-clicked'): void;
  (event: 'created'): void;
  (event: 'restore'): void;
}>();

const highlightStore = useHighlightStore();

const resizeDirection = ref<ResizeDirection>(ResizeDirection.RIGHT);
const isResizing = ref<boolean>(false);
const isDragging = ref<boolean>(false);

const barTitle = computed<string | undefined>(() => {
  return props.isCreating
    ? 'New booking'
    :`${props.booking.mainGuest.firstName} ${props.booking.mainGuest.lastName}`;
});

const barWidthInitial = computed<number>(() => {
  const bookingLengthInMinutes = getDifferenceInMinutes(props.booking.start, props.booking.end);
  return Math.round(bookingLengthInMinutes / MINUTES_PER_PIXEL);
})

const barWidthChange = ref<number>(0);

const barWidthResized = computed<number>(() => {
  return barWidthInitial.value + barWidthChange.value;
});

const startOffsetInitial = computed<number>(() => {
  return Math.round(getMinutesFromDayStart(props.booking.start) / MINUTES_PER_PIXEL);
})

const startOffsetChange = ref<number>(0);

const startOffsetResized = computed<number>(() => {
  return startOffsetInitial.value + startOffsetChange.value;
});

const maxStartOffset = computed<number>(() => {
  return startOffsetInitial.value + (barWidthInitial.value - MIN_BAR_WIDTH);
});

const initialDaysCount = computed<number>(() => {
  return Math.floor((startOffsetInitial.value + barWidthInitial.value) / CELL_WIDTH);
});

const resizeDaysCount = computed<number>(() => {
  return Math.floor((startOffsetInitial.value + barWidthResized.value) / CELL_WIDTH);
});

const daysCountChange = computed<number>(() => {
  return resizeDaysCount.value - initialDaysCount.value;
});

const resizedBooking = computed<Booking>(() => {
  return {
    ...props.booking,
    start: resizeDirection.value === ResizeDirection.RIGHT
      ? props.booking.start
      : subtractDays(props.booking.start, daysCountChange.value),
    end: resizeDirection.value === ResizeDirection.RIGHT
      ? addDays(props.booking.end, daysCountChange.value)
      : props.booking.end,
  };
});

const initialBookingRange = computed<string[]>(() => {
  return getDaysRange(props.booking.start, props.booking.end);
});

const resizedBookingRange = computed<string[]>(() => {
  return getDaysRange(resizedBooking.value.start, resizedBooking.value.end);
});

let mouseupCleanup: (() => void) | undefined;
let mousemoveCleanup: (() => void) | undefined;

const onMouseUp = async (): Promise<void> => {
  if (mouseupCleanup) {
    mouseupCleanup();
  }
  if (mousemoveCleanup) {
    mousemoveCleanup();
  }

  document.body.style.cursor = '';
  highlightStore.isEditMode = false;
  isDragging.value = false;
  isResizing.value = false;

  if (props.isCreating) {
    const { start, end, roomId } = resizedBooking.value;
    await props.onCreate({
      id: props.booking.id,
      roomId: roomId,
      start: start,
      end: end,
      guests: [],
      currentStep: 2,
    });
    emit('created');
  } else if (isResizing.value) {
    await props.onConfirm(resizedBooking.value, props.booking);
  }

  barWidthChange.value = 0;
  startOffsetChange.value = 0;
};

const onMouseMove = (e: MouseEvent) => {
  if (resizeDirection.value === ResizeDirection.RIGHT) {
    barWidthChange.value += e.movementX;
  } else if (resizeDirection.value === ResizeDirection.LEFT) {
    barWidthChange.value -= e.movementX;
    startOffsetChange.value += e.movementX;
  }
};

const onResizeStart = (direction: ResizeDirection) => {
  isResizing.value = true;
  resizeDirection.value = direction;
  highlightStore.isEditMode = true;
  document.body.style.cursor = 'ew-resize';
  mousemoveCleanup = useEventListener(window, 'mousemove', onMouseMove);
  mouseupCleanup = useEventListener(window, 'mouseup', onMouseUp);
};

const onDragStart = (e: DragEvent): void => {
  const rect = (e.target as HTMLElement).getBoundingClientRect();
  const clickOffset = e.clientX - rect.left;
  const totalOffset = startOffsetResized.value + clickOffset;
  const offsetInMinutes = totalOffset * MINUTES_PER_PIXEL;
  const clickedDay = dayjs(props.booking.start).startOf('day').add(offsetInMinutes, 'minute')
    .format('YYYY-MM-DD');

  isDragging.value = true;

  mouseupCleanup = useEventListener(window, 'mouseup', onMouseUp);
  emit('drag-start', clickedDay);
};

const onMouseEnterBar = (): void => {
  if (!highlightStore.isEditMode) {
    highlightStore.highlightedDays = props.isCreating
      ? resizedBookingRange.value : initialBookingRange.value;
    highlightStore.highlightedRoom = props.booking.roomId;
  }
};

const onBarClick = (): void => {
  if (props.isCreating) {
    emit('restore');
  } else if (!isResizing.value) {
    emit('bar-clicked');
  }
};

watch(resizedBookingRange, (newRange) => {
  highlightStore.highlightedDays = newRange;
})

watch(() => props.isCreating, (isCreating) => {
  if (isCreating) {
    onResizeStart(ResizeDirection.RIGHT)
  }
}, { immediate: true });
</script>
<style scoped>
.booking-bar {
  --bar-width: 0px;
  --min-bar-width: 0px;
  --start-offset: 0px;
  --max-start-offset: 0px;
  width: max(var(--bar-width), var(--min-bar-width));
  left: min(var(--start-offset), var(--max-start-offset));
  position: absolute;
  top: 0;
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

.booking-bar.hidden {
  transition: 0.01s;
  transform: translateX(-9999px);
}

.booking-bar.creating {
  color: black;
  border-style: dashed;
  border-color: #1890ff;
  background-color: #2995f96b;
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
