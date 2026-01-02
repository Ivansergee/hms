<template>
  <div class="calendar-container">
    <div class="header-container" ref="header">
      <div class="header-inner">
        <div class="cell room-header"></div>
        <div
          class="cell day-header"
          v-for="day in days"
          :key="day.format()"
        >
          {{ day.format('MMM D') }}
        </div>
      </div>
    </div>

    <div
      ref="scroll"
      class="scroll-container"
      @scroll="onScroll"
    >
      <div class="scroll-inner">
        <div class="body-inner">
          <div
            class="row"
            v-for="room in rooms"
            :key="room.id"
          >
            <div class="cell room-cell">
              {{ room.name }}
            </div>
            <div
              class="cell day-cell"
              v-for="day in days"
              :key="day.format()"
            ></div>
          </div>
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
</template>

<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref, useTemplateRef } from "vue";
import dayjs from "dayjs";

const CELL_WIDTH = 120;
const CELL_HEIGHT = 40;
const WINDOW_DAYS = 120;
const SHIFT_DAYS = 30;

const rangeStart = ref(dayjs().subtract(WINDOW_DAYS / 2, "day"));
const rangeEnd = ref(dayjs().add(WINDOW_DAYS / 2, "day"));
const isDraggingScrollbar = ref<boolean>(false);

const today = dayjs().startOf("day");
const startIndex = ref(0);

const rooms = Array.from({ length: 30 }, (_, i) => ({
  id: i + 1,
  name: `Room ${i + 1}`,
}));

const bookings = [
  { id: 1, rowIndex: 2, colIndex: 3, length: 5, label: "Booking A" },
  { id: 2, rowIndex: 7, colIndex: 10, length: 3, label: "Booking B" },
  { id: 3, rowIndex: 12, colIndex: 20, length: 8, label: "Booking C" },
  { id: 4, rowIndex: 20, colIndex: 25, length: 4, label: "Booking D" },
];

const headerRef = useTemplateRef<HTMLElement>('header');
const scrollRef = useTemplateRef<HTMLElement>('scroll');

function generateDays(start: dayjs.Dayjs, end: dayjs.Dayjs) {
  const days = [];
  let d = start.startOf("day");
  while (d.isBefore(end)) {
    days.push(d);
    d = d.add(1, "day");
  }
  console.log(days.length)
  return days;
}

let scrollLock = 0;

function withScrollLock(fn: () => void) {
  scrollLock++;
  fn();
  nextTick(() => {
    scrollLock--;
  });
}

const days = ref(generateDays(rangeStart.value, rangeEnd.value));

const shiftRight = () => {
  if (isDraggingScrollbar.value) {
    return;
  }
  const body = scrollRef.value;
  const header = headerRef.value;
  if (!body || !header) {
    return;
  }

  const currentDays = days.value;
  const keptDays = currentDays.slice(SHIFT_DAYS);
  const lastDay = keptDays[keptDays.length - 1];
  const newDays = Array.from({ length: SHIFT_DAYS }, (_, i) =>
    lastDay.add(i + 1, 'day')
  );

  days.value = [...keptDays, ...newDays];

  body.scrollLeft -= SHIFT_DAYS * CELL_WIDTH;
  header.scrollLeft -= SHIFT_DAYS * CELL_WIDTH;
  console.log(days.value.map(day => day.format('MMM D')).join(', '));
}

const shiftLeft = () => {
  if (isDraggingScrollbar.value) {
    return;
  }
  const body = scrollRef.value;
  const header = headerRef.value;
  if (!body || !header) {
    return;
  }

  const currentDays = days.value;
  const keptDays = currentDays.slice(0, -SHIFT_DAYS);
  const firstDay = keptDays[0];

  const newDays = Array.from({ length: SHIFT_DAYS }, (_, i) =>
    firstDay.subtract(SHIFT_DAYS - i, 'day')
  );

  days.value = [...newDays, ...keptDays];

  body.scrollLeft += SHIFT_DAYS * CELL_WIDTH;
  header.scrollLeft += SHIFT_DAYS * CELL_WIDTH;
  console.log(days.value.map(day => day.format('MMM D')).join(', '));
}

const onScroll = () => {
  if (scrollLock > 0) {
    return;
  }

  const body = scrollRef.value;
  const header = headerRef.value;
  if (!body || !header) {
    return;
  }

  header.scrollLeft = body.scrollLeft;

  const leftThreshold = 10 * CELL_WIDTH;
  const rightThreshold = body.scrollWidth - body.clientWidth - leftThreshold;

  const scrollLeft = body.scrollLeft;

  if (scrollLeft > rightThreshold) {
    withScrollLock(() => shiftRight());
  }

  if (scrollLeft < leftThreshold) {
    withScrollLock(() => shiftLeft());
  }
};

const scrollToDate = (date: dayjs.Dayjs, center = true) => {
  const body = scrollRef.value;
  if (!body) {
    return;
  }

  const index = days.value.findIndex(d => d.isSame(date, 'day'));
  if (index === -1) {
    return;
  }

  body.scrollLeft = index * CELL_WIDTH;
}

const onMouseDown = (e: MouseEvent) => {
  if (e.target === scrollRef.value) {
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

  await nextTick();
  scrollToDate(dayjs());
});

onUnmounted(() => {
  window.removeEventListener('mousedown', onMouseDown);
  window.removeEventListener('mouseup', onMouseUp);
});
</script>

<style scoped>
.calendar-container {
  position: relative;
  width: 100%;
  height: 80vh;
  display: grid;
  grid-template-rows: auto 1fr;
  border: 1px solid #ccc;
  overflow: hidden;
}

/* HEADER */
.header-container {
  position: sticky;
  top: 0;
  z-index: 20;
  background: white;
  overflow: hidden;
}

.header-inner {
  display: flex;
  min-width: max-content;
}

/* SCROLL AREA */
.scroll-container {
  position: relative;
  overflow: auto;
  height: 100%;
}

.scroll-inner {
  position: relative;
  display: flex;
  flex-direction: column;
  min-width: max-content;
}

/* BODY CELLS */
.body-inner {
  position: relative;
  display: flex;
  flex-direction: column;
  min-width: max-content;
}

.row {
  display: flex;
}

.cell {
  border: 1px solid #ddd;
  min-width: 120px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.room-header,
.room-cell {
  position: sticky;
  left: 0;
  z-index: 5;
  background: white;
  min-width: 150px;
}

/* OVERLAY */
.overlay-container {
  position: absolute;
  top: 0;
  left: 150px; /* width of fixed room column */
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
  color: #004;
  font-size: 12px;
  pointer-events: auto;
}
</style>
