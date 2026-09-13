<template>
  <a-spin :spinning="isLoading">
    <a-form
      :hide-required-mark="true"
      :colon="false"
      layout="vertical"
    >
      <GuestTabs
        :guests="guestTabs"
        :is-save-button-visible="true"
        @add="addGuest"
        @remove="removeGuest"
        @update:guest="updateGuestTab"
        @select:guest="selectExistingGuest"
        @toggle-link="toggleGuestProfile"
        @save="saveGuest"
      />
    </a-form>
  </a-spin>
</template>

<script setup lang="ts">
import {
  ref, type PropType, watch,
} from 'vue';
import type { Guest } from '@shared/types/guest';
import type {
  BookingGuest,
  BookingGuestSnapshotUpdate,
} from '@shared/types/bookingGuest';
import { BookingGuestRole } from '@shared/enums/BookingGuestRole';
import { bookingQueries } from '@/queries/bookingQueries';
import GuestTabs, { type GuestTabsGuest } from '@/components/GuestTabs.vue';
import { toGuestCreatePayload, type GuestDraft } from '@/utils/guestUtils';
import { isValidGuestData } from '@shared/validation/guest';

type GuestTabState = GuestTabsGuest & {
  bookingGuestId?: number;
  guestId?: number;
  isNew?: boolean;
  isDirty?: boolean;
};

defineOptions({ name: 'GuestsTab' });

const props = defineProps({
  bookingId: {
    type: Number,
    required: true,
  },
  guests: {
    type: Array as PropType<BookingGuest[]>,
    required: true,
  },
});

const emit = defineEmits<{
  change: [];
}>();

const isLoading = ref<boolean>(false);
const guestTabs = ref<GuestTabState[]>([]);
let nextGuestUiId = Date.now();

const createGuestTabKey = (id: number): string => `booking-guest-${id}`;

const createNewGuestTab = (): GuestTabState => ({
  key: `new-guest-${nextGuestUiId++}`,
  role: BookingGuestRole.ACCOMPANYING,
  isNew: true,
});

const mapBookingGuest = (guest: BookingGuest): GuestTabState => ({
  ...guest,
  key: createGuestTabKey(guest.id),
  bookingGuestId: guest.id,
  disabled: !!guest.guestId,
  isNew: false,
  isDirty: false,
});

const syncGuestTabs = (): void => {
  const currentGuests = new Map(
    guestTabs.value
      .filter((guest) => guest.bookingGuestId)
      .map((guest) => [guest.bookingGuestId!, guest]),
  );
  const drafts = guestTabs.value.filter((guest) => guest.isNew);

  guestTabs.value = props.guests.map((guest) => {
    const currentGuest = currentGuests.get(guest.id);
    return currentGuest?.isDirty ? currentGuest : mapBookingGuest(guest);
  });
  guestTabs.value.push(...drafts);

  if (!guestTabs.value.length) {
    guestTabs.value = [createNewGuestTab()];
  }

};

const updateGuestTab = (index: number, guest: GuestDraft): void => {
  if (!guestTabs.value[index]) {
    return;
  }

  guestTabs.value[index] = {
    ...guestTabs.value[index],
    ...guest,
    isDirty: true,
  };
};

const selectExistingGuest = async (index: number, guest: Guest): Promise<void> => {
  if (!guestTabs.value[index]) {
    return;
  }

  const bookingGuest = guestTabs.value[index];
  isLoading.value = true;
  try {
    if (bookingGuest.isNew || !bookingGuest.bookingGuestId) {
      const createdGuest = await bookingQueries.createBookingGuestSnapshot(
        props.bookingId,
        toGuestCreatePayload(guest),
      );
      Object.assign(bookingGuest, mapBookingGuest(createdGuest));
    }

    const linkedGuest = await bookingQueries.linkBookingGuest(
      props.bookingId,
      bookingGuest.bookingGuestId!,
      { guestId: guest.id },
    );
    Object.assign(bookingGuest, mapBookingGuest(linkedGuest));
    emit('change');
  } finally {
    isLoading.value = false;
  }
};

