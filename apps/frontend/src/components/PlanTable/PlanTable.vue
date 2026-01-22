<template>
  <div class="calendar-root">
    <div class="header-row">
      <div class="corner-cell"></div>

      <div class="header-scroll" ref="header">
        <div class="header-inner">
          <div class="months-row">
            <div
              class="cell month-header"
              v-for="month in months"
              :key="month.key"
              :style="{ width: `${month.days * CELL_WIDTH}px` }"
            >
              {{ month.label }}
            </div>
          </div>

          <div class="days-row">
            <div
              class="cell day-header"
              v-for="day in days"
              :key="day.format()"
              :class="{ highlighted: highlightedDays.includes(day.format('YYYY-MM-DD')) }"
            >
              {{ day.format('MMM D') }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="body-row">
      <div
        class="rooms-scroll"
        ref="rooms"
        :style="{ paddingBottom: `${scrollbarHeight}px` }"
      >
        <div
          class="room-cell"
          v-for="room in roomStore.rooms"
          :key="room.id"
          :class="{ highlighted: highlightedRoomId === room.id }"
        >
          {{ room.name }}
        </div>
      </div>
      <div
        class="grid-scroll"
        ref="grid-scroll"
        @scroll="onScroll"
      >
        <div
          class="grid-inner"
          ref="grid"
          @mouseleave="onMouseLeaveGrid"
        >
          <div
            class="row"
            v-for="room in roomStore.rooms"
            :key="room.id"
          >
            <div
              class="cell day-cell"
              v-for="day in days"
              :key="day.format()"
              @mouseover="onMouseOverCell(room, day)"
            ></div>
          </div>

          <div
            ref="overlay"
            class="overlay-container"
          >
            <BookingBar
              v-for="data in layoutBookings"
              :key="data.booking.id"
              :title="data.title"
              :leftOffset="data.leftOffset"
              :topOffset="data.topOffset"
              :length="data.length"
              :isDragSource="data.booking.id === ghostBarState?.booking.id"
              @mouse-enter="onMouseEnterBar(data.booking)"
              @bar-clicked="onBarClick(data.booking)"
              @drag-start="onDragStart($event, data)"
              @resize-start="onResizeStart($event, data)"
            />
            <BookingBar
              v-if="ghostBarState"
              :title="ghostBarState.title"
              :leftOffset="ghostBarState.leftOffset"
              :topOffset="ghostBarState.topOffset"
              :length="ghostBarState.length"
              isGhost
            />
          </div>
        </div>
      </div>
    </div>
  </div>
  <ConfirmChangeDialog
    v-if="ghostBarState && changedBooking"
    :open="isConfirmChangeVisible"
    :booking="ghostBarState?.booking"
    :changedBooking="changedBooking"
    @close="onConfirmDialogClose"
  />
  <BookingDetailsDialog
    v-if="bookingDetails"
    :open="isDetailsDialogOpen"
    :bookingDetails="bookingDetails"
    @close="isDetailsDialogOpen = false"
  />
  <CreateBookingDialog
    :open="isCreateDialogOpen"
    :state="createFormState"
    @close="onCreateDialogClose"
  />
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, useTemplateRef, watchEffect } from "vue";
import dayjs from "dayjs";
import { useRoomStore } from "@/stores/roomStore.ts";
import { useBookingStore } from "@/stores/bookingStore.ts";
import { generateDays } from "@/utils/dateTimeUtils.ts";
import {
  type BookingWithLayout,
  CELL_HEIGHT,
  CELL_WIDTH, type DragEventPayload, DragMode, isBookingPositionChanged,
  MINUTES_PER_PIXEL, ResizeDirection
} from "@/utils/planTableUtils.ts";
import type { Room } from "@/types/Room.ts";
import type { BookingDetails, BookingFormState, BookingShort } from "@shared/types/booking.ts";
import { useScopedI18n } from "@/composables/useScopedI18n.ts";
import { bookingQueries } from "@/queries/bookingQueries.ts";

const WINDOW_DAYS = 120;
const SHIFT_DAYS = 30;

const AUTO_SCROLL_MARGIN = 40;
const AUTO_SCROLL_SPEED = 12;

defineOptions({ name: 'PlanTable' });
const { t } = useScopedI18n();

let scrollLock = 0;

function withScrollLock(fn: () => void) {
  scrollLock++;
  fn();
  nextTick(() => {
    scrollLock--;
  });
}

