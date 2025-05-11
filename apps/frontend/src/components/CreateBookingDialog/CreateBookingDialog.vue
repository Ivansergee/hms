<template>
  <a-modal
    class="create-booking-dialog"
    :open="open"
    :confirm-loading="isLoading"
    :closable="false"
    :mask-closable="false"
    :title="'CreateBooking'"
    :body-style="{
      'overflow-y': 'auto',
      'min-height': '55vh',
      'max-height': '78vh'
    }"
    width="60vw"
    :destroy-on-close="true"
    @cancel="onCancel"
  >
    <template #footer>
      <div class="navigation-buttons">
        <div>
          <a-button
            v-if="currentStep > 0"
            type="primary"
            @click="goBack"
          >
            <LeftOutlined />
            Back
          </a-button>
        </div>
        <div>
          <a-button
            v-if="currentStep !== 2"
            type="primary"
            @click="goNext"
          >
              Next <RightOutlined />
          </a-button>
          <a-button
            v-else
            type="primary"
            @click="onCreate"
          >
            Create
          </a-button>
        </div>
      </div>
    </template>
    <a-button-group class="control-buttons">
      <a-button
        type="text"
        title="Minimize"
        :icon="h(DownOutlined)"
        @click="onMinimize"
      />
      <a-button
        type="text"
        title="Close"
        :icon="h(CloseOutlined)"
        @click="onCancel"
      />
    </a-button-group>
    <a-steps
      :current="currentStep"
      type="navigation"
      size="small"
      :style="stepStyle"
    >
      <a-step
        :title="'Dates'"
      />
      <a-step
        :title="'Room'"
      />
      <a-step
        :title="'Guests'"
      />
    </a-steps>

    <component
      :is="stepComponents[currentStep]"
      ref="stepRef"
      :state="innerData"
      @change="onChange"
    />
  </a-modal>
</template>

<script setup lang="ts">
import { computed, h, ref, watch } from "vue";
import type { BookingFormState } from "@shared/types/booking.ts";
import { useTrayStore } from "@/stores/trayStore.ts";
import {
  CloseOutlined,
  DownOutlined,
  RightOutlined,
  LeftOutlined,
} from "@ant-design/icons-vue";
import { useBookingStore } from "@/stores/bookingStore.ts";
import DateStep from "@/components/CreateBookingDialog/steps/DateStep.vue";
import RoomStep from "@/components/CreateBookingDialog/steps/RoomStep.vue";
import GuestsStep from "@/components/CreateBookingDialog/steps/GuestsStep.vue";
import type { GuestCreate } from "@shared/types/guest.ts";


interface Props {
  open: boolean;
  state?: BookingFormState;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (event: 'close'): void;
  (event: 'minimize', state: BookingFormState): void;
}>();

const trayStore = useTrayStore();
const bookingStore = useBookingStore();

const stepComponents = [
  DateStep,
  RoomStep,
  GuestsStep,
]

const innerData = ref<BookingFormState>(props.state ?? { id: Date.now(), guests: [], currentStep: 0});
const currentStep = ref<number>(props.state?.currentStep ?? 0);
const isLoading = ref<boolean>(false);
const stepRef = ref();

const goNext = async () => {
  const isValid = await stepRef.value?.validate?.();
  if (isValid) {
    currentStep.value = currentStep.value + 1;
  }
};

const goBack = () => {
  currentStep.value = currentStep.value - 1;
};

const isUnsaved = computed<boolean>(() => {
  return JSON.stringify(props.state) !== JSON.stringify(innerData.value);
});

const reset = (): void => {
  innerData.value = { id: Date.now(), guests: []};
  currentStep.value = 0;
};

const onCreate = async (): Promise<void> => {
  const data = innerData.value;
  if (data.roomId === undefined || !data.start || !data.end || !isGuestsValid(data.guests)) {
    return;
  }
  await bookingStore.createBooking({
    ...data,
    roomId: data.roomId,
    start: data.start,
    end: data.end,
    guests: data.guests,
  });
  emit('close');
};

const isGuestsValid = (guests: Array<Partial<GuestCreate>>): guests is GuestCreate[] => {
  return guests.every(guest => !!guest.firstName && !!guest.lastName);
}

const onCancel = (): void => {
  reset();
  emit('close');
};

const onMinimize = (): void => {
  emit('minimize', innerData.value);
  reset();
};

const onChange = (data: BookingFormState): void => {
  innerData.value = { ...data, currentStep: currentStep.value };
};
const stepStyle = {
  marginBottom: '20px',
  boxShadow: '0px -1px 0 0 #e8e8e8 inset',
};

watch(() => props.open, (isOpen: boolean) => {
  if (isOpen) {
    innerData.value = props.state ?? { id: Date.now(), guests: []};
    currentStep.value = props.state?.currentStep ?? 0;
  }
})
</script>

<style>
.create-booking-dialog {
  top: 50px;
}

.create-booking-dialog .ant-modal-body {
  padding: 5px 10px 10px !important;
}

.create-booking-dialog .ant-modal-close {
  top: 15px;
}

.create-booking-dialog .ant-tabs .ant-tabs-tab .anticon {
  margin-right: 0;
}
</style>

<style scoped>
.control-buttons {
  position: absolute;
  top: 9px;
  right: 12px;
}

.navigation-buttons {
  display: flex;
  justify-content: space-between;
}
</style>
