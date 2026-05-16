<template>
  <div class="room-view">
    <a-dropdown
      v-if="isStatusSelectable"
      trigger="click"
    >
      <a-button type="text">
        <a-badge :status="badgeStatus" />
      </a-button>
      <template #overlay>
        <a-menu
          v-model:selected-keys="selectedKeys"
          @click="onStatusChange"
        >
          <a-menu-item :key="RoomStatus.CLEAN">
            <a-badge
              status="success"
              :text="translateEnum(RoomStatus, RoomStatus.CLEAN)"
            />
          </a-menu-item>
          <a-menu-item :key="RoomStatus.PREPARING">
            <a-badge
              status="warning"
              :text="translateEnum(RoomStatus, RoomStatus.PREPARING)"
            />
          </a-menu-item>
          <a-menu-item :key="RoomStatus.DIRTY">
            <a-badge
              status="error"
              :text="translateEnum(RoomStatus, RoomStatus.DIRTY)"
            />
          </a-menu-item>
        </a-menu>
      </template>
    </a-dropdown>
    <div
      v-else
      class="room-view__readonly-status"
    >
      <a-badge :status="badgeStatus" />
    </div>

    <a-typography-text
      v-if="isCategoryVisible"
      class="room-view__category"
      :content="room.category?.tag"
      type="secondary"
      ellipsis
    />
    <a-typography-text
      class="room-view__name"
      :content="room.name"
      :style="{textAlign: roomNameAlign}"
      ellipsis
    />
  </div>
</template>
<script setup lang="ts">
import type { RoomWithCategory } from '@/types/Room.ts';
import { computed, type PropType, ref } from 'vue';
import { RoomStatus } from '@shared/enums/RoomStatus.ts';
import type { MenuProps } from 'ant-design-vue';
import { useRoomStore } from '@/stores/roomStore.ts';
import { translateEnum } from '@/i18n/i18n.ts';

const props = defineProps({
  room: {
    type: Object as PropType<RoomWithCategory>,
    required: true,
  },
  roomNameAlign: {
    type: String as PropType<'left' | 'center' | 'right'>,
    required: true,
  },
  isStatusSelectable: {
    type: Boolean,
  },
  isCategoryVisible: {
    type: Boolean,
  },
});
defineOptions({ name: 'RoomView' });

const roomStore = useRoomStore();

const selectedKeys = ref<RoomStatus[]>([props.room.status]);

const badgeStatus = computed(() => {
  switch (props.room.status) {
    case RoomStatus.CLEAN:
      return 'success';
    case RoomStatus.DIRTY:
      return 'error';
    case RoomStatus.PREPARING:
      return 'warning';
    default:
      return 'default';
  }
});

const onStatusChange: MenuProps['onClick'] = (e) => {
  const newStatus = e.key as RoomStatus;
  selectedKeys.value = [newStatus];
  roomStore.setStatus(props.room.id, newStatus);
};
</script>
<style scoped>
.room-view {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.room-view :deep(.ant-btn) {
  padding: 4px 10px;
}

.room-view :deep(.ant-badge-status-text) {
  margin-inline-start: 0;
}

.room-view__readonly-status {
  padding: 4px 10px;
  display: inline-flex;
  align-items: center;
}

.room-view__category {
  flex: 0 1 40%;
  min-width: 0;
}

.room-view__name {
  flex: 1;
  min-width: 0;
  padding-right: 10px;
}
</style>
