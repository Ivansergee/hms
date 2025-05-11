<template>
  <a-form
    ref="formRef"
    :model="formModel"
    :rules="rules"
    :hideRequiredMark="true"
    :colon="false"
  >
    <a-form-item label="Room" name="roomId">
      <a-select
        v-model:value="formModel.roomId"
        :options="roomOptions"
        @select="emitChange"
      />
    </a-form-item>
  </a-form>
</template>
<script setup lang="ts">
import type { BookingFormState } from "@shared/types/booking.ts";
import { onMounted, ref } from "vue";
import type { RuleObject } from "ant-design-vue/es/form";
import type { SelectProps } from "ant-design-vue";
import { useRoomStore } from "@/stores/roomStore.ts";

interface Props {
  state: BookingFormState;
}

interface FormModel {
  roomId?: number;
}

const roomStore = useRoomStore();

const props = defineProps<Props>();
const emit = defineEmits<{
  (event: 'change', bookingState: BookingFormState): void;
}>();

const formRef = ref();

const formModel = ref<FormModel>({
  roomId: props.state.roomId,
})

const roomOptions = ref<SelectProps['options']>();

const emitChange = (): void => {
  emit('change', {
    ...props.state,
    roomId: formModel.value.roomId,
  });
};

const rules: { [key: string]: RuleObject[] } = {
  roomId: [
    {
      required: true,
      message: 'Select a room',
    },
  ],
}

const validate = async (): Promise<boolean> => {
  try {
    await formRef.value?.validate();
    return true;
  } catch (error) {
    return false;
  }
}

defineExpose({ validate });

onMounted(async () => {
  const { start, end } = props.state;
  if (!start || !end) {
    return;

  }
  const availableRooms = await roomStore.getAvailableRooms(start.split(' ')[0], end.split(' ')[0]);
  roomOptions.value = availableRooms.map(room => ({
    value: room.id,
    label: room.name,
  }));
})
</script>
<style scoped>
</style>