const headerRef = useTemplateRef<HTMLElement>('header');
const gridScrollRef = useTemplateRef<HTMLElement>('grid-scroll');
const roomsRef = useTemplateRef<HTMLElement>('rooms');
const overlayRef = useTemplateRef<HTMLElement>('overlay');
const gridRef = useTemplateRef<HTMLElement>('grid');

const roomStore = useRoomStore();
const bookingStore = useBookingStore();

const rangeStart = ref<dayjs. Dayjs>(
  dayjs().subtract(WINDOW_DAYS / 2, "day").startOf('day'),
);
const rangeEnd = computed<dayjs. Dayjs>(
  () => rangeStart.value.add(WINDOW_DAYS, 'day').startOf('day'),
);

const days = computed<dayjs.Dayjs[]>(() => generateDays(rangeStart.value, rangeEnd.value));
const months = computed(() => {
  const result: {
    key: string;
    label: string;
    days: number;
  }[] = [];

  let current: dayjs.Dayjs | null = null;

  for (const day of days.value) {
    if (!current || !day.isSame(current, 'month')) {
      result.push({
        key: day.format('YYYY-MM'),
        label: day.format('MMMM YYYY'),
        days: 1,
      });
      current = day;
    } else {
      result[result.length - 1].days++;
    }
  }

  return result;
});

const bookingDetails = ref<BookingDetails>();

const isCreating = ref<boolean>(false);
const isConfirmChangeVisible = ref<boolean>(false);
const isDetailsDialogOpen = ref<boolean>(false);
const isCreateDialogOpen = ref<boolean>(false);

const isScrollbarGrabbed = ref<boolean>(false);
const scrollbarHeight = ref<number>(0);

const highlightedDays = ref<string[]>([]);
const highlightedRoomId = ref<number>();

const dragMode = ref<DragMode>();

const initialDragState = ref<DragEventPayload>();
const initialResizeState = ref<{
  direction: ResizeDirection,
  startX: number,
  startLeftOffset: number,
  startLength: number,
  startScrollLeft: number,
}>();

const ghostBarState = ref<BookingWithLayout>();

const resizeDirection = ref<ResizeDirection>();

const roomIndexById = computed<Record<number, number>>(() =>
  Object.fromEntries(
    roomStore.rooms.map((room, index) => [room.id, index])
  )
);

const createFormState = ref<BookingFormState>();

const getBarTopOffset = (booking: BookingShort): number => {
  return roomIndexById.value[booking.roomId] * CELL_HEIGHT;
};

const getBarLeftOffset = (booking: BookingShort): number => {
  const daysFromRangeStart = dayjs(booking.checkInDate).diff(rangeStart.value, 'day');
  const minutesFromRangeStart = daysFromRangeStart * 24 * 60 + booking.arrivalMinutes;

  return minutesFromRangeStart / MINUTES_PER_PIXEL;
};

const getBarLength = (booking: BookingShort): number => {
  const nights = dayjs(booking.checkOutDate).diff(booking.checkInDate, 'day');
  const durationMinutes = nights * 24 * 60 - booking.arrivalMinutes + booking.departureMinutes;

  return durationMinutes / MINUTES_PER_PIXEL;
};

const getBarTitle = (booking: BookingShort): string => {
  if (isCreating.value) {
    return t('newBooking');
  }

  const mainGuest = booking.guests.find(guest => guest.id === booking.mainGuestId);
  if (!mainGuest) {
    return '';
  }
  return `${mainGuest.firstName} ${mainGuest.lastName}`;
};

const layoutBookings = computed<BookingWithLayout[]>(() =>
  bookingStore.bookings.map(booking => ({
    booking,
    title: getBarTitle(booking),
    topOffset: getBarTopOffset(booking),
    leftOffset: getBarLeftOffset(booking),
    length: getBarLength(booking),
  }))
);

const draggedBooking = computed<BookingShort | undefined>(() => {
  if (dragMode.value !== DragMode.DRAG || !ghostBarState.value) {
    return;
  }
  const { booking, leftOffset, topOffset } = ghostBarState.value;

  const dayIndex = Math.floor(leftOffset / CELL_WIDTH);

  const barCenterY = topOffset + CELL_HEIGHT / 2;
  const roomIndex = Math.floor(barCenterY / CELL_HEIGHT);

  if (dayIndex < 0 || roomIndex < 0) {
    return;
  }

  const room = roomStore.rooms[roomIndex];
  if (!room) {
    return;
  }

  const nights = dayjs(booking.checkOutDate)
    .startOf('day')
    .diff(dayjs(booking.checkInDate).startOf('day'), 'day');

  const newCheckIn = rangeStart.value.startOf('day').add(dayIndex, 'day');
  const newCheckOut = newCheckIn.add(nights, 'day');

  return {
    ...booking,
    roomId: room.id,
    checkInDate: newCheckIn.format('YYYY-MM-DD'),
    checkOutDate: newCheckOut.format('YYYY-MM-DD'),
    arrivalMinutes: booking.arrivalMinutes,
    departureMinutes: booking.departureMinutes,
  };
});

