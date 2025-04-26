<template>
  <a-badge
    class="badge"
    :dot="isUnsaved"
    :offset="[-195, 6]"
  >
    <a-card
      :body-style="{
        width: '200px',
        padding: '5px 10px',
        cursor: 'pointer',
        'box-shadow': '0 4px 12px rgba(0, 0, 0, 0.2)',
      }"
      @click="$emit('restore')"
    >
      <div class="tray-content">
        <a-typography-text
          :content="title"
          ellipsis
        />
        <AButton
          class="control-button"
          size="small"
          type="text"
          title="Close"
          :icon="h(CloseOutlined)"
          @click="$emit('remove')"
        />
      </div>
    </a-card>
  </a-badge>
</template>
<script setup lang="ts">
import type { BookingDetails, PartialBookingDetails } from "@shared/types/booking.ts";
import { computed, h } from "vue";
import { CloseOutlined } from "@ant-design/icons-vue";
import { useTrayStore } from "@/stores/trayStore.ts";
import { useRoomStore } from "@/stores/roomStore.ts";

interface Props {
  data: PartialBookingDetails;
  isUnsaved: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (event: 'remove'): void;
  (event: 'restore'): void;
}>();

const trayStore = useTrayStore();
const roomStore = useRoomStore();

const title = computed<string>(() => {
  const mainGuest = props.data.guests?.find(guest => guest.id === props.data.mainGuestId);
  const mainGuestLastName = mainGuest?.lastName;
  const mainGuestFirstName = mainGuest?.firstName;
  const mainGuestName = `${mainGuestLastName} ${mainGuestFirstName}`;
  const roomName =  props.data.roomId ? roomStore.getById(props.data.roomId)?.name : undefined;

  if (!mainGuestName.trim() && !roomName) {
    return `Uncompleted booking`;
  }
  return `${roomName ?? ''} ${mainGuestName ?? ''}`;
});
</script>
<style scoped>
.tray-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.control-button {
  margin-left: 12px;
  flex-shrink: 0;
}
</style>
