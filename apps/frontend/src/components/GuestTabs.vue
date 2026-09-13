<template>
  <a-tabs
    v-model:active-key="activeGuestKey"
    class="guest-tabs"
    type="editable-card"
    size="small"
    @edit="onGuestTabEdit"
  >
    <a-tab-pane
      v-for="(guest, index) in guests"
      :key="getGuestKey(guest)"
      :closable="guests.length > 1"
    >
      <template #tab>
        <a-typography-text
          class="guest-tabs__title"
          :content="getGuestTabTitle(guest)"
          :ellipsis="{ tooltip: getGuestTabTitle(guest) }"
        />
      </template>
      <GuestForm
        :guest="guest"
        :index="index + 1"
        :is-main-guest="isMainGuest(guest, index)"
        :disabled="isGuestDisabled(guest)"
        :is-save-button-visible="isSaveButtonVisible"
        @update:guest="updateGuest(index, $event)"
        @select="selectGuest(index, $event)"
        @toggle-link="toggleGuestLink(index, guest)"
        @save="saveGuest(index, guest)"
      />
    </a-tab-pane>
  </a-tabs>
</template>

<script setup lang="ts">
import { nextTick, ref, type PropType, watch } from 'vue';
import type { Guest } from '@shared/types/guest';
import { BookingGuestRole } from '@shared/enums/BookingGuestRole';
import GuestForm from '@/components/GuestForm.vue';
import { useScopedI18n } from '@/composables/useScopedI18n';
import type { GuestDraft } from '@/utils/guestUtils';

export type GuestTabsGuest = GuestDraft & {
  key: string;
  role?: BookingGuestRole;
  disabled?: boolean;
  guestId?: number;
};

defineOptions({ name: 'GuestTabs' });
const { t } = useScopedI18n();

const props = defineProps({
  guests: {
    type: Array as PropType<GuestTabsGuest[]>,
    required: true,
  },
  mainGuestKey: {
    type: String,
    required: false,
    default: undefined,
  },
  isSaveButtonVisible: {
    type: Boolean,
  },
});

const emit = defineEmits<{
  add: [];
  remove: [key: string];
  'update:guest': [index: number, guest: GuestDraft];
  'select:guest': [index: number, guest: Guest];
  'toggle-link': [index: number, guest: GuestTabsGuest];
  save: [index: number, guest: GuestTabsGuest];
}>();

const activeGuestKey = ref<string>();

const getGuestKey = (guest: GuestTabsGuest): string => guest.key;

const getGuestTabTitle = (guest: GuestTabsGuest): string => {
  const name = [guest.firstName, guest.lastName]
    .map((value) => value?.trim())
    .filter(Boolean)
    .join(' ');

  return name || t('newGuest');
};

const isMainGuest = (guest: GuestTabsGuest, index: number): boolean => {
  if (props.mainGuestKey) {
    return guest.key === props.mainGuestKey;
  }

  return guest.role === BookingGuestRole.MAIN || index === 0;
};

const isGuestDisabled = (guest: GuestTabsGuest): boolean => !!guest.disabled;

const updateGuest = (index: number, guest: GuestDraft): void => {
  emit('update:guest', index, guest);
};

const selectGuest = (index: number, guest: Guest): void => {
  emit('select:guest', index, guest);
};

const toggleGuestLink = (index: number, guest: GuestTabsGuest): void => {
  emit('toggle-link', index, guest);
};

const saveGuest = (index: number, guest: GuestTabsGuest): void => {
  emit('save', index, guest);
};

const onGuestTabEdit = (targetKey: string | number | MouseEvent | KeyboardEvent, action: 'add' | 'remove'): void => {
  if (action === 'add') {
    emit('add');
    nextTick(() => {
      const lastGuest = props.guests[props.guests.length - 1];
      if (lastGuest) {
        activeGuestKey.value = lastGuest.key;
      }
    });
    return;
  }

  emit('remove', String(targetKey));
};

watch(
  () => props.guests.map(getGuestKey),
  (keys) => {
    if (!keys.length) {
      activeGuestKey.value = undefined;
      return;
    }

    if (!activeGuestKey.value || !keys.includes(activeGuestKey.value)) {
      activeGuestKey.value = keys[0];
    }
  },
  { immediate: true },
);
</script>

<style scoped>
.guest-tabs__title {
  display: inline-block;
  max-width: 160px;
  vertical-align: bottom;
}
</style>
