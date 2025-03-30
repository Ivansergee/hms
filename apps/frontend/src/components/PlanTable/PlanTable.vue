<template>
  <div>
    <button @click="onPrevMonth()">Prev</button>
    <button @click="onNextMonth()">Next</button>
    <span>{{ movementX }} {{ positionX }}</span>
  </div>
  <div>
    {{ visibleStartDate.format('MMMM') }}
  </div>
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
        <PlanTableCell
          v-if="column.dataIndex !== 'name'"
          :room-id="record.id"
          :day="column.dataIndex"
          :visible-start-date="visibleStartDate"
          :visible-end-date="visibleEndDate"
          :xOffset="movementX"
          :is-dragging="!!draggingBooking"
          :is-creating="isCreating"
          :is-resizing="isResizing"
          @dragenter="onDragEnterCell(record.id, column.dataIndex)"
          @drop="onDrop(record.id, column.dataIndex)"
          @drag-start="onDragStart"
          @bar-clicked="showEditDialog"
          @resize-start="isResizing = true"
          @resize-end="onResizeEnd"
        />
        <div
          v-else
          class="name-cell"
          :class="{ highlighted: highlightStore.isRowHighlighted(record.id) }"
          @mousedown.prevent
          @dragstart.prevent
        >
          {{ record.name }}
        </div>
      </template>
      <template #headerCell="{ column }">
        <div
          v-if="column.dataIndex !== 'name'"
          class="header-cell"
          :class="{ highlighted: highlightStore.isColHighlighted(column.dataIndex) }"
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
    <ConfirmChangeDialog
      :open="isConfirmDialogOpen"
      :booking="currentBooking"
      :changed-booking="changedBooking"
      @close="onConfirmDialogClose"
    />
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue';
import { type TableColumnType } from 'ant-design-vue';
import {
  getDaysRange,
  getDayFromDate,
  getDifferenceInDays,
  getWeekdayFromDate,
  addDays,
  getMonthDates,
} from "@/utils/dateTimeUtils.ts";
import { type Booking, type BookingWithFlags } from "@/types/Booking.ts";
import { CELL_WIDTH } from "@/utils/planTableUtils.ts";
import { rooms } from "@/queries/roomQueries.ts";
import { useMouseEvents } from "@/components/PlanTable/composables/useMouseEvents.ts";
import { useBookingStore } from "@/stores/bookingStore.ts";
import dayjs from "dayjs";
import { useHighlightStore } from "@/stores/highlightStore.ts";

const planTable = ref();

const bookingStore = useBookingStore();
const highlightStore = useHighlightStore();

const { movementX, positionX, isMouseDown } = useMouseEvents(computed(() => planTable.value?.$el))

const visibleStartDate = ref<dayjs.Dayjs>(dayjs().startOf('month'));
const visibleEndDate = ref<dayjs.Dayjs>(dayjs().endOf('month'));

const draggingBooking = ref<BookingWithFlags>();
const dragStartDay = ref<string>();

const isResizing = ref<boolean>(false);
const isCreating = ref<boolean>(false);

const isEditDialogOpen = ref<boolean>(false);
const bookingToEdit = ref<Partial<Booking>>();

const isConfirmDialogOpen = ref<boolean>(false);
const currentBooking = ref<Booking>();
const changedBooking = ref<Booking>();

const columns = computed<TableColumnType[]>(() => {
  const daysCols: TableColumnType[] = getMonthDates(visibleStartDate.value).map((day) => ({
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

const fetchBookings = () => {
  bookingStore.fetchBookings(
    dayjs(visibleStartDate.value).startOf('month').format('YYYY-MM-DD'),
    dayjs(visibleStartDate.value).endOf('month').format('YYYY-MM-DD'),
  ).catch(console.error);
};

const onPrevMonth = () => {
  visibleStartDate.value = visibleStartDate.value.subtract(1, 'month');
  visibleEndDate.value = visibleEndDate.value.subtract(1, 'month');
  fetchBookings();
};

const onNextMonth = () => {
  visibleStartDate.value = visibleStartDate.value.add(1, 'month');
  visibleEndDate.value = visibleEndDate.value.add(1, 'month');
  fetchBookings();
};

const onDragStart = (data: { booking: BookingWithFlags, dragStartDay: string }): void => {
  draggingBooking.value = data.booking;
  dragStartDay.value = data.dragStartDay;
}

const onDrop = async (targetRoomId: number, targetDay: string): Promise<void> => {
  if (!draggingBooking.value || !dragStartDay.value) {
    return;
  }

  const daysOffset = getDifferenceInDays(dragStartDay.value, targetDay);

  currentBooking.value = draggingBooking.value;
  changedBooking.value = {
    ...draggingBooking.value,
    roomId: targetRoomId,
    start: addDays(draggingBooking.value.start, daysOffset),
    end: addDays(draggingBooking.value.end, daysOffset),
  };
  isConfirmDialogOpen.value = true;
};

const onDragEnterCell = (roomId: number, day: string): void => {
  if (!draggingBooking.value || !dragStartDay.value) {
    return;
  }

  highlightStore.highlightedRoom = roomId;

  const daysOffset = getDifferenceInDays(dragStartDay.value, day);
  highlightStore.highlightedDays = getDaysRange(
    addDays(draggingBooking.value.start, daysOffset),
    addDays(draggingBooking.value.end, daysOffset),
  );
};

const onResizeEnd = (data: { booking: Booking | undefined, changedBooking: Booking | undefined }) => {
  currentBooking.value = data.booking;
  changedBooking.value = data.changedBooking;
  isConfirmDialogOpen.value = true;
};

const onConfirmDialogClose = (): void => {
  isResizing.value = false;
  draggingBooking.value = undefined;
  dragStartDay.value = undefined;
  isConfirmDialogOpen.value = false;
};

const showEditDialog = (booking?: Partial<Booking>) => {
  bookingToEdit.value = booking;
  isEditDialogOpen.value = true;
};

// watch(movementX, () => {
//   if (movementX.value > 20 && ghostBooking.value) {
//     isCreating.value = true;
//   }
// })

watch(isMouseDown, () => {
  if (!isMouseDown.value) {
    isCreating.value = false;
  }
})

onMounted(() => {
  fetchBookings();
});
</script>

<style scoped>
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
