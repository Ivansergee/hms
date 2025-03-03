<template>
  <a-table
    class="plan-table"
    :columns="columns"
    :dataSource="rooms"
    :pagination="false"
    :scroll="{ x: 1700 }"
    rowKey="id"
    bordered
  >
    <template #bodyCell="{ column, record }">
      <div
        @mouseenter="onMouseEnterCell($event, record.id, column.dataIndex)"
        @mouseleave="onMouseLeaveCell(record.id, column.dataIndex)"
      >
        <div
          v-if="column.dataIndex !== 'name'"
          class="cell"
          @mousedown="handleCellMouseDown($event, record.id, column.dataIndex)"
          @mouseup="handleResizeEnd()"
          @mouseover="handleResizeMove(column.dataIndex)"
          @dragenter="onDragEnterCell(record.id, column.dataIndex)"
          @drop="handleDrop(record.id, column.dataIndex)"
          @dragover.prevent
        >
          <div
            v-if="isBookingStart(record.id, column.dataIndex)"
            class="draggable-bar"
            :class="{ hidden: isBarHidden(record.id, column.dataIndex) }"
            :style="{ width: getBookingBarWidth(record.id, column.dataIndex) }"
            :draggable="!ghostBooking"
            @mouseover.stop
            @mouseenter="onMouseEnterBar(record.id, column.dataIndex)"
            @mouseleave="onMouseLeaveBar"
            @dragstart.stop="handleDragStart($event, record.id, column.dataIndex)"
            @drop.stop="handleDropOnBar"
          >
            <div
              class="resize-handle left"
              @dragstart.stop
              @mousedown.stop="handleResizeStart(record.id, column.dataIndex, ResizeDirection.LEFT)"
            ></div>
            Booking
            <div
              class="resize-handle right"
              @dragstart.stop
              @mousedown.stop="handleResizeStart(record.id, column.dataIndex, ResizeDirection.RIGHT)"
            ></div>
          </div>
          <div
            v-if="isGhostBarShown(record.id) && isGhostBarStart(record.id, column.dataIndex)"
            class="ghost-bar"
            :style="getGhostBarStyle"
          >Booking</div>
        </div>
        <div
          v-else
          class="name-cell"
          :class="{ highlighted: isRowHighlighted(record.id) }"
        >
          {{ record.name }}
        </div>
      </div>
    </template>
    <template #headerCell="{ title, column }">
      <div
        v-if="column.dataIndex !== 'name'"
        class="header-cell"
        :class="{ highlighted: isColHighlighted(column.dataIndex) }"
      >
        <span>{{ title }}</span>
      </div>
    </template>
  </a-table>
</template>

<script lang="ts" setup>
import { computed, onMounted, onUnmounted, ref, type StyleValue } from 'vue';
import { type TableColumnType } from 'ant-design-vue';
import { getDaysInMonth, range } from "@/utils/utils.ts";

interface RoomData {
  id: number;
  name: string;
}

interface Booking {
  id: number;
  roomId: number;
  start: number;
  end: number;
}

enum ResizeDirection {
  LEFT = 'left',
  RIGHT = 'right',
}

const cellWidth = 50;

const bookings = ref<Booking[]>([
  { id: 1, roomId: 1, start: 6, end: 8 },
  { id: 2, roomId: 2, start: 9, end: 12 }
]);

const rooms = ref<RoomData[]>([
  { id: 1, name: 'Room 1' },
  { id: 2, name: 'Room 2' },
  { id: 3, name: 'Room 3' },
  { id: 4, name: 'Room 4' },
  { id: 5, name: 'Room 5' },
  { id: 6, name: 'Room 6' },
  { id: 7, name: 'Room 7' },
  { id: 8, name: 'Room 8' },
]);

const columns = computed(() => {
  const daysCols: TableColumnType[] = getDaysInMonth(2025, 1).map((day) => ({
    title: day,
    dataIndex: day.toString(),
    key: 'cell',
    width: cellWidth,
  }));
  daysCols.unshift({
    title: '',
    dataIndex: 'name',
    key: 'title',
    fixed: 'left',
    width: 150,
  });
  return daysCols;
});