const toggleGuestProfile = async (_index: number, guest: GuestTabsGuest): Promise<void> => {
  const targetGuest = guest as GuestTabState;

  if (!targetGuest.guestId && !isValidGuestData(targetGuest)) {
    return;
  }

  isLoading.value = true;
  try {
    if (targetGuest.guestId) {
      if (!targetGuest.bookingGuestId) {
        return;
      }

      const unlinkedGuest = await bookingQueries.unlinkBookingGuest(
        props.bookingId,
        targetGuest.bookingGuestId,
      );
      Object.assign(targetGuest, mapBookingGuest(unlinkedGuest));
      emit('change');
      return;
    }

    const data = buildGuestData(targetGuest);
    if (!targetGuest.bookingGuestId) {
      const createdBookingGuest = await bookingQueries.createBookingGuestSnapshot(
        props.bookingId,
        toGuestCreatePayload(targetGuest),
      );
      Object.assign(targetGuest, mapBookingGuest(createdBookingGuest));
    } else {
      const savedGuest = await bookingQueries.updateBookingGuestSnapshot(
        props.bookingId,
        targetGuest.bookingGuestId,
        data,
      );
      Object.assign(targetGuest, mapBookingGuest(savedGuest));
    }

    const linkedGuest = await bookingQueries.createGuestFromBookingGuest(
      props.bookingId,
      targetGuest.bookingGuestId!,
    );
    Object.assign(targetGuest, mapBookingGuest(linkedGuest));
    emit('change');
  } finally {
    isLoading.value = false;
  }
};

const addGuest = (): void => {
  const guest = createNewGuestTab();
  guestTabs.value.push(guest);
};

const removeGuest = async (key: string): Promise<void> => {
  const index = guestTabs.value.findIndex((guest) => guest.key === key);
  if (index === -1 || guestTabs.value.length === 1) {
    return;
  }

  const guest = guestTabs.value[index];

  if (guest.isNew || !guest.bookingGuestId) {
    guestTabs.value.splice(index, 1);
    return;
  }

  isLoading.value = true;
  try {
    await bookingQueries.deleteBookingGuestSnapshot(props.bookingId, guest.bookingGuestId);
    guestTabs.value.splice(index, 1);
    emit('change');
  } finally {
    isLoading.value = false;
  }
};

const emptyToNull = (value?: string): string | null => value?.trim() || null;

const buildGuestData = (guest: GuestTabState): BookingGuestSnapshotUpdate => ({
  firstName: guest.firstName,
  lastName: guest.lastName,
  parentName: emptyToNull(guest.parentName),
  gender: guest.gender ?? null,
  birthdate: guest.birthdate ?? null,
  phone: emptyToNull(guest.phone),
  email: emptyToNull(guest.email),
  citizenship: guest.citizenship ?? null,
});

const saveGuest = async (_index: number, guest: GuestTabsGuest): Promise<void> => {
  const targetGuest = guest as GuestTabState;

  if (!isValidGuestData(targetGuest)) {
    return;
  }

  const data = buildGuestData(targetGuest);
  isLoading.value = true;
  try {
    if (targetGuest.isNew || !targetGuest.bookingGuestId) {
      const createdGuest = await bookingQueries.createBookingGuestSnapshot(
        props.bookingId,
        toGuestCreatePayload(targetGuest),
      );
      Object.assign(targetGuest, mapBookingGuest(createdGuest));
    } else {
      const updatedGuest = await bookingQueries.updateBookingGuestSnapshot(
        props.bookingId,
        targetGuest.bookingGuestId,
        data,
      );
      Object.assign(targetGuest, mapBookingGuest(updatedGuest));
    }
    emit('change');
  } finally {
    isLoading.value = false;
  }
};

watch(() => props.guests, syncGuestTabs, { immediate: true });
</script>
