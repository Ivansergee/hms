<template>
  <a-modal
    title="Confirm change"
    :open="open"
    :confirm-loading="isLoading"
    :mask-closable="false"
    @ok="onOk"
    @cancel="onCancel"
  >
    <strong>Guest: </strong> <span>{{ booking?.guestId }}</span>
    <div v-for="property in propertiesToShow">
      <ChangeView
        :title="property"
        :old-value="booking?.[property]"
        :new-value="changedBooking?.[property]"
      />
    </div>
  </a-modal>
</template>
<script setup lang="ts">
import type { Booking } from "@/types/Booking.ts";
import { ref } from "vue";
import { BookingProperty } from "@/enums/BookingProperty.ts";
import { useBookingStore } from "@/stores/bookingStore.ts";

interface Props {
  open: boolean;
  booking?: Booking;
  changedBooking?: Booking;
}

const propertiesToShow = Object.values(BookingProperty);

const bookingStore = useBookingStore();

const props = defineProps<Props>();
const emit = defineEmits(['close']);

const isLoading = ref<boolean>(false);

const onOk = () => {
  if (props.changedBooking) {
    isLoading.value = true;
    bookingStore.editBooking(props.changedBooking)
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
