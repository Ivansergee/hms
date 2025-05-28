<template>
  <div>
    <button @click="onPrevMonth()">Prev</button>
    <button @click="onNextMonth()">Next</button>
    <button @click="onCreate()">Create</button>
  </div>
  <div>
    {{ visibleStartDate.format('MMMM') }}
  </div>
  <div>
    <a-table
      class="plan-table"
      :columns="columns"
      :dataSource="roomStore.rooms"
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
          :on-create="showCreateDialog"
          :on-confirm="showConfirmDialog"
          @bar-clicked="showDetailsDialog"
          @restore="onRestoreFromTray"
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
    <CreateBookingDialog
      :open="isCreateDialogOpen"
      :state="createFormState"
      @close="onCreateDialogClose"
      @minimize="onCreateDialogMinimize"
    />
    <BookingDetailsDialog
      :open="isDetailsDialogOpen"
      @close="isDetailsDialogOpen = false"
    />
    <ConfirmChangeDialog
      v-if="currentBooking && changedBooking"
      :open="isConfirmDialogOpen"
      :booking="currentBooking"
      :changed-booking="changedBooking"
      @close="onConfirmDialogClose"
    />
    <Tray
      @restore="onRestoreFromTray"
    />
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue';
import {
  getDayFromDate,
  getMonthDates,
  getWeekdayFromDate,
} from "@/utils/dateTimeUtils.ts";
import { CELL_WIDTH } from "@/utils/planTableUtils.ts";
import { useBookingStore } from "@/stores/bookingStore.ts";
import dayjs from "dayjs";
import { useHighlightStore } from "@/stores/highlightStore.ts";
import { useRoomStore } from "@/stores/roomStore.ts";
import type { BookingShort, BookingFormState } from "@shared/types/booking.ts";
import type { ColumnType } from "ant-design-vue/es/table";
import { bookingQueries } from "@/queries/bookingQueries.ts";
import { TrayItemType, useTrayStore } from "@/stores/trayStore.ts";

const bookingStore = useBookingStore();
const highlightStore = useHighlightStore();
const roomStore = useRoomStore();
const trayStore = useTrayStore();

const visibleStartDate = ref<dayjs.Dayjs>(dayjs().startOf('month'));
const visibleEndDate = ref<dayjs.Dayjs>(dayjs().endOf('month'));

const isCreateDialogOpen = ref<boolean>(false);
const isDetailsDialogOpen = ref<boolean>(false);
const createFormState = ref<BookingFormState>();

const isConfirmDialogOpen = ref<boolean>(false);
const createDialogResolver = ref<(() => void) | undefined>();
const currentBooking = ref<BookingShort>();
const changedBooking = ref<BookingShort>();

const columns = computed<ColumnType[]>(() => {
  const daysCols: ColumnType[] = getMonthDates(visibleStartDate.value).map((day) => ({
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
  bookingStore.fetch(
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

const onCreate = () => {
  createFormState.value = {
    id: Date.now(),
    guests: [],
  };
  isCreateDialogOpen.value = true;
};

const showDetailsDialog = async (bookingId?: number): Promise<void> => {
  if (bookingId) {
    const trayData = trayStore.pop(bookingId);
    createFormState.value = trayData ?? await bookingQueries.getDetails(bookingId);
  }
  isDetailsDialogOpen.value = true;
};

const onRestoreFromTray = (bookingId: number): void => {
  const trayItem = trayStore.pop(bookingId);
  if (!trayItem) {
    return;
  }
  const { isUnsaved, type, resolver, ...bookingData } = trayItem;
  createDialogResolver.value = resolver;
  createFormState.value = bookingData;
  isCreateDialogOpen.value = true;
};

let confirmDialogResolver: ((value: (void | PromiseLike<void>)) => void) | undefined;

const showConfirmDialog = async (after: BookingShort, before: BookingShort): Promise<void> => {
  currentBooking.value = before;
  changedBooking.value = after;
  isConfirmDialogOpen.value = true;
  return new Promise((resolve) => {
    confirmDialogResolver = resolve;
  });
};

const onConfirmDialogClose = (): void => {
  isConfirmDialogOpen.value = false;
  currentBooking.value = undefined;
  changedBooking.value = undefined;
  confirmDialogResolver?.();
  confirmDialogResolver = undefined;
}

const showCreateDialog = async (bookingState: BookingFormState): Promise<void> => {
  createFormState.value = bookingState;
  isCreateDialogOpen.value = true;
  return new Promise((resolve) => {
    createDialogResolver.value = resolve;
  });
};

const onCreateDialogClose = (resolve: boolean = true): void => {
  isCreateDialogOpen.value = false;
  createFormState.value = undefined;
  if (resolve) {
    createDialogResolver.value?.();
  }
  createDialogResolver.value = undefined;
}

const onCreateDialogMinimize = (dialogState: BookingFormState): void => {
  trayStore.add(
    dialogState,
    TrayItemType.CREATE,
    true,
    createDialogResolver.value,
  );
  onCreateDialogClose(false);
};

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
