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
      <GuestTabs
        :guests="form.guests"
        @add="addGuest"
        @remove="removeGuest"
        @update:guest="updateGuest"
        @select:guest="selectExistingGuest"
        @toggle-link="toggleGuestProfile"
      />
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import {
  type PropType, reactive, ref, watch,
} from 'vue';
import { useBookingStore } from '@/stores/bookingStore';
import type { BookingGuestCreate } from '@shared/types/bookingGuest';
import { useScopedI18n } from '@/composables/useScopedI18n';
import { useRoomStore } from '@/stores/roomStore';
import type { RuleObject } from 'ant-design-vue/es/form';
import type { RoomWithCategory } from '@/types/Room.ts';
import { type BookingPlacement } from '@shared/types/booking.ts';
import { timeToMinutes } from '@/utils/dateTimeUtils.ts';
import GuestTabs, { type GuestTabsGuest } from '@/components/GuestTabs.vue';
import type { Guest } from '@shared/types/guest.ts';
import { guestQueries } from '@/queries/guestQueries.ts';
import { toGuestCreatePayload } from '@/utils/guestUtils.ts';
import { isValidGuestData } from '@shared/validation/guest';

export type GuestFormState = GuestTabsGuest;

interface FormState {
  range?: [string, string];
  checkInTime: string;
  checkOutTime: string;
  roomId?: number;
  guests: GuestFormState[];
}

defineOptions({ name: 'CreateBookingDialog' });
const { t } = useScopedI18n();

const props = defineProps({
  open: {
    type: Boolean,
  },
  state: {
    type: Object as PropType<BookingPlacement>,
    required: false,
    default: undefined,
  },
});
const emit = defineEmits<{
  close: [];
}>();

const bookingStore = useBookingStore();
const roomStore = useRoomStore();

let nextGuestUiId = Date.now();

const createGuestFormState = (): GuestFormState => ({
  key: `new-guest-${nextGuestUiId++}`,
});

const createInitialFormState = (): FormState => ({
  range: undefined,
  checkInTime: '14:00',
  checkOutTime: '12:00',
  roomId: undefined,
  guests: [createGuestFormState()],
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
  return form.guests.every(isValidGuestData);
};

const mapGuestsToInput = (guests: GuestFormState[]): BookingGuestCreate[] => guests.map((guest) => ({
  ...toGuestCreatePayload(guest),
  ...(guest.guestId !== undefined && { guestId: guest.guestId }),
}));

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
  const guest = createGuestFormState();
  form.guests.push(guest);
};

const removeGuest = (key: string): void => {
  if (!form.guests) {
    return;
  }
  const index = form.guests.findIndex((guest) => guest.key === key);

  if (index === -1 || form.guests.length === 1) {
    return;
  }

  form.guests.splice(index, 1);

  if (!form.guests.length) {
    addGuest();
  }
};

const updateGuest = (index: number, guest: Partial<GuestFormState>): void => {
  form.guests[index] = { ...form.guests[index], ...guest };
};

const selectExistingGuest = (index: number, guest: Guest): void => {
  if (!form.guests[index]) {
    return;
  }

  form.guests[index] = {
    ...form.guests[index],
    ...guest,
    guestId: guest.id,
    disabled: true,
  };
};

const toggleGuestProfile = async (index: number): Promise<void> => {
  const guest = form.guests[index];

  if (!guest) {
    return;
  }

  if (guest.guestId) {
    form.guests[index] = {
      ...guest,
      guestId: undefined,
      disabled: false,
    };
    return;
  }

  if (!isValidGuestData(guest)) {
    return;
  }

  isLoading.value = true;
  try {
    const createdGuest = await guestQueries.create(toGuestCreatePayload(guest));

    form.guests[index] = {
      ...guest,
      ...createdGuest,
      guestId: createdGuest.id,
      disabled: true,
    };
  } finally {
    isLoading.value = false;
  }
};

const close = (): void => {
  Object.assign(form, createInitialFormState());
  emit('close');
};

const onRangeChange = (values: unknown): void => {
  if (
    Array.isArray(values)
    && typeof values[0] === 'string'
    && typeof values[1] === 'string'
  ) {
    const [start, end] = values;
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
