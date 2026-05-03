<template>
  <div class="calendar-root">
    <div class="header-row">
      <div class="corner-cell">
        <ActionsPanel
          :currentDate="currentDate"
          @navigate="navigateToDate"
          @create="onCreate"
        />
      </div>

      <div class="header-scroll" ref="header">
        <div class="header-inner">
          <div class="months-row">
            <div
              class="cell month-header"
              v-for="month in months"
              :key="month.key"
              :style="{ width: `${month.days * CELL_WIDTH}px` }"
            >
              <span class="month-label">
                {{ month.label }}
              </span>
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
          v-for="room in roomStore.roomsWithCategory"
          :key="room.id"
          :class="{ highlighted: highlightedRoomId === room.id }"
        >
          <RoomView
            :room="room"
            :room-name-align="'right'"
            is-category-visible
            is-status-selectable
          />
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
              @mousedown="onCreateStart($event, room, day)"
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
              :status="data.booking.status"
              :leftOffset="data.leftOffset"
              :topOffset="data.topOffset"
              :length="data.length"
              :isDragSource="data.booking.id === ghostBarState?.booking.id"
              @mouse-enter="onMouseEnterBar(data.booking)"
              @bar-clicked="onBarClick(data.booking.id)"
              @drag-start="onDragStart($event, data)"
              @resize-start="onResizeStart($event, data)"
              @right-click="onBarRightClick($event, data.booking)"
            />
            <BookingBar
              v-if="ghostBarState"
              :title="ghostBarState.title"
              :leftOffset="ghostBarState.leftOffset"
              :topOffset="ghostBarState.topOffset"
              :length="ghostBarState.length"
              :isCreating="dragMode === DragMode.CREATE"
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
  <ContextMenu
    v-model="isContextMenuOpen"
    :items="contextMenuItems"
    :position="menuPosition"
    @itemClick="onMenuClick"
  />
</template>

<script setup lang="ts">
import {
  computed,
  nextTick,
  onMounted,
  onUnmounted,
  ref,
  useTemplateRef,
  watch,
  watchEffect
} from "vue";
import dayjs from "dayjs";
import { useRoomStore } from "@/stores/roomStore.ts";
import { useBookingStore } from "@/stores/bookingStore.ts";
import { generateDays } from "@/utils/dateTimeUtils.ts";
import {
  type BookingWithLayout,
  CELL_HEIGHT,
  CELL_WIDTH,
  type DragEventPayload,
  DragMode, getContextMenuItems,
  isBookingPositionChanged,
  MINUTES_PER_PIXEL,
  ResizeDirection
} from "@/utils/planTableUtils.ts";
import type { Room } from "@/types/Room.ts";
import {
  type BookingDetails,
  type BookingPlacement,
  type BookingShort
} from "@shared/types/booking.ts";
import { useScopedI18n } from "@/composables/useScopedI18n.ts";
import { bookingQueries } from "@/queries/bookingQueries.ts";
import type { ItemType } from "ant-design-vue";
import { BookingContextMenuItem } from "@/enums/BookingContextMenuItem.ts";
import { BookingStatus } from "@shared/enums/BookingStatus.ts";
import type { Key } from "ant-design-vue/es/_util/type";

const WINDOW_DAYS = 120;
const SHIFT_DAYS = 30;

const AUTO_SCROLL_MARGIN = 40;
const AUTO_SCROLL_SPEED = 12;

const CREATE_THRESHOLD = 20;
const DEFAULT_ARRIVAL_MINUTES = 14 * 60;

defineOptions({ name: 'PlanTable' });
const { t } = useScopedI18n();

let scrollLock = 0;
let suppressNextScrollToDate = false;

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

const currentDate = ref(dayjs().startOf('day'));

