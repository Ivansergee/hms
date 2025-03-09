<template>
  <a-table
    ref="planTable"
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
          @mouseup="handleResizeEnd"
          @dragenter="onDragEnterCell(record.id, column.dataIndex)"
          @drop="handleDrop(record.id, column.dataIndex)"
          @dragover.prevent
          @dragstart.prevent
        >
          <DraggableBar
            v-if="isBookingStart(record.id, column.dataIndex)"
            :booking="getBooking(record.id, column.dataIndex)"
            :dragged-booking-id="draggedBookingId"
            :is-draggable="!ghostBooking"
            @resize="handleResizeStart"
            @mouseenter="onMouseEnterBar(record.id, column.dataIndex)"
            @mouseleave="onMouseLeaveBar"
            @dragstart.stop="handleDragStart($event, record.id, column.dataIndex)"
            @drop.stop="handleDropOnBar"
          />
          <GhostBar
            v-if="isGhostBarShown(record.id) && isGhostBarStart(record.id, column.dataIndex)"
            :data="ghostBooking"
            :direction="resizeDirection"
            :xOffset="movementX"
            @ghost-bar-range="onGhostBarRangeChange"
          />
        </div>
        <div
          v-else
          class="name-cell"
          :class="{ highlighted: isRowHighlighted(record.id) }"
          @mousedown.prevent
          @dragstart.prevent
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
import { computed, ref } from 'vue';
import { type TableColumnType } from 'ant-design-vue';
import { getDaysInMonth, range } from "@/utils/utils.ts";
import { type Booking } from "@/types/Booking.ts";
import { CELL_WIDTH, ResizeDirection } from "@/components/PlanTable/planTableUtils.ts";
import GhostBar, { type GhostBooking } from "@/components/PlanTable/GhostBar.vue";
import { useHighlighting } from "@/components/PlanTable/composables/useHighlighting.ts";
import { rooms } from "@/queries/roomQueries.ts";
import { bookings } from "@/queries/bookingQueries.ts";
import {useMouseEvents} from "@/components/PlanTable/composables/useMouseEvents.ts";

const columns = computed(() => {
  const daysCols: TableColumnType[] = getDaysInMonth(2025, 1).map((day) => ({
    title: day,
    dataIndex: day.toString(),
    key: 'cell',
    width: CELL_WIDTH,
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

const bookingsRef = ref<Booking[]>(bookings);
const planTable = ref();
const draggedBookingId = ref<number>();
const draggedCellOffset = ref<number>(0);
const sourceDay = ref<number>();
const ghostBooking = ref<GhostBooking>();
const resizeDirection = ref<ResizeDirection>();
const resizingBookingRange = ref<string[]>([]);
const lastDraggedCell = ref<{ roomId: number; dayIndex: string }>();
const isCreating = ref<boolean>(false);

const { highlightedDays, highlightedRoomId, isColHighlighted, isRowHighlighted } = useHighlighting();
const { movementX } = useMouseEvents(computed(() => planTable.value?.$el))

let dragEndedRecently = false;

const isBookingStart = (roomId: number, dayIndex: string): boolean => {
  const roomBookings = bookingsRef.value.filter(b => b.roomId === roomId);
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

const getBooking = (roomId: number, dayIndex: string): Booking | undefined => {
  const roomBookings = bookingsRef.value.filter(b => b.roomId === roomId);
  const dayNum = Number(dayIndex);

  return roomBookings.find(b => b.start === dayNum);
};

const getNewBooking = (roomId: number, dayIndex: string): GhostBooking => {
  return {
    roomId,
    start: Number(dayIndex),
    end: Number(dayIndex),
  };
}

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
  const booking = getBooking(roomId, dayIndex);
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

  const draggedBooking = bookingsRef.value.find(booking => booking.id === draggedBookingId.value);
  if (draggedBooking) {
    const bookingDayAmount = range(draggedBooking.start, draggedBooking.end).length - 1;
    highlightedDays.value = range(Number(dayIndex), Number(dayIndex) + bookingDayAmount)
      .map(day => (day - draggedCellOffset.value).toString());
  }
};

const handleCellMouseDown = (e: MouseEvent, roomId: number, dayIndex: string): void => {
  const cellOffsetDays = Math.floor(e.offsetX / CELL_WIDTH);
  const baseDay = Number(dayIndex);
  sourceDay.value = baseDay + cellOffsetDays;
  if (!getBooking(roomId, dayIndex)) {
    isCreating.value = true;
    ghostBooking.value = getNewBooking(roomId, dayIndex);
  }
};

const handleDragStart = (event: DragEvent, roomId: number, dayIndex: string): void => {
  if (ghostBooking.value) {
    return;
  }
  lastDraggedCell.value = { roomId, dayIndex };
  draggedCellOffset.value = Math.trunc(event.offsetX / CELL_WIDTH);

  const booking = getBooking(roomId, dayIndex);
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
  const booking = bookingsRef.value.find(b => b.id === draggedBookingId.value);
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

// Resizing handlers
const handleResizeStart = (data: { booking: Booking; direction: ResizeDirection }) => {
  ghostBooking.value = { ...data.booking };
  resizeDirection.value = data.direction;
  highlightedRoomId.value = data.booking.roomId;
  highlightedDays.value = range(data.booking.start, data.booking.end).map(day => day.toString());
};

const handleResizeEnd = () => {
  if (!ghostBooking.value || !resizingBookingRange.value.length) {
    return;
  }

  const start = Number(resizingBookingRange.value[0]);
  const end = Number(resizingBookingRange.value[resizingBookingRange.value.length - 1]);

  if (isCreating.value) {
    bookingsRef.value.push({
      id: 123,
      start,
      end,
      roomId: ghostBooking.value.roomId,
    });
  } else {
    const booking = bookingsRef.value.find(booking => booking.id === ghostBooking.value?.id);
    if (booking) {
      booking.start = start;
      booking.end = end;
    }
  }

  ghostBooking.value = undefined;
};

const onGhostBarRangeChange = (range: string[]): void => {
  highlightedDays.value = range;
  resizingBookingRange.value = range;
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

.header-cell {
  min-height: 60px;
  display: flex;
  justify-content: center;
  align-items: center;
  user-select: none;
  -webkit-user-drag: none;
}

.highlighted {
  background-color: #b5b5b5;
}

.name-cell {
  min-height: 40px;
  display: flex;
  justify-content: left;
  align-items: center;
  padding-left: 10px;
}

.plan-table :deep(.ant-table-cell) {
  padding: 0;
  position: relative;
}

.plan-table :deep(.ant-table-cell-fix-left) {
  z-index: 20;
}
</style>
