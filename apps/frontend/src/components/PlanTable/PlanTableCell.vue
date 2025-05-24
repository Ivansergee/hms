<template>
<div
  class="cell"
  @mousedown="onCellMouseDown"
  @dragover.prevent
  @dragstart.prevent
  @dragenter="onDragEnterCell"
  @drop="onDragEnd"
  @mouseenter="onMouseEnterCell"
  @mouseleave="onMouseLeaveCell"
>
  <BookingBar
    v-if="booking?.isStartDay"
    :booking="booking"
    :is-creating="isCreating"
    :on-confirm="onConfirm"
    :on-create="onCreate"
    @bar-clicked="$emit('bar-clicked', booking.id)"
    @restore="$emit('restore', booking.id)"
    @created="onBookingCreated"
  />
</div>
</template>
<script setup lang="ts">
import { computed, ref } from "vue";
import { useBookingStore } from "@/stores/bookingStore.ts";
import { type BookingWithFlags } from "@/types/Booking.ts";
import { getInitialBookingData } from "@/utils/planTableUtils.ts";
import { useHighlightStore } from "@/stores/highlightStore.ts";
import type { BookingShort, BookingFormState } from "@shared/types/booking.ts";
import { useEventListener } from "@vueuse/core";
import { addDays, getDaysRange, getDifferenceInDays } from "@/utils/dateTimeUtils.ts";

interface Props {
  roomId: number;
  day: string;
  onCreate: (createFormState: BookingFormState) => Promise<void>;
  onConfirm: (after: BookingShort, before: BookingShort) => Promise<void>;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (event: 'bar-clicked', bookingId: number): void;
  (event: 'restore', bookingId: number): void;
}>();

const bookingStore = useBookingStore();
const highlightStore = useHighlightStore();

const isCreating = ref<boolean>(false);

const booking = computed<BookingWithFlags | undefined>(()  => {
  if (isCreating.value) {
    return getInitialBookingData(props.day, props.roomId);
  } else {
    return bookingStore.bookingsMap[props.roomId]?.[props.day];
  }
});

const onMouseEnterCell = (): void => {
  if (booking.value || highlightStore.isEditMode) {
    return;
  }

  highlightStore.highlightedDays = [props.day];
  highlightStore.highlightedRoom = props.roomId;
};

const onMouseLeaveCell = (): void => {
  if (!highlightStore.isEditMode) {
    highlightStore.highlightedDays = [];
    highlightStore.highlightedRoom = undefined;
  }
};

let mousemoveCleanup: (() => void) | undefined;
let mouseupCleanup: (() => void) | undefined;
let initialX = 0;

const onCellMouseDown = (e: MouseEvent): void => {
  if (booking.value) {
    return;
  }
  initialX = e.clientX;
  mousemoveCleanup = useEventListener(window, 'mousemove', onMouseMove);
  mouseupCleanup = useEventListener(window, 'mouseup', onMouseUp);
};

const onMouseMove = (e: MouseEvent): void => {
  const movement = e.clientX - initialX;
  if (movement > 15) {
    isCreating.value = true;
    if (mousemoveCleanup) {
      mousemoveCleanup();
    }
  }
};

const onBookingCreated = (): void => {
  isCreating.value = false;
};

const onMouseUp = async (): Promise<void> => {
  if (mousemoveCleanup) {
    mousemoveCleanup();
  }
  if (mouseupCleanup) {
    mouseupCleanup();
  }
};

const onDragEnterCell = (): void => {
  if (!bookingStore.draggedBooking) {
    return;
  }
  const { clickedDay, ...sourceBooking } = bookingStore.draggedBooking;

  highlightStore.highlightedRoom = props.roomId;

  const daysOffset = getDifferenceInDays(clickedDay, props.day);
  highlightStore.highlightedDays = getDaysRange(
    addDays(sourceBooking.start, daysOffset),
    addDays(sourceBooking.end, daysOffset),
  );
};

const onDragEnd = async (): Promise<void> => {
  if (!bookingStore.draggedBooking) {
    return;
  }

  const { clickedDay, ...sourceBooking } = bookingStore.draggedBooking;
  const daysOffset = getDifferenceInDays(clickedDay, props.day);

  const changedBooking = {
    ...sourceBooking,
    roomId: props.roomId,
    start: addDays(sourceBooking.start, daysOffset),
    end: addDays(sourceBooking.end, daysOffset),
  };

  await props.onConfirm(changedBooking, sourceBooking);

  bookingStore.draggedBooking = undefined;
};
</script>
<style scoped>
.cell {
  min-height: 40px;
  position: relative;
  /* Prevents accidental text selection and dragging */
  user-select: none;
  -webkit-user-drag: none;
}
</style>
