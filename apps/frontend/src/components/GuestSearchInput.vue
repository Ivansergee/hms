<template>
  <a-auto-complete
    class="guest-search-input"
    :value="value"
    :options="options"
    :filter-option="false"
    :placeholder="placeholder"
    :disabled="disabled"
    @search="searchGuests"
    @select="selectGuest"
    @update:value="updateValue"
  >
    <template #option="{ guest }">
      <div class="guest-search-input__option">
        <div class="guest-search-input__name">
          {{ guest.firstName }} {{ guest.lastName }}
        </div>
        <div class="guest-search-input__meta">
          <span v-if="guest.phone">{{ guest.phone }}</span>
          <span v-if="guest.phone && guest.email"> · </span>
          <span v-if="guest.email">{{ guest.email }}</span>
        </div>
      </div>
    </template>
  </a-auto-complete>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import type { Guest } from '@shared/types/guest';
import { guestQueries } from '@/queries/guestQueries';
import type { SelectValue } from 'ant-design-vue/es/select';

type GuestOption = {
  value: string;
  label: string;
  guest: Guest;
};

defineOptions({ name: 'GuestSearchInput' });

const props = defineProps({
  value: {
    type: String,
    default: undefined,
  },
  placeholder: {
    type: String,
    default: undefined,
  },
  disabled: {
    type: Boolean,
  },
});

const emit = defineEmits<{
  'update:value': [value: string | undefined];
  select: [guest: Guest];
}>();

const guests = ref<Guest[]>([]);
let searchRequestId = 0;

const options = computed<GuestOption[]>(() => guests.value.map((guest) => ({
  value: String(guest.id),
  label: `${guest.firstName} ${guest.lastName}`,
  guest,
})));

const updateValue = (value: SelectValue): void => {
  if (typeof value !== 'string') {
    emit('update:value', undefined);
    return;
  }

  const selectedGuest = guests.value.find((guest) => String(guest.id) === value);
  emit('update:value', selectedGuest?.lastName || value || undefined);
};

const searchGuests = async (query: string): Promise<void> => {
  if (props.disabled) {
    return;
  }

  emit('update:value', query || undefined);

  if (query.trim().length < 2) {
    guests.value = [];
    return;
  }

  const requestId = ++searchRequestId;
  const result = await guestQueries.search(query);

  if (requestId === searchRequestId) {
    guests.value = result;
  }
};

const selectGuest = (value: SelectValue): void => {
  const guestId = typeof value === 'string' || typeof value === 'number'
    ? Number(value)
    : undefined;
  const guest = guests.value.find((item) => item.id === guestId);

  if (!guest) {
    return;
  }

  emit('select', guest);
  guests.value = [];
};
</script>

<style scoped>
.guest-search-input {
  width: 100%;
}

.guest-search-input__name {
  font-weight: 500;
}

.guest-search-input__meta {
  color: #8c8c8c;
  font-size: 12px;
  line-height: 1.3;
}
</style>