const resizedBooking = computed<BookingShort | undefined>(() => {
  if (dragMode.value !== DragMode.RESIZE || !ghostBarState.value) {
    return;
  }

  const { booking, leftOffset, length } = ghostBarState.value;

  const startDayIndex = Math.floor(leftOffset / CELL_WIDTH);
  const endDayIndex = Math.floor((leftOffset + length) / CELL_WIDTH);

  if (startDayIndex < 0 || endDayIndex <= startDayIndex) {
    return;
  }

  const base = rangeStart.value.startOf('day');

  return {
    ...booking,
    roomId: booking.roomId,
    checkInDate: base
      .add(startDayIndex, 'day')
      .format('YYYY-MM-DD'),
    checkOutDate: base
      .add(endDayIndex, 'day')
      .format('YYYY-MM-DD'),

    arrivalMinutes: booking.arrivalMinutes,
    departureMinutes: booking.departureMinutes,
  };
});

const changedBooking = computed<BookingShort | undefined>(() => {
  if (dragMode.value === DragMode.DRAG && draggedBooking.value) {
    return draggedBooking.value;
  }
  if (dragMode.value === DragMode.RESIZE && resizedBooking.value) {
    return resizedBooking.value;
  }
  return undefined;
});

const shiftRight = (): void => {
  if (isScrollbarGrabbed.value) {
    return;
  }
  if (!gridScrollRef.value || !headerRef.value) {
    return;
  }

  rangeStart.value = rangeStart.value.add(SHIFT_DAYS, 'day').startOf('day');

  gridScrollRef.value.scrollLeft -= SHIFT_DAYS * CELL_WIDTH;
  headerRef.value.scrollLeft -= SHIFT_DAYS * CELL_WIDTH;
}

const shiftLeft = (): void => {
  if (isScrollbarGrabbed.value) {
    return;
  }
  if (!gridScrollRef.value || !headerRef.value) {
    return;
  }

  rangeStart.value = rangeStart.value.subtract(SHIFT_DAYS, 'day').startOf('day');

  gridScrollRef.value.scrollLeft += SHIFT_DAYS * CELL_WIDTH;
  headerRef.value.scrollLeft += SHIFT_DAYS * CELL_WIDTH;
}

const onScroll = (): void => {
  if (scrollLock > 0) {
    return;
  }

  if (!headerRef.value || !gridScrollRef.value || !roomsRef.value) {
    return;
  }

  headerRef.value.scrollLeft = gridScrollRef.value.scrollLeft;

  const leftThreshold = 10 * CELL_WIDTH;
  const rightThreshold = gridScrollRef.value.scrollWidth - gridScrollRef.value.clientWidth - leftThreshold;

  const scrollLeft = gridScrollRef.value.scrollLeft;

  if (scrollLeft > rightThreshold) {
    withScrollLock(() => shiftRight());
  }

  if (scrollLeft < leftThreshold) {
    withScrollLock(() => shiftLeft());
  }
};

const scrollToDate = (date: dayjs.Dayjs): void => {
  if (!gridScrollRef.value) {
    return;
  }

  const index = days.value.findIndex(d => d.isSame(date, 'day'));
  if (index === -1) {
    return;
  }

  gridScrollRef.value.scrollLeft = index * CELL_WIDTH;
}

const onBarClick = async (booking: BookingShort): Promise<void> => {
  bookingDetails.value = await bookingQueries.getDetails(booking.id);
  isDetailsDialogOpen.value = true;
};

const onCreateDialogClose = (): void => {
  isCreateDialogOpen.value = false;
  createFormState.value = undefined;
}

const onMouseMove = (e: MouseEvent) => {
  if (dragMode.value === DragMode.DRAG) {
    onDrag(e);
  }
  if (dragMode.value === DragMode.RESIZE) {
    onResize(e);
  }

  onAutoScroll(e);
}

