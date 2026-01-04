<template>
  <div class="calendar-root">
    <div class="header-row">
      <div class="corner-cell"></div>
      <div
        class="header-scroll"
        ref="header"
      >
        <div class="header-inner">
          <div
            class="cell day-header"
            v-for="day in days"
            :key="day.format()"
          >
            {{ day.format('MMM D') }}
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
        >
          {{ room.name }}
        </div>
      </div>
      <div
        class="grid-scroll"
        ref="grid"
        @scroll="onScroll"
      >
        <div class="grid-inner">
          <div
            class="row"
            v-for="room in roomStore.rooms"
            :key="room.id"
          >
            <div
              class="cell day-cell"
              v-for="day in days"
              :key="day.format()"
            ></div>
          </div>

          <div class="overlay-container">
            <div
              class="booking-bar"
              v-for="booking in bookings"
              :key="booking.id"
              :style="{
                top: `${booking.rowIndex * CELL_HEIGHT}px`,
                left: `${booking.colIndex * CELL_WIDTH}px`,
                width: `${booking.length * CELL_WIDTH}px`,
              }"
            >
              {{ booking.label }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref, useTemplateRef } from "vue";
import dayjs from "dayjs";
import { useRoomStore } from "@/stores/roomStore.ts";
import { useBookingStore } from "@/stores/bookingStore.ts";
import { generateDays } from "@/utils/dateTimeUtils.ts";

const CELL_WIDTH = 120;
const CELL_HEIGHT = 40;
const WINDOW_DAYS = 120;
const SHIFT_DAYS = 30;

let scrollLock = 0;

function withScrollLock(fn: () => void) {
  scrollLock++;
  fn();
  nextTick(() => {
    scrollLock--;
  });
}

const headerRef = useTemplateRef<HTMLElement>('header');
const gridRef = useTemplateRef<HTMLElement>('grid');
const roomsRef = useTemplateRef<HTMLElement>('rooms');

const roomStore = useRoomStore();
const bookingStore = useBookingStore();

const rangeStart = ref<dayjs. Dayjs>(dayjs().subtract(WINDOW_DAYS / 2, "day"));
const rangeEnd = ref<dayjs. Dayjs>(dayjs().add(WINDOW_DAYS / 2, "day"));
const days = ref(generateDays(rangeStart.value, rangeEnd.value));

const isDraggingScrollbar = ref<boolean>(false);
const scrollbarHeight = ref<number>(0)

const bookings = [
  { id: 1, rowIndex: 2, colIndex: 3, length: 5, label: "Booking A" },
  { id: 2, rowIndex: 7, colIndex: 10, length: 3, label: "Booking B" },
  { id: 3, rowIndex: 12, colIndex: 20, length: 8, label: "Booking C" },
  { id: 4, rowIndex: 20, colIndex: 25, length: 4, label: "Booking D" },
];

const shiftRight = () => {
  if (isDraggingScrollbar.value) {
    return;
  }
  if (!gridRef.value || !headerRef.value) {
    return;
  }

  const currentDays = days.value;
  const keptDays = currentDays.slice(SHIFT_DAYS);
  const lastDay = keptDays[keptDays.length - 1];
  const newDays = Array.from({ length: SHIFT_DAYS }, (_, i) =>
    lastDay.add(i + 1, 'day')
  );

  days.value = [...keptDays, ...newDays];

  gridRef.value.scrollLeft -= SHIFT_DAYS * CELL_WIDTH;
  headerRef.value.scrollLeft -= SHIFT_DAYS * CELL_WIDTH;
}

const shiftLeft = () => {
  if (isDraggingScrollbar.value) {
    return;
  }
  if (!gridRef.value || !headerRef.value) {
    return;
  }

  const currentDays = days.value;
  const keptDays = currentDays.slice(0, -SHIFT_DAYS);
  const firstDay = keptDays[0];

  const newDays = Array.from({ length: SHIFT_DAYS }, (_, i) =>
    firstDay.subtract(SHIFT_DAYS - i, 'day')
  );

  days.value = [...newDays, ...keptDays];

  gridRef.value.scrollLeft += SHIFT_DAYS * CELL_WIDTH;
  headerRef.value.scrollLeft += SHIFT_DAYS * CELL_WIDTH;
}

const onScroll = () => {
  if (scrollLock > 0) {
    return;
  }

  if (!headerRef.value || !gridRef.value || !roomsRef.value) {
    return;
  }

  headerRef.value.scrollLeft = gridRef.value.scrollLeft;

  const leftThreshold = 10 * CELL_WIDTH;
  const rightThreshold = gridRef.value.scrollWidth - gridRef.value.clientWidth - leftThreshold;

  const scrollLeft = gridRef.value.scrollLeft;

  if (scrollLeft > rightThreshold) {
    withScrollLock(() => shiftRight());
  }

  if (scrollLeft < leftThreshold) {
    withScrollLock(() => shiftLeft());
  }
};

const scrollToDate = (date: dayjs.Dayjs, center = true) => {
  if (!gridRef.value) {
    return;
  }

  const index = days.value.findIndex(d => d.isSame(date, 'day'));
  if (index === -1) {
    return;
  }

  gridRef.value.scrollLeft = index * CELL_WIDTH;
}

const onMouseDown = (e: MouseEvent) => {
  if (e.target === gridRef.value) {
    isDraggingScrollbar.value = true;
  }
}

const onMouseUp = () => {
  isDraggingScrollbar.value = false;
  requestAnimationFrame(() => onScroll());
}

onMounted(async () => {
  window.addEventListener('mousedown', onMouseDown);
  window.addEventListener('mouseup', onMouseUp);

  const grid = gridRef.value;
  if (grid) {
    scrollbarHeight.value = grid.offsetHeight - grid.clientHeight;
  }

  await nextTick();
  scrollToDate(dayjs());
});

onUnmounted(() => {
  window.removeEventListener('mousedown', onMouseDown);
  window.removeEventListener('mouseup', onMouseUp);
});
</script>

<style scoped>
.calendar-root {
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-rows: 40px 1fr;
  border: 1px solid #ccc;
  overflow: hidden;
}

/* ================= HEADER ================= */

.header-row {
  display: grid;
  grid-template-columns: 150px 1fr;
  border-bottom: 1px solid #ccc;
}

.corner-cell {
  background: white;
  border-right: 1px solid #ccc;
}

.header-scroll {
  overflow: hidden;
}

.header-inner {
  display: flex;
  min-width: max-content;
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

/* ================= OVERLAY ================= */

.overlay-container {
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
}

.booking-bar {
  position: absolute;
  height: 38px;
  background: rgba(0, 150, 255, 0.3);
  border: 1px solid rgba(0, 150, 255, 0.6);
  border-radius: 6px;
  line-height: 38px;
  text-align: center;
  font-size: 12px;
  pointer-events: auto;
}
</style>
