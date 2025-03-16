<template>
  <a-modal
    :title="booking?.id ? 'Edit booking' : 'Create booking'"
    :open="open"
    :confirm-loading="isLoading"
    @ok="handleOk"
    @cancel="handleCancel"
  >
    Guest: {{ booking?.guestId }}
  </a-modal>
</template>

<script setup lang="ts">
import { ref } from "vue";
import type { Booking } from "@/types/Booking.ts";

interface Props {
  open: boolean;
  booking?: Partial<Booking>;
}

const props = defineProps<Props>();
const emit = defineEmits(['close']);

const isLoading = ref<boolean>(false);

const handleOk = () => {
  emit('close');
};
const handleCancel = () => {
  emit('close');
};
</script>

<style scoped>

</style>