const draggedBookingId = ref<number>();
const draggedCellOffset = ref<number>(0);
const sourceDay = ref<number>();
const ghostBooking = ref<Booking>();
const resizeDirection = ref<ResizeDirection>();
const highlightedDays = ref<string[]>([]);
const highlightedRoomId = ref<number>();
const lastDraggedCell = ref<{ roomId: number; dayIndex: string }>();

let dragEndedRecently = false;


const isBookingStart = (roomId: number, dayIndex: string): boolean => {
  const roomBookings = bookings.value.filter(b => b.roomId === roomId);
  return roomBookings.some(b => b.start === Number(dayIndex));
};

const isGhostBarStart = (roomId: number, dayIndex: string): boolean => {
  const isGhostStartCell = resizeDirection.value === ResizeDirection.LEFT
    ? ghostBooking.value?.end === Number(dayIndex)
    : ghostBooking.value?.start === Number(dayIndex);

  return ghostBooking.value?.roomId === roomId && isGhostStartCell;
};

const isGhostBarShown = (roomId: number): boolean => {
  return ghostBooking.value?.roomId === roomId;
};

const getBookingForStart = (roomId: number, dayIndex: string): Booking | undefined => {
  const roomBookings = bookings.value.filter(b => b.roomId === roomId);
  const dayNum = Number(dayIndex);

  return roomBookings.find(b => b.start === dayNum);
};

const getBookingBarWidth = (roomId: number, dayIndex: string): string => {
  const booking = getBookingForStart(roomId, dayIndex);
  if (!booking) {
    return '';
  }

  const daysSpan = booking.end - booking.start + 1;
  const width = daysSpan * cellWidth;

  return `${width}px`;
};

const onMouseEnterCell = (event: MouseEvent, roomId: number, dayIndex: string): void => {
  // Ignore event for the last dragged cell
  if (dragEndedRecently
    && lastDraggedCell.value?.roomId === roomId
    && Number(lastDraggedCell.value?.dayIndex) === Number(dayIndex) - draggedCellOffset.value
  ) {
    return;
  }

  const target = event.currentTarget as HTMLElement;
  if (target.querySelector('.draggable-bar') || target.querySelector('.ghost-bar')) {
    return;
  }
  highlightedDays.value = [dayIndex];
  highlightedRoomId.value = roomId;
};

const onMouseLeaveCell = (roomId: number, dayIndex: string): void => {
  if (ghostBooking.value) {
    return;
  }

  highlightedDays.value = highlightedDays.value.filter(day => day !== dayIndex);
  highlightedRoomId.value = undefined;
};

const onMouseEnterBar = (roomId: number, dayIndex: string): void => {
  const booking = getBookingForStart(roomId, dayIndex);
  if (booking) {
    highlightedDays.value = range(booking.start, booking.end).map(day => day.toString());
    highlightedRoomId.value = booking.roomId;
  }
};

const onMouseLeaveBar = (): void => {
  if (ghostBooking.value) {
    return;
  }

  highlightedDays.value = [];
};

const onDragEnterCell = (roomId: number, dayIndex: string): void => {
  highlightedRoomId.value = roomId;

  const draggedBooking = bookings.value.find(booking => booking.id === draggedBookingId.value);
  if (draggedBooking) {
    const bookingDayAmount = range(draggedBooking.start, draggedBooking.end).length - 1;
    highlightedDays.value = range(Number(dayIndex), Number(dayIndex) + bookingDayAmount)
      .map(day => (day - draggedCellOffset.value).toString());
  }
};

const isColHighlighted = (dayIndex: string): boolean => {
  return highlightedDays.value.includes(dayIndex);
};

const isRowHighlighted = (roomId: number): boolean => {
  return highlightedRoomId.value === roomId;
};

const getGhostBarStyle = computed((): StyleValue => {
  if (!ghostBooking.value || !resizeDirection.value) {
    return;
  }

  const daysSpan = ghostBooking.value.end - ghostBooking.value.start + 1
  const width = daysSpan * cellWidth;

  return resizeDirection.value === ResizeDirection.RIGHT
    ? { left: 0, width: `${width}px` }
    : { right: 0, width: `${width}px` };
});

