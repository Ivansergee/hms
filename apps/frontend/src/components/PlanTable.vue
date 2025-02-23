<template>
  <a-table
    class="plan-table"
    :columns="columns"
    :dataSource="rooms"
    rowKey="id"
    :pagination="false"
    bordered
    :scroll="{ x: 1700 }"
  >
    <template #bodyCell="{ column, record }">
      <div
        v-if="column.dataIndex !== 'name'"
        class="cell"
        :data-day="column.dataIndex"
        @mousedown="handleCellMouseDown($event, record.id, column.dataIndex)"
        @mouseup="handleResizeEnd()"
        @mouseover="handleResizeMove(column.dataIndex)"
        @dragover.prevent
        @drop="handleDrop(record.id, column.dataIndex)"
      >
        <div
          v-if="isBookingStart(record.id, column.dataIndex)"
          class="draggable-bar"
          :style="getBookingBarStyle(record.id, column.dataIndex)"
          :draggable="!resizedBooking"
          @mouseover.stop
          @dragstart.stop="handleDragStart(record.id, column.dataIndex)"
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
      </div>
      <div v-else>
        {{ record.name }}
      </div>
    </template>
  </a-table>
</template>

<script lang="ts" setup>
import {computed, onMounted, onUnmounted, ref, type StyleValue} from 'vue';
import { type TableColumnType } from 'ant-design-vue';
import {getDaysInMonth, range} from "@/utils/utils.ts";

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
]);

const columns = computed(() => {
  const daysCols: TableColumnType[] = getDaysInMonth(2025, 1).map((day) => ({
    title: day,
    dataIndex: day.toString(),
    key: 'cell',
    width: cellWidth,
  }));
  daysCols.unshift({
    title: 'Room',
    dataIndex: 'name',
    key: 'title',
    fixed: 'left',
    width: 150,
  });
  return daysCols;
});

const draggedBookingId = ref<number>();
const sourceDay = ref<number>();
const resizedBooking = ref<Booking>();
const resizeDirection = ref<ResizeDirection>();

const isBookingStart = (roomId: number, dayIndex: string): boolean => {
  const roomBookings = bookings.value.filter(b => b.roomId === roomId);
  const dayNum = Number(dayIndex);
  return roomBookings.some(b => b.start === dayNum);
};

const getBookingForStart = (roomId: number, dayIndex: string): Booking | undefined => {
  const roomBookings = bookings.value.filter(b => b.roomId === roomId);
  const dayNum = Number(dayIndex);
  return roomBookings.find(b => b.start === dayNum);
};

const getBookingBarStyle = (roomId: number, dayIndex: string): StyleValue => {
  const booking = getBookingForStart(roomId, dayIndex);
  if (!booking) return {};
  const daysSpan = booking.end - booking.start + 1;
  const width = daysSpan * cellWidth;
  return {
    position: 'absolute',
    left: 0,
    top: 0,
    width: `${width}px`,
    height: '100%',
    backgroundColor: '#1890ff',
    borderRadius: '4px',
    cursor: 'grab',
    zIndex: 10,
  };
};

const handleCellMouseDown = (e: MouseEvent, roomId: number, dayIndex: string) => {
  const cellOffsetDays = Math.floor(e.offsetX / cellWidth);
  const baseDay = Number(dayIndex);
  sourceDay.value = baseDay + cellOffsetDays;
};

const handleDragStart = (roomId: number, dayIndex: string): void => {
  if (resizedBooking.value) {
    return;
  }
  const booking = getBookingForStart(roomId, dayIndex);
  if (booking) {
    draggedBookingId.value = booking.id;
    if (!sourceDay.value) {
      sourceDay.value = booking.start;
    }
  }
};

const handleDrop = (targetRoomId: number, targetDay: string) => {
  if (draggedBookingId.value && sourceDay.value) {
    const offset = Number(targetDay) - sourceDay.value;
    const booking = bookings.value.find(b => b.id === draggedBookingId.value);
    if (booking) {
      booking.roomId = targetRoomId;
      booking.start += offset;
      booking.end += offset;
    }
    draggedBookingId.value = undefined;
    sourceDay.value = undefined;
  }
};

// Resizing handlers
let resizeOffset = 0;

const handleResizeStart = (roomId: number, dayIndex: string, side: ResizeDirection) => {
  const booking = bookings.value.find(b => b.roomId === roomId && range(b.start, b.end).includes(Number(dayIndex)));
  if (booking) {
    resizedBooking.value = booking;
    resizeDirection.value = side;
  }
};

const handleResizeEnd = () => {
  if (!resizedBooking.value) {
    return;
  }
  if (resizeDirection.value === ResizeDirection.LEFT) {
    resizedBooking.value.start = Math.round(resizedBooking.value.start);
  }
  if (resizeDirection.value === ResizeDirection.RIGHT) {
    resizedBooking.value.end = Math.round(resizedBooking.value.end);
  }
  resizedBooking.value = undefined;
  resizeOffset = 0;
};

const handleResizeMove = (event: MouseEvent) => {
  if (!resizedBooking.value || !event.movementX) {
    return;
  }
  resizeOffset += event.movementX;

  if (resizeDirection.value === ResizeDirection.LEFT) {
    resizedBooking.value.start += event.movementX / cellWidth;
  }
  if (resizeDirection.value === ResizeDirection.RIGHT) {
    resizedBooking.value.end += event.movementX / cellWidth;
  }
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
}

.plan-table :deep(.ant-table-tbody > tr > td.ant-table-cell) {
  padding: 0;
  position: relative;
}

.resize-handle {
  position: absolute;
  width: 6px;
  height: 100%;
  background-color: #1890ff;
  cursor: ew-resize;
  top: 0;
}

.resize-handle.left {
  left: -3px;
}

.resize-handle.right {
  right: -3px;
}
</style>
