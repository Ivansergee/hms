<template>
  <div class="guest-form">
    <div class="guest-form__header">
      <div>
        <strong>{{ t('guest') }} {{ index }}</strong>
        <a-tag
          v-if="isMainGuest"
          class="guest-form__main-guest"
          :bordered="false"
          color="processing"
        >
          {{ t('mainGuest') }}
        </a-tag>
      </div>
      <MinusCircleOutlined
        v-if="isRemoveButtonVisible"
        class="guest-form__remove-button"
        :title="t('removeGuest')"
        @click="$emit('remove')"
      />
    </div>
    <a-row :gutter="12">
      <a-col :span="12">
        <a-form-item
          :label="t('lastName')"
          :rules="{ required: true, message: t('errorRequiredField') }"
        >
          <div class="guest-form__last-name-control">
            <GuestSearchInput
              :value="guest.lastName"
              :disabled="disabled"
              @update:value="updateGuest('lastName', $event)"
              @select="selectGuest"
            />
            <a-button
              :disabled="isProfileButtonDisabled"
              :title="isGuestLinked ? t('unlinkProfile') : t('saveAsProfile')"
              @click="$emit('toggle-link')"
            >
              <template #icon>
                <DisconnectOutlined v-if="isGuestLinked" />
                <SaveOutlined v-else />
              </template>
            </a-button>
          </div>
        </a-form-item>
      </a-col>
      <a-col :span="12">
        <a-form-item
          :label="t('firstName')"
          :rules="{ required: true, message: t('errorRequiredField') }"
        >
          <a-input
            :value="guest.firstName"
            autocomplete="none"
            :disabled="disabled"
            @update:value="updateGuest('firstName', $event)"
          />
        </a-form-item>
      </a-col>
    </a-row>

    <a-row :gutter="12">
      <a-col :span="12">
        <a-form-item
          :label="t('parentName')"
        >
          <a-input
            :value="guest.parentName"
            autocomplete="none"
            :disabled="disabled"
            @update:value="updateGuest('parentName', $event)"
          />
        </a-form-item>
      </a-col>
      <a-col :span="12">
        <a-form-item
          :label="t('birthdate')"
        >
          <DateInput
            :model-value="guest.birthdate"
            :disabled="disabled"
            @update:model-value="updateGuest('birthdate', $event)"
          />
        </a-form-item>
      </a-col>
    </a-row>

    <a-row :gutter="12">
      <a-col :span="12">
        <a-form-item
          :label="t('phone')"
        >
          <a-input
            :value="guest.phone"
            autocomplete="none"
            :disabled="disabled"
            @update:value="updateGuest('phone', $event)"
          />
        </a-form-item>
      </a-col>
      <a-col :span="12">
        <a-form-item
          :label="t('email')"
          :rules="{
            pattern: new RegExp(GUEST_EMAIL_PATTERN),
            message: t('errorNotValidEmail'),
            trigger: 'blur',
          }"
        >
          <a-input
            :value="guest.email"
            autocomplete="none"
            :disabled="disabled"
            @update:value="updateGuest('email', $event)"
          />
        </a-form-item>
      </a-col>
    </a-row>

    <a-row :gutter="12">
      <a-col :span="12">
        <a-form-item :label="t('gender')">
          <div class="guest-form__gender-control">
            <a-checkbox
              :checked="guest.gender === Gender.MALE"
              :disabled="disabled"
              @change="updateGender(Gender.MALE)"
            >
              {{ t('male') }}
            </a-checkbox>
            <a-checkbox
              :checked="guest.gender === Gender.FEMALE"
              :disabled="disabled"
              @change="updateGender(Gender.FEMALE)"
            >
              {{ t('female') }}
            </a-checkbox>
          </div>
        </a-form-item>
      </a-col>
      <a-col :span="12">
        <a-form-item :label="t('citizenship')">
          <a-select
            :value="guest.citizenship"
            :options="countryOptions"
            :disabled="disabled"
            :placeholder="t('selectCountry')"
            show-search
            allow-clear
            option-filter-prop="label"
            @update:value="updateCitizenship"
          />
        </a-form-item>
      </a-col>
    </a-row>
    <div
      v-if="isSaveButtonVisible"
      class="guest-form__actions"
    >
      <a-button
        type="primary"
        :disabled="isSaveButtonDisabled"
        @click="$emit('save')"
      >
        {{ t('save') }}
      </a-button>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed, type PropType } from 'vue';