const rangeStart = computed(() =>
  currentDate.value
    .subtract(Math.floor(WINDOW_DAYS / 2), 'day')
    .startOf('day')
);
const rangeEnd = computed(() =>
  rangeStart.value.add(WINDOW_DAYS, 'day')
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
const selectedBookingId = ref<number>();

const isConfirmChangeVisible = ref<boolean>(false);
const isDetailsDialogOpen = ref<boolean>(false);
const isCreateDialogOpen = ref<boolean>(false);

const isContextMenuOpen = ref(false);
const menuPosition = ref({ x: 0, y: 0 });
const contextMenuItems = ref<ItemType[]>([]);

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
const initialCreateState = ref<{
  startX: number;
  roomId: number;
  startDayIndex: number;
}>();

const ghostBarState = ref<BookingWithLayout>();

const resizeDirection = ref<ResizeDirection>();

const roomIndexById = computed<Record<number, number>>(() =>
  Object.fromEntries(
    roomStore.rooms.map((room, index) => [room.id, index])
  )
);

const createFormState = ref<BookingPlacement>();

const getBarTopOffset = (booking: BookingShort): number => {
  return roomIndexById.value[booking.roomId] * CELL_HEIGHT + 2;
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

const createdBooking = computed<BookingPlacement | undefined>(() => {
  if (dragMode.value !== DragMode.CREATE || !ghostBarState.value || !initialCreateState.value) {
    return;
  }

  const startDayIndex = Math.floor(ghostBarState.value.leftOffset / CELL_WIDTH);
  const endDayIndex = Math.floor(
    (ghostBarState.value.leftOffset + ghostBarState.value.length) / CELL_WIDTH
  );

  const base = rangeStart.value.startOf('day');

  return {
    roomId: initialCreateState.value.roomId,
    checkInDate: base.add(startDayIndex, 'day').format('YYYY-MM-DD'),
    checkOutDate: base.add(endDayIndex, 'day').format('YYYY-MM-DD'),
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

  suppressNextScrollToDate = true;
  currentDate.value = currentDate.value.add(SHIFT_DAYS, 'day');

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

  suppressNextScrollToDate = true;
  currentDate.value = currentDate.value.subtract(SHIFT_DAYS, 'day');

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

const navigateToDate = (date: dayjs.Dayjs) => {
  currentDate.value = date.startOf('day');
};

const onBarClick = async (bookingId: number): Promise<void> => {
  bookingDetails.value = await bookingQueries.getDetails(bookingId);
  isDetailsDialogOpen.value = true;
};

const onBarRightClick = (e: MouseEvent, booking: BookingShort): void => {
  e.stopPropagation();
  selectedBookingId.value = booking.id;
  menuPosition.value = {
    x: e.clientX,
    y: e.clientY,
  };
  contextMenuItems.value = getContextMenuItems(booking);
  isContextMenuOpen.value = true;
};

const onMenuClick = (key: Key): void => {
  if (!selectedBookingId.value) {
    return;
  }
  switch (key) {
    case BookingContextMenuItem.INFO:
      onBarClick(selectedBookingId.value);
      break;
    case BookingContextMenuItem.CHECK_IN:
      bookingStore.setStatus(selectedBookingId.value, BookingStatus.CHECKED_IN);
      break;
    case BookingContextMenuItem.CANCEL_CHECK_IN:
      bookingStore.setStatus(selectedBookingId.value, BookingStatus.ACTIVE);
      break;
    case BookingContextMenuItem.CANCEL_CHECK_OUT:
      bookingStore.setStatus(selectedBookingId.value, BookingStatus.CHECKED_IN);
      break;
    case BookingContextMenuItem.CHECK_OUT:
      bookingStore.setStatus(selectedBookingId.value, BookingStatus.CHECKED_OUT);
      break;
    default:
  }
};

const onCreate = (): void => {
  isCreateDialogOpen.value = true;
}

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
  if (dragMode.value === DragMode.CREATE) {
    onCreateDrag(e);
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

const onCreateStart = (e: MouseEvent, room: Room, day: dayjs.Dayjs) => {
  if (e.button !== 0) {
    return;
  }

  const dayIndex = days.value.findIndex(d => d.isSame(day, 'day'));
  if (dayIndex === -1) {
    return;
  }

  dragMode.value = DragMode.CREATE;

  const rect = gridScrollRef.value!.getBoundingClientRect();
  const startCursorX = e.clientX - rect.left + gridScrollRef.value!.scrollLeft;

  initialCreateState.value = {
    startX: startCursorX,
    roomId: room.id,
    startDayIndex: dayIndex,
  };

  ghostBarState.value = undefined;

  window.addEventListener('mousemove', onMouseMove);
};

const onCreateDrag = (e: MouseEvent) => {
  if (!initialCreateState.value || !gridScrollRef.value) {
    return;
  }

  const rect = gridScrollRef.value.getBoundingClientRect();
  const cursorX = e.clientX - rect.left + gridScrollRef.value.scrollLeft;

  const dx = cursorX - initialCreateState.value.startX;

  if (!ghostBarState.value) {
    if (dx < CREATE_THRESHOLD) {
      return;
    }

    const baseLeft = initialCreateState.value.startDayIndex * CELL_WIDTH +
      DEFAULT_ARRIVAL_MINUTES / MINUTES_PER_PIXEL;

    const topOffset = roomIndexById.value[initialCreateState.value.roomId] * CELL_HEIGHT + 2;

    ghostBarState.value = {
      booking: {} as any,
      title: t('newBooking'),
      leftOffset: baseLeft,
      topOffset,
      length: CELL_WIDTH,
    };

    document.body.style.cursor = 'ew-resize';
    document.body.style.userSelect = 'none';
  }

  const baseLeft =initialCreateState.value.startDayIndex * CELL_WIDTH +
    DEFAULT_ARRIVAL_MINUTES / MINUTES_PER_PIXEL;
  const newLength = cursorX - baseLeft;

  ghostBarState.value.leftOffset = baseLeft;
  ghostBarState.value.length = Math.max(CELL_WIDTH, newLength);
};

const onCreateEnd = () => {
  if (!ghostBarState.value) {
    resetDrag();
    return;
  }

  if (createdBooking.value) {
    createFormState.value = createdBooking.value;
    isCreateDialogOpen.value = true;
  }

  resetDrag();
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
  if (dragMode.value) {
    return;
  }
  highlightedRoomId.value = room.id;
  highlightedDays.value = [day.format('YYYY-MM-DD')];
};

const onMouseEnterBar = (booking: BookingShort): void => {
  if (dragMode.value) {
    return;
  }
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
  } else if (dragMode.value === DragMode.CREATE) {
    onCreateEnd();
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

watch(currentDate, async (date: dayjs.Dayjs) => {
  bookingStore.fetch(
    rangeStart.value.format('YYYY-MM-DD'),
    rangeEnd.value.format('YYYY-MM-DD')
  );

  if (suppressNextScrollToDate) {
    suppressNextScrollToDate = false;
    return;
  }

  await nextTick();
  scrollToDate(date);
});

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
  if (createdBooking.value) {
    highlightedRoomId.value = createdBooking.value.roomId;
    highlightedDays.value = generateDays(
      dayjs(createdBooking.value.checkInDate),
      dayjs(createdBooking.value.checkOutDate)
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
  grid-template-columns: 215px 1fr;
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
  position: relative;
  height: 40px;
  border-right: 1px solid #bbb;
  background: white;
  display: flex;
  align-items: center;
}

.month-label {
  position: sticky;
  left: 10px;
  white-space: nowrap;
  text-transform: capitalize;
  margin-left: 10px;
  margin-right: 10px;
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
  grid-template-columns: 215px 1fr;
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
