<template>
  <a-modal
    class="create-booking-dialog"
    :open="open"
    :confirm-loading="isLoading"
    :mask-closable="false"
    :title="t('newBooking')"
    :ok-text="t('create')"
    :body-style="{
      'overflow-y': 'auto',
      'overflow-x': 'hidden',
      'min-height': '55vh',
      'max-height': '75vh'
    }"
    width="60vw"
    :destroy-on-close="true"
    @ok="save"
    @cancel="close"
  >
    <a-form
      ref="formRef"
      :model="form"
      :rules="rules"
      :hide-required-mark="true"
      :colon="false"
      layout="vertical"
    >
      <a-divider orientation="left">
        {{ t('datesAndRoom') }}
      </a-divider>
      <a-row
        :gutter="12"
        align="stretch"
      >
        <a-col
          span="12"
          style="display: flex"
        >
          <a-card
            class="w100"
            size="small"
          >
            <a-form-item
              :label="t('range')"
              name="range"
            >
              <a-range-picker
                v-model:value="form.range"
                class="w100"
                :placeholder="[t('startDate'), t('endDate')]"
                :format="['DD.MM.YYYY', 'DD.MM.YYYY']"
                value-format="YYYY-MM-DD"
                @change="onRangeChange"
              />
            </a-form-item>
            <a-row :gutter="12">
              <a-col span="12">
                <a-form-item
                  :label="t('checkInTime')"
                  name="checkInTime"
                >
                  <a-time-picker
                    v-model:value="form.checkInTime"
                    class="w100"
                    format="HH:mm"
                    value-format="HH:mm"
                    :placeholder="t('checkInTime')"
                    :allow-clear="false"
                    :show-now="false"
                  />
                </a-form-item>
              </a-col>
              <a-col span="12">
                <a-form-item
                  :label="t('checkOutTime')"
                  name="checkOutTime"
                >
                  <a-time-picker
                    v-model:value="form.checkOutTime"
                    class="w100"
                    format="HH:mm"
                    value-format="HH:mm"
                    :placeholder="t('checkOutTime')"
                    :allow-clear="false"
                    :show-now="false"
                  />
                </a-form-item>
              </a-col>
            </a-row>
          </a-card>
        </a-col>
        <a-col
          span="12"
          style="display: flex"
        >
          <a-card size="small">
            <RoomSelector
              v-model="form.roomId"
              :available-rooms="availableRooms"
              :is-range-set="!!form.range"
            />
          </a-card>
        </a-col>
      </a-row>

      <a-divider orientation="left">
        {{ t('guests') }}
      </a-divider>
      <div
        v-for="(guest, index) in form.guests"
        :key="guest.uiId"
      >
        <GuestForm
          :guest="guest"
          :is-main-guest="index === 0"
          :index="index + 1"
          :is-remove-button-visible="form.guests.length > 1"
          @remove="removeGuest(index)"
        />
      </div>
      <a-button
        class="w100"
        type="dashed"
        @click="addGuest"
      >
        <PlusOutlined />
        {{ t('addGuest') }}
      </a-button>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue';
import { useBookingStore } from '@/stores/bookingStore';
import type { GuestInput } from '@shared/types/guest';
import { useScopedI18n } from '@/composables/useScopedI18n';
import { useRoomStore } from '@/stores/roomStore';
import type { RuleObject } from 'ant-design-vue/es/form';
import { PlusOutlined } from '@ant-design/icons-vue';
import type { RoomWithCategory } from '@/types/Room.ts';
import type { Dayjs } from 'dayjs';
import { type BookingPlacement } from '@shared/types/booking.ts';
import { timeToMinutes } from '@/utils/dateTimeUtils.ts';

export interface GuestFormState {
  uiId: number;
  id?: number;
  firstName?: string;
  lastName?: string;
  parentName?: string;
  birthdate?: string;
  phone?: string;
  email?: string;
}

interface FormState {
  range?: [string, string];
  checkInTime: string;
  checkOutTime: string;
  roomId?: number;
  guests: GuestFormState[];
}