import { useI18n } from 'vue-i18n';
import {
  DisconnectOutlined,
  MinusCircleOutlined,
  SaveOutlined,
} from '@ant-design/icons-vue';
import { useScopedI18n } from '@/composables/useScopedI18n.ts';
import type { Guest } from '@shared/types/guest.ts';
import GuestSearchInput from '@/components/GuestSearchInput.vue';
import { Gender } from '@shared/enums/Gender';
import { COUNTRY_CODES } from '@shared/constants/countryCodes';
import type { SelectValue } from 'ant-design-vue/es/select';
import {
  GUEST_EMAIL_PATTERN,
  isCountryCode,
  isValidGuestData,
} from '@shared/validation/guest';
import type { GuestDraft } from '@/utils/guestUtils';

type GuestFormGuest = GuestDraft & {
  guestId?: number;
};

type GuestField = keyof Pick<
  GuestDraft,
  'firstName' | 'lastName' | 'parentName' | 'gender' | 'birthdate' | 'phone' | 'email' | 'citizenship'
>;

const props = defineProps({
  guest: {
    type: Object as PropType<GuestFormGuest>,
    required: true,
  },
  index: {
    type: Number,
    required: true,
  },
  isMainGuest: {
    type: Boolean,
  },
  isRemoveButtonVisible: {
    type: Boolean,
  },
  disabled: {
    type: Boolean,
  },
  isSaveButtonVisible: {
    type: Boolean,
  },
});
const emit = defineEmits<{
  remove: [];
  'update:guest': [guest: GuestDraft];
  select: [guest: Guest];
  'toggle-link': [];
  save: [];
}>();

defineOptions({ name: 'GuestForm' });
const { t } = useScopedI18n();
const { locale } = useI18n();

const countryOptions = computed(() => {
  const displayNames = new Intl.DisplayNames([locale.value], { type: 'region' });

  const options = COUNTRY_CODES
    .map((code) => ({
      value: code,
      label: displayNames.of(code) || code,
    }))
    .sort((a, b) => a.label.localeCompare(b.label, locale.value));

  const russia = options.find((option) => option.value === 'RU')!;
  return [russia, ...options.filter((option) => option.value !== 'RU')];
});

const isGuestLinked = computed(() => !!props.guest.guestId);
const isGuestValid = computed(() => isValidGuestData(props.guest));
const isProfileButtonDisabled = computed(() => !isGuestLinked.value && !isGuestValid.value);
const isSaveButtonDisabled = computed(() => (
  props.disabled || !isGuestValid.value
));

const updateGuest = (field: GuestField, value: string | undefined): void => {
  if (props.disabled) {
    return;
  }

  emit('update:guest', {
    ...props.guest,
    [field]: value,
  });
};

const selectGuest = (guest: Guest): void => {
  if (props.disabled) {
    return;
  }

  emit('select', guest);
};

const updateCitizenship = (value: SelectValue): void => {
  updateGuest('citizenship', typeof value === 'string' && isCountryCode(value) ? value : undefined);
};

const updateGender = (gender: Gender): void => {
  updateGuest('gender', props.guest.gender === gender ? undefined : gender);
};
</script>
<style scoped>
.guest-form {
  border-radius: 10px;
  padding: 14px 16px;
  margin-bottom: 12px;
  background: #fff;
  border: 1px solid #f0f0f0;
}

.guest-form__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.guest-form__header strong {
  font-size: 14px;
}

.guest-form__main-guest {
  margin-left: 8px;
  font-size: 11px;
}

.guest-form__remove-button {
  color: #ff4d4f;
  font-size: 16px;
}

.guest-form__last-name-control {
  display: flex;
  gap: 8px;
}

.guest-form__last-name-control :deep(.guest-search-input) {
  flex: 1;
}

.guest-form__actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
}

.guest-form__gender-control {
  display: flex;
  align-items: center;
  gap: 16px;
  min-height: 32px;
}

.ant-form-item {
  margin-bottom: 12px;
}

.ant-form-item-label > label {
  color: #666;
}
</style>
