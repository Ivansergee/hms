<template>
  <div>
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
            @mousedown="handleCellMouseDown(record.id, column.dataIndex)"
            @mouseup="handleResizeEnd"
            @dragenter="onDragEnterCell(record.id, column.dataIndex)"
            @drop="handleDrop(record.id, column.dataIndex)"
            @dragover.prevent
            @dragstart.prevent
          >
            <DraggableBar
              v-if="bookingStore.getByRoomAndDay(record.id, column.dataIndex)"
              :booking="bookingStore.getByRoomAndDay(record.id, column.dataIndex)"
              :is-draggable="!ghostBooking"
              @mouseenter="onMouseEnterBar(record.id, column.dataIndex)"
              @mouseleave="onMouseLeaveBar"
              @drop.stop="handleDropOnBar"
              @bar-clicked="showEditDialog"
              @drag-start="handleDragStart"
              @resize="handleResizeStart"
            />
            <GhostBar
              v-if="isGhostBarShown && isGhostBarStart(record.id, column.dataIndex)"
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
      <template #headerCell="{ column }">
        <div
          v-if="column.dataIndex !== 'name'"
          class="header-cell"
          :class="{ highlighted: isColHighlighted(column.dataIndex) }"
        >
          <div>{{ getDayFromDate(column.dataIndex) }}</div>
          <div>{{ getWeekdayFromDate(column.dataIndex) }}</div>
        </div>
      </template>
    </a-table>
    <EditBookingDialog
      :open="isEditDialogOpen"
      :booking="bookingToEdit"
      @close="isEditDialogOpen = false"
    />
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue';
import { type TableColumnType } from 'ant-design-vue';
import {
  getAdjacentMonthDates,
  getDaysRange,
  getDayFromDate,
  getDifferenceInDays,
  getWeekdayFromDate, addDays, subtractDays, getTimeFromDate, setTimeOnDate, isSameDay,
} from "@/utils/dateTimeUtils.ts";
import { type Booking } from "@/types/Booking.ts";
import { CELL_WIDTH, ResizeDirection } from "@/utils/planTableUtils.ts";
import GhostBar, { type GhostBooking } from "@/components/PlanTable/GhostBar.vue";
import { useHighlighting } from "@/components/PlanTable/composables/useHighlighting.ts";
import { rooms } from "@/queries/roomQueries.ts";
import { useMouseEvents } from "@/components/PlanTable/composables/useMouseEvents.ts";
import { useBookingStore } from "@/stores/bookingStore.ts";

