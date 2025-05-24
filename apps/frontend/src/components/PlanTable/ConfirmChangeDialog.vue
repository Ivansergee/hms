<template>
  <a-modal
    :title="t('confirmChange')"
    :open="open"
    :confirm-loading="isLoading"
    :mask-closable="false"
    :ok-text="t('save')"
    @ok="onOk"
    @cancel="onCancel"
  >
    <strong>{{ t('guest') }}: </strong>
    <span>{{ mainGuestName }}</span>
    <div v-for="property in propertiesToShow">
      <ChangeView
        :title="translateEnum(BookingPropertyForChange, property)"
        :old-value="getFormattedValue(booking, property)"
        :new-value="getFormattedValue(changedBooking, property)"
      />
    </div>
  </a-modal>
</template>
<script setup lang="ts">
import { computed, ref } from "vue";
import { BookingPropertyForChange } from "@/enums/BookingPropertyForChange.ts";
import { useBookingStore } from "@/stores/bookingStore.ts";
import type { BookingShort } from "@shared/types/booking.ts";
import { useScopedI18n } from "@/composables/useScopedI18n.ts";
import { useRoomStore } from "@/stores/roomStore.ts";
import { getFormattedDate } from "@/utils/dateTimeUtils.ts";

interface Props {
  open: boolean;
  booking: BookingShort;
  changedBooking: BookingShort;
}

defineOptions({ name: 'ConfirmChangeDialog' });
const { t, translateEnum } = useScopedI18n();

const propertiesToShow = Object.values(BookingPropertyForChange);

const bookingStore = useBookingStore();
const roomStore = useRoomStore();

const props = defineProps<Props>();
const emit = defineEmits(['close']);

const isLoading = ref<boolean>(false);

const mainGuestName = computed<string>(() => {
  const mainGuest = props.booking.guests.find(guest => guest.id === props.booking.mainGuestId);
  return mainGuest ? `${mainGuest.firstName} ${mainGuest.lastName}` : '';
});

const getFormattedValue = (booking: BookingShort, property: BookingPropertyForChange) => {
  switch (property) {
    case BookingPropertyForChange.START:
      return getFormattedDate(booking.start);
    case BookingPropertyForChange.END:
      return getFormattedDate(booking.end);
    case BookingPropertyForChange.ROOM:
      return roomStore.getById(booking.roomId)?.name;
  }
};

const onOk = () => {
  if (props.changedBooking) {
    isLoading.value = true;
    bookingStore.editPlacement(props.changedBooking)
      .then(() => {
        emit('close');
      })
      .finally(() => {
        isLoading.value = false;
      });
  }
};

const onCancel = () => {
  emit('close');
};
</script>
<style scoped>

</style>