const handleCellMouseDown = (e: MouseEvent, roomId: number, dayIndex: string): void => {
  const cellOffsetDays = Math.floor(e.offsetX / cellWidth);
  const baseDay = Number(dayIndex);
  sourceDay.value = baseDay + cellOffsetDays;
};

const handleDragStart = (event: DragEvent, roomId: number, dayIndex: string): void => {
  if (ghostBooking.value) {
    return;
  }
  lastDraggedCell.value = { roomId, dayIndex };
  draggedCellOffset.value = Math.trunc(event.offsetX / cellWidth);

  const booking = getBookingForStart(roomId, dayIndex);
  if (booking) {
    draggedBookingId.value = booking.id;
    if (!sourceDay.value) {
      sourceDay.value = booking.start;
    }
  }
};

const handleDrop = (targetRoomId: number, targetDay: string): void => {
  if (!draggedBookingId.value || !sourceDay.value) {
    return;
  }
  dragEndedRecently = true;

  // Disable mouseenter events for a short time
  setTimeout(() => {
    dragEndedRecently = false;
  }, 50);

  const offset = Number(targetDay) - sourceDay.value;
  const booking = bookings.value.find(b => b.id === draggedBookingId.value);
  if (booking) {
    booking.roomId = targetRoomId;
    booking.start += offset;
    booking.end += offset;
  }
  draggedBookingId.value = undefined;
  sourceDay.value = undefined;
};

const handleDropOnBar = () => {
  draggedBookingId.value = undefined;
  sourceDay.value = undefined;
};

const isBarHidden = (roomId: number, dayIndex: string): boolean => {
  return draggedBookingId.value === getBookingForStart(roomId, dayIndex)?.id;
};

// Resizing handlers
const handleResizeStart = (roomId: number, dayIndex: string, side: ResizeDirection) => {
  const booking = bookings.value.find((b) => {
    return b.roomId === roomId && range(b.start, b.end).includes(Number(dayIndex));
  });
  if (booking) {
    ghostBooking.value = { ...booking };
    resizeDirection.value = side;
    highlightedRoomId.value = booking.roomId;
    highlightedDays.value = range(booking.start, booking.end).map(day => day.toString());
  }
};

const handleResizeEnd = () => {
  if (!ghostBooking.value) {
    return;
  }

  const resizingBooking = bookings.value.find(booking => booking.id === ghostBooking.value?.id);
  if (!resizingBooking) {
    return;
  }
  if (resizeDirection.value === ResizeDirection.LEFT) {
    resizingBooking.start = Math.round(ghostBooking.value.start);
  }
  if (resizeDirection.value === ResizeDirection.RIGHT) {
    resizingBooking.end = Math.round(ghostBooking.value.end);
  }
  ghostBooking.value = undefined;
};

const handleResizeMove = (event: MouseEvent) => {
  if (!ghostBooking.value || !event.movementX) {
    return;
  }

  if (resizeDirection.value === ResizeDirection.LEFT) {
    ghostBooking.value.start += event.movementX / cellWidth;
  }
  if (resizeDirection.value === ResizeDirection.RIGHT) {
    ghostBooking.value.end += event.movementX / cellWidth;
  }

  highlightedDays.value = range(Math.round(ghostBooking.value.start),
    Math.round(ghostBooking.value.end)).map(day => day.toString());
};

onMounted(() => {
  document.addEventListener('mousemove', handleResizeMove);
});
onUnmounted(() => {
  document.removeEventListener('mousemove', handleResizeMove);
});
</script>

<style scoped>
.cell {
  min-height: 60px;
  position: relative;
}

.header-cell {
  min-height: 60px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.highlighted {
  background-color: #b5b5b5;
}

.name-cell {
  min-height: 60px;
  display: flex;
  justify-content: left;
  align-items: center;
  padding-left: 10px;
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
  cursor: grab;
  border-radius: 4px;
  background-color: #1890ff;
}

.draggable-bar.hidden {
  transition: 0.01s;
  transform: translateX(-9999px);
}

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

.plan-table :deep(.ant-table-cell) {
  padding: 0;
  position: relative;
}

.plan-table :deep(.ant-table-cell-fix-left) {
  z-index: 20;
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
