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
        @drop="handleDrop($event, record.id, column.dataIndex)"
      >
        <div
          v-if="isBookingStart(record.id, column.dataIndex)"
          class="draggable-bar"
          :style="{ width: getBookingBarWidth(record.id, column.dataIndex) }"
          :draggable="!ghostBooking"
          @mouseover.stop
          @dragstart.stop="handleDragStart($event, record.id, column.dataIndex)"
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
      >
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
const ghostBooking = ref<Booking>();
const resizeDirection = ref<ResizeDirection>();

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

const handleCellMouseDown = (e: MouseEvent, roomId: number, dayIndex: string) => {
  const cellOffsetDays = Math.floor(e.offsetX / cellWidth);
  const baseDay = Number(dayIndex);
  sourceDay.value = baseDay + cellOffsetDays;
};

const handleDragStart = (event: Event, roomId: number, dayIndex: string): void => {
  if (ghostBooking.value) {
    return;
  }

  const booking = getBookingForStart(roomId, dayIndex);
  if (booking) {
    draggedBookingId.value = booking.id;
    if (!sourceDay.value) {
      sourceDay.value = booking.start;
    }
  }

  const target = event.target as HTMLElement;
  setTimeout(() => {
    target.style.visibility = "hidden";
  }, 0);
};

const handleDrop = (event: Event, targetRoomId: number, targetDay: string) => {
  if (!draggedBookingId.value || !sourceDay.value) {
    return;
  }

  const offset = Number(targetDay) - sourceDay.value;
  const booking = bookings.value.find(b => b.id === draggedBookingId.value);
  if (booking) {
    booking.roomId = targetRoomId;
    booking.start += offset;
    booking.end += offset;
  }
  draggedBookingId.value = undefined;
  sourceDay.value = undefined;

  const target = event.target as HTMLElement;
  target.style.visibility = "visible";
};

// Resizing handlers
const handleResizeStart = (roomId: number, dayIndex: string, side: ResizeDirection) => {
  const booking = bookings.value.find(b => b.roomId === roomId && range(b.start, b.end).includes(Number(dayIndex)));
  if (booking) {
    ghostBooking.value = { ...booking };
    resizeDirection.value = side;
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

.name-cell {
  padding: 10px;
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

.plan-table :deep(.ant-table-tbody > tr > td.ant-table-cell) {
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
