<template>
  <div class="room-selector">
    <a-row :gutter="0">
      <a-col :span="10">
        <a-table
          class="room-selector__left-side"
          :columns="categoryCols"
          :data-source="availableCategories"
          row-key="id"
          :pagination="false"
          size="small"
          :custom-row="customCategoryRow"
          :row-class-name="getCategoryRowClassName"
          :scroll="{ y: 195 }"
        />
      </a-col>

      <a-col :span="14">
        <a-table
          class="room-selector__right-side"
          :columns="roomCols"
          :data-source="filteredRooms"
          row-key="id"
          :pagination="false"
          size="small"
          :locale="{ emptyText }"
          :custom-row="customRoomRow"
          :row-class-name="getRoomRowClassName"
          :scroll="{ y: 195 }"
        >
          <template #bodyCell="{ record }">
            <RoomView
              :room="record as RoomWithCategory"
              :room-name-align="'left'"
            />
          </template>
        </a-table>
      </a-col>
    </a-row>
  </div>
</template>
<script setup lang="ts">
import {
  computed, nextTick, type PropType, ref, watch,
} from 'vue';
import type { Room, RoomWithCategory } from '@/types/Room.ts';
import type { Category } from '@shared/types/category.ts';
import type { ColumnType } from 'ant-design-vue/es/table';
import { useScopedI18n } from '@/composables/useScopedI18n.ts';
import { useRoomStore } from '@/stores/roomStore.ts';

defineOptions({ name: 'RoomSelector' });
const { t } = useScopedI18n();

const props = defineProps({
  availableRooms: {
    type: Array as PropType<RoomWithCategory[]>,
    required: true,
  },
  isRangeSet: {
    type: Boolean,
  },
});
const roomStore = useRoomStore();

const selectedRoomId = defineModel<number>();
const selectedCategoryId = ref<number>(0);

const categoryCols: ColumnType[] = [
  {
    title: t('category'),
    dataIndex: 'name',
    key: 'name',
    ellipsis: true,
  },
];

const roomCols: ColumnType[] = [
  {
    title: t('room'),
    dataIndex: 'name',
    key: 'room',
  },
];

const availableCategories = computed<Category[]>(() => {
  const categories: Category[] = roomStore.categories.filter((category) => {
    const availableCategoryIds = props.availableRooms.map((room) => room.category?.id);
    return availableCategoryIds.includes(category.id);
  });
  categories.unshift({
    id: 0, name: t('all'), tag: '', capacity: 0,
  });
  return categories;
});

const filteredRooms = computed<RoomWithCategory[]>(() => {
  if (selectedCategoryId.value === 0) {
    return props.availableRooms;
  }
  return props.availableRooms.filter((room) => room.category?.id === selectedCategoryId.value);
});

const emptyText = computed<string>(() => (props.isRangeSet ? t('noRoomsAvailable') : t('selectDates')));

const customCategoryRow = (record: Category) => ({
  onClick: () => {
    selectedCategoryId.value = record.id;
  },
});

const customRoomRow = (record: Room) => ({
  onClick: () => {
    selectedRoomId.value = record.id;
  },
});

const getCategoryRowClassName = (record: Category): string => (selectedCategoryId.value === record.id ? 'selected' : '');

const getRoomRowClassName = (record: Room): string => (selectedRoomId.value === record.id ? 'room selected' : '');

const scrollToSelected = async () => {
  await nextTick();
  const element = document.querySelector('.room.selected');
  if (element) {
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
    });
  }
};

watch(selectedCategoryId, () => {
  selectedRoomId.value = undefined;
});

watch(selectedRoomId, (val) => {
  if (val) {
    scrollToSelected();
  }
}, { immediate: true });
</script>
<style scoped>
.room-selector {
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  overflow: hidden;
  background: #fff;
}

:deep(.ant-table-body) {
  height: 195px !important;
  min-height: 195px !important;
  overflow-y: auto !important;
}

:deep(.ant-table-placeholder) {
  height: 195px !important;
  display: flex;
  align-items: center;
  justify-content: center;
}

:deep(.ant-table-placeholder .ant-table-cell) {
  border-bottom: none !important;
}

.room-selector__left-side :deep(.ant-table),
.room-selector__right-side :deep(.ant-table) {
  border-radius: 0 !important;
}

.room-selector__left-side {
  border-right: 1px solid #f0f0f0;
}

.room-selector__right-side :deep(.ant-table-tbody .ant-table-row .ant-table-cell) {
  padding: 4px;
}

:deep(.ant-table-wrapper .ant-table) {
  border: none !important;
}

:deep(.ant-table-row) {
  cursor: pointer;
}

:deep(.ant-table-content) {
  overflow-x: hidden !important;
}
</style>