const onResizeStart = (
  resizeData: { direction: ResizeDirection; startX: number },
  bookingData: BookingWithLayout,
) => {
  if (!gridScrollRef.value) {
    return;
  }
  dragMode.value = DragMode.RESIZE;

  initialResizeState.value = {
    direction: resizeData.direction,
    startX: resizeData.startX,
    startLeftOffset: bookingData.leftOffset,
    startLength: bookingData.length,
    startScrollLeft: gridScrollRef.value.scrollLeft,
  };

  ghostBarState.value = { ...bookingData };

  document.body.style.cursor = 'ew-resize';
  document.body.style.userSelect = 'none';

  window.addEventListener('mousemove', onMouseMove);
};

const onResize = (e: MouseEvent): void => {
  if (!initialResizeState.value || !ghostBarState.value || !gridScrollRef.value) {
    return;
  }

  const state = initialResizeState.value;

  const mouseDx = e.clientX - state.startX;
  const scrollDx = gridScrollRef.value.scrollLeft - state.startScrollLeft;
  const dx = mouseDx + scrollDx;

  if (state.direction === ResizeDirection.RIGHT) {
    ghostBarState.value.length = Math.max(
      CELL_WIDTH,
      state.startLength + dx
    );
  }

  if (state.direction === ResizeDirection.LEFT) {
    const newLeft = state.startLeftOffset + dx;
    const newWidth = state.startLength - dx;

    if (newWidth >= CELL_WIDTH) {
      ghostBarState.value.leftOffset = newLeft;
      ghostBarState.value.length = newWidth;
    }
  }
};

const onResizeEnd = (): void => {
  if (
    resizedBooking.value
    && ghostBarState.value
    && isBookingPositionChanged(ghostBarState.value?.booking, resizedBooking.value)
  ) {
    isConfirmChangeVisible.value = true;
  } else {
    resetDrag();
  }
};

const onDragStart = (
  pointerPosition: DragEventPayload,
  data: BookingWithLayout,
) => {
  dragMode.value = DragMode.DRAG;
  initialDragState.value = {
    grabOffsetX: pointerPosition.grabOffsetX,
    grabOffsetY: pointerPosition.grabOffsetY,
  };
  ghostBarState.value = { ...data };

  window.addEventListener('mousemove', onMouseMove);
};

const onDrag = (e: MouseEvent): void => {
  if (!initialDragState.value || !ghostBarState.value || !overlayRef.value) {
    return;
  }

  const containerRect = overlayRef.value.getBoundingClientRect()

  ghostBarState.value.leftOffset = e.clientX - containerRect.left - initialDragState.value.grabOffsetX;
  ghostBarState.value.topOffset = e.clientY - containerRect.top - initialDragState.value.grabOffsetY;
};

const onDragEnd = () => {
  if (
    draggedBooking.value
    && ghostBarState.value
    && isBookingPositionChanged(ghostBarState.value?.booking, draggedBooking.value)
  ) {
    isConfirmChangeVisible.value = true;
  } else {
    resetDrag();
  }
};

const resetDrag = (): void => {
  dragMode.value = undefined;
  ghostBarState.value = undefined;
  initialDragState.value = undefined;
  initialResizeState.value = undefined;
  resizeDirection.value = undefined;
};

const onConfirmDialogClose = (): void => {
  resetDrag();
  isConfirmChangeVisible.value = false;
};

const onMouseOverCell = (room: Room, day: dayjs.Dayjs): void => {
  highlightedRoomId.value = room.id;
  highlightedDays.value = [day.format('YYYY-MM-DD')];
};

const onMouseEnterBar = (booking: BookingShort): void => {
  highlightedRoomId.value = booking.roomId;
  highlightedDays.value = generateDays(dayjs(booking.checkInDate), dayjs(booking.checkOutDate))
    .map(day => day.format('YYYY-MM-DD'));
};

const onMouseLeaveGrid = (): void => {
  highlightedRoomId.value = undefined;
  highlightedDays.value = [];
};

const onMouseDown = (e: MouseEvent): void => {
  if (e.target === gridScrollRef.value) {
    isScrollbarGrabbed.value = true;
  }
}

const onMouseUp = (e: MouseEvent): void => {
  if (isScrollbarGrabbed.value) {
    isScrollbarGrabbed.value = false;
    requestAnimationFrame(() => onScroll());
    return;
  }

  const rect = gridRef.value!.getBoundingClientRect();
  const isInsideGrid =
    e.clientX >= rect.left &&
    e.clientX <= rect.right &&
    e.clientY >= rect.top &&
    e.clientY <= rect.bottom;

  if (!isInsideGrid) {
    resetDrag();
  } else if (dragMode.value === DragMode.DRAG) {
    onDragEnd();
  } else if (dragMode.value === DragMode.RESIZE) {
    onResizeEnd();
  }

  document.body.style.cursor = '';
  document.body.style.userSelect = '';

  window.removeEventListener('mousemove', onMouseMove);
}