const columns = computed(() => {
  const daysCols: TableColumnType[] = getAdjacentMonthDates().map((day) => ({
    title: day,
    dataIndex: day,
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

const planTable = ref();

const bookingStore = useBookingStore();
const { highlightedDays, highlightedRoomId, isColHighlighted, isRowHighlighted } = useHighlighting();
const { movementX, isMouseDown } = useMouseEvents(computed(() => planTable.value?.$el))

const draggedBooking = ref<Booking>();
const draggedCellIndex = ref<number>(0);
const ghostBooking = ref<GhostBooking>();
const resizeDirection = ref<ResizeDirection>();
const resizingBookingRange = ref<string[]>([]);
const lastDraggedCell = ref<{ roomId: number; day: string }>();
const isResizing = ref<boolean>(false);
const isCreating = ref<boolean>(false);
const isEditDialogOpen = ref<boolean>(false);
const bookingToEdit = ref<Partial<Booking>>();

const isGhostBarStart = (roomId: number, day: string): boolean => {
  if (!ghostBooking.value) {
    return false;
  }
  const isGhostStartCell = resizeDirection.value === ResizeDirection.LEFT
    ? isSameDay(ghostBooking.value.end, day)
    : isSameDay(ghostBooking.value.start, day);

  return ghostBooking.value?.roomId === roomId && isGhostStartCell;
};

const isGhostBarShown = computed((): boolean => {
  return isCreating.value || isResizing.value;
});

const getNewBooking = (roomId: number, day: string): GhostBooking => {
  return {
    roomId,
    start: day,
    end: day,
  };
}

const onMouseEnterCell = (event: MouseEvent, roomId: number, day: string): void => {
  const target = event.currentTarget as HTMLElement;
  if (target.querySelector('.draggable-bar') || target.querySelector('.ghost-bar')) {
    return;
  }
  highlightedDays.value = [day];
  highlightedRoomId.value = roomId;
};

const onMouseLeaveCell = (roomId: number, dayIndex: string): void => {
  if (ghostBooking.value) {
    return;
  }

  highlightedDays.value = highlightedDays.value.filter(day => day !== dayIndex);
  highlightedRoomId.value = undefined;
};

const onMouseEnterBar = (roomId: number, day: string): void => {
  const booking = bookingStore.getByRoomAndDay(roomId, day);
  if (booking) {
    highlightedDays.value = getDaysRange(booking.start, booking.end);
    highlightedRoomId.value = booking.roomId;
  }
};

const onMouseLeaveBar = (): void => {
  if (ghostBooking.value) {
    return;
  }

  highlightedDays.value = [];
};

const onDragEnterCell = (roomId: number, day: string): void => {
  if (!draggedBooking.value) {
    return;
  }

  highlightedRoomId.value = roomId;
  const bookingDayAmount = getDifferenceInDays(draggedBooking.value.end, draggedBooking.value.start);
  const startWithOffset = subtractDays(day, draggedCellIndex.value);
  const endWithOffset = subtractDays(addDays(day, bookingDayAmount), draggedCellIndex.value);
  highlightedDays.value = getDaysRange(startWithOffset, endWithOffset);
};

const handleCellMouseDown = (roomId: number, dayIndex: string): void => {
  if (!bookingStore.getByRoomAndDay(roomId, dayIndex)) {
    ghostBooking.value = getNewBooking(roomId, dayIndex);
  }
};

watch(movementX, () => {
  if (movementX.value > 20 && ghostBooking.value && !isResizing.value) {
    isCreating.value = true;
  }
})

watch(isMouseDown, () => {
  if (!isMouseDown.value) {
    isCreating.value = false;
    isResizing.value = false;
  }
})

const handleDragStart = (data: { booking: Booking, clickedCellIndex: number }): void => {
  if (ghostBooking.value) {
    return;
  }

  lastDraggedCell.value = { roomId: data.booking.roomId, day: data.booking.start };
  draggedCellIndex.value = data.clickedCellIndex;

  draggedBooking.value = data.booking;
};

const handleDrop = async (targetRoomId: number, targetDay: string): Promise<void> => {
  if (!draggedBooking.value) {
    return;
  }

  const bookingLength = getDifferenceInDays(draggedBooking.value.end, draggedBooking.value.start);
  const startTime = getTimeFromDate(draggedBooking.value.start);
  const endTime = getTimeFromDate(draggedBooking.value.end);

  await bookingStore.editBooking({
    id: draggedBooking.value.id,
    roomId: targetRoomId,
    start: setTimeOnDate(subtractDays(targetDay, draggedCellIndex.value), startTime),
    end: setTimeOnDate(addDays(targetDay, bookingLength - draggedCellIndex.value), endTime),
  });

  draggedBooking.value = undefined;
};

const handleDropOnBar = () => {
  draggedBooking.value = undefined;
};

// Resizing handlers
const handleResizeStart = (data: { booking: Booking; direction: ResizeDirection }) => {
  isResizing.value = true;
  ghostBooking.value = {
    id: data.booking.id,
    roomId: data.booking.roomId,
    start: data.booking.start,
    end: data.booking.end,
  };
  resizeDirection.value = data.direction;
  // highlightedRoomId.value = data.booking.roomId;
  // highlightedDays.value = getDaysRange(data.booking.start, data.booking.end);
};

const handleResizeEnd = () => {
  if (!ghostBooking.value || !resizingBookingRange.value.length) {
    return;
  }

  const start = resizingBookingRange.value[0];
  const end = resizingBookingRange.value[resizingBookingRange.value.length - 1];

  if (isCreating.value) {
    showEditDialog({
      start,
      end,
      roomId: ghostBooking.value.roomId,
    })
    bookingStore.createBooking({
      start,
      end,
      roomId: ghostBooking.value.roomId,
      guestId: 1,
    });
  } else {
    bookingStore.editBooking({ ...ghostBooking.value, guestId: 1 })
  }

  ghostBooking.value = undefined;
};

const onGhostBarRangeChange = (range: string[]): void => {
  highlightedDays.value = range;
  resizingBookingRange.value = range;
};

const showEditDialog = (booking?: Partial<Booking>) => {
  bookingToEdit.value = booking;
  isEditDialogOpen.value = true;
};

onMounted(() => {
  bookingStore.fetchBookings();
});
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
  flex-direction: column;
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