interface Props {
  open: boolean;
  state?: BookingPlacement;
}

defineOptions({ name: 'CreateBookingDialog' });
const { t } = useScopedI18n();

const props = defineProps<Props>();
const emit = defineEmits<{(event: 'close'): void;
}>();

const bookingStore = useBookingStore();
const roomStore = useRoomStore();

const createInitialFormState = (): FormState => ({
  range: undefined,
  checkInTime: '14:00',
  checkOutTime: '12:00',
  roomId: undefined,
  guests: [{ uiId: Date.now() }],
});

const form = reactive<FormState>(createInitialFormState());

const rules: { [key: string]: RuleObject[] } = {
  range: [{
    required: true,
    message: t('rangeRequiredError'),
    type: 'array',
  }],
  checkInTime: [{
    required: true,
    message: t('checkInTimeRequiredError'),
  }],
  checkOutTime: [{
    required: true,
    message: t('checkOutTimeRequiredError'),
  }],
  roomId: [{
    required: true,
    message: t('roomRequiredError'),
  }],
};

const isLoading = ref<boolean>(false);
const availableRooms = ref<RoomWithCategory[]>([]);

const isFormValid = (form: FormState): boolean => {
  if (form.roomId === undefined || !form.range?.[0] || !form.range?.[1]) {
    return false;
  }
  if (!form.guests) {
    return false;
  }
  return form.guests.every((guest) => {
    if (guest.id) {
      return true;
    }
    return !!guest.firstName && !!guest.lastName;
  });
};

const mapGuestsToInput = (guests: GuestFormState[]): GuestInput[] => guests.map((guest) => {
  if (guest.id) {
    return { id: guest.id };
  }

  return {
    firstName: guest.firstName!,
    lastName: guest.lastName!,
    parentName: guest.parentName,
    birthdate: guest.birthdate,
    phone: guest.phone,
    email: guest.email,
  };
});

const save = async (): Promise<void> => {
  if (!isFormValid(form)) {
    return;
  }
  await bookingStore.createBooking({
    ...form,
    roomId: form.roomId!,
    checkInDate: form.range![0],
    checkOutDate: form.range![1],
    arrivalMinutes: timeToMinutes(form.checkInTime),
    departureMinutes: timeToMinutes(form.checkOutTime),
    guests: mapGuestsToInput(form.guests),
    mainGuestIndex: 0,
  });
  close();
};

const addGuest = (): void => {
  if (!form.guests) {
    return;
  }
  form.guests.push({ uiId: Date.now() });
};

const removeGuest = (index: number): void => {
  if (!form.guests) {
    return;
  }
  form.guests.splice(index, 1);
};

const close = (): void => {
  Object.assign(form, createInitialFormState());
  emit('close');
};

const onRangeChange = (values: [Dayjs, Dayjs] | [string, string] | null): void => {
  if (values && Array.isArray(values)) {
    const [start, end] = values as [string, string];
    setAvailableRooms(start, end);
  } else {
    availableRooms.value = [];
  }
};

const setAvailableRooms = async (checkInDate: string, checkOutDate: string): Promise<void> => {
  availableRooms.value = await roomStore.getAvailableRooms(checkInDate, checkOutDate);
};

watch(() => props.open, async (isOpen: boolean) => {
  if (isOpen && props.state) {
    const { checkInDate, checkOutDate, roomId } = props.state;
    form.range = [checkInDate, checkOutDate];
    await setAvailableRooms(checkInDate, checkOutDate);
    form.roomId = roomId;
  }
});
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

.create-booking-dialog .ant-steps-item-description {
  white-space: nowrap !important;
}
</style>

<style scoped>
.ant-form-item {
  margin-bottom: 12px;
}

.ant-form-item-label > label {
  color: #666;
}

:deep(.ant-card) {
  border-radius: 10px;
}

.create-booking-dialog :deep(.ant-divider) {
  margin: 16px 0 12px;
}
</style>