const onAutoScroll = (e: MouseEvent) => {
  if (!gridScrollRef.value) {
    return;
  }

  const grid = gridScrollRef.value;
  const rect = grid.getBoundingClientRect();

  // Horizontal
  if (e.clientX < rect.left + AUTO_SCROLL_MARGIN) {
    grid.scrollLeft -= AUTO_SCROLL_SPEED;
  } else if (e.clientX > rect.right - AUTO_SCROLL_MARGIN) {
    grid.scrollLeft += AUTO_SCROLL_SPEED;
  }

  // Vertical
  if (e.clientY < rect.top + AUTO_SCROLL_MARGIN) {
    grid.scrollTop -= AUTO_SCROLL_SPEED;
  } else if (e.clientY > rect.bottom - AUTO_SCROLL_MARGIN) {
    grid.scrollTop += AUTO_SCROLL_SPEED;
  }
};

watchEffect(() => {
  if (draggedBooking.value) {
    highlightedRoomId.value = draggedBooking.value.roomId;
    highlightedDays.value = generateDays(
      dayjs(draggedBooking.value.checkInDate),
      dayjs(draggedBooking.value.checkOutDate),
    ).map(d => d.format('YYYY-MM-DD'));
  }
  if (resizedBooking.value) {
    highlightedRoomId.value = resizedBooking.value.roomId;
    highlightedDays.value = generateDays(
      dayjs(resizedBooking.value.checkInDate),
      dayjs(resizedBooking.value.checkOutDate)
    ).map(d => d.format('YYYY-MM-DD'));
  }
});

onMounted(async () => {
  window.addEventListener('mousedown', onMouseDown);
  window.addEventListener('mouseup', onMouseUp);

  const grid = gridScrollRef.value;
  if (grid) {
    scrollbarHeight.value = grid.offsetHeight - grid.clientHeight;
  }

  bookingStore.fetch(rangeStart.value.format('YYYY-MM-DD'), rangeEnd.value.format('YYYY-MM-DD'));

  await nextTick();
  scrollToDate(dayjs());
});

onUnmounted(() => {
  window.removeEventListener('mousedown', onMouseDown);
  window.removeEventListener('mouseup', onMouseUp);
  window.removeEventListener('mousemove', onMouseMove);
});
</script>

<style scoped>
.calendar-root {
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-rows: 80px 1fr;
  border: 1px solid #ccc;
  overflow: hidden;
}

/* ================= HEADER ================= */

.header-row {
  display: grid;
  grid-template-columns: 150px 1fr;
  grid-template-rows: 40px 40px;
  border-bottom: 1px solid #ccc;
}

.corner-cell {
  grid-row: span 2;
  background: white;
  border-right: 1px solid #ccc;
  border-bottom: 1px solid #ccc;
}

.header-scroll {
  grid-row: span 2;
  overflow: hidden;
}

.header-inner {
  display: grid;
  grid-template-rows: 40px 40px;
  min-width: max-content;
}

.months-row,
.days-row {
  display: flex;
}

.month-header {
  height: 40px;
  border-right: 1px solid #bbb;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
}

.day-header {
  min-width: 120px;
  height: 40px;
  border-right: 1px solid #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  font-weight: 500;
}

/* ================= BODY ================= */

.body-row {
  display: grid;
  grid-template-columns: 150px 1fr;
  height: 100%;
  overflow: hidden;
  min-height: 0;
}

.rooms-scroll {
  overflow: hidden;
  background: white;
  border-right: 1px solid #ccc;
}

.room-cell {
  height: 40px;
  border-bottom: 1px solid #ddd;
  display: flex;
  align-items: center;
  padding-left: 8px;
  white-space: nowrap;
}

.grid-scroll {
  overflow: auto;
  min-height: 0;
  position: relative;
}

.grid-inner {
  position: relative;
  min-width: max-content;
}

.row {
  display: flex;
}

.cell {
  min-width: 120px;
  height: 40px;
  border-right: 1px solid #ddd;
  border-bottom: 1px solid #ddd;
  flex-shrink: 0;
}

.highlighted {
  background-color: #b5b5b5;
}

/* ================= OVERLAY ================= */

.overlay-container {
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
}
</style>
