<template>
  <div class="text-filter-dropdown">
    <a-input
      ref="inputRef"
      :placeholder="placeholderText"
      :value="filterDropdownProps.selectedKeys[0]"
      class="text-filter-dropdown__input mb-8 w100"
      @change="onChange"
      @press-enter="onSearch"
    />
    <a-button
      type="primary"
      size="small"
      class="text-filter-dropdown__button"
      @click="onSearch"
    >
      <template #icon>
        <SearchOutlined />
      </template>
      {{ t('search') }}
    </a-button>
    <a-button
      size="small"
      class="text-filter-dropdown__button ml-8"
      @click="onReset"
    >
      {{ t('reset') }}
    </a-button>
  </div>
</template>
<script setup lang="ts">
import {
  computed, ref, watch,
} from 'vue';
import type { PropType } from 'vue';
import type { FilterDropdownProps } from 'ant-design-vue/es/table/interface';
import { SearchOutlined } from '@ant-design/icons-vue';
import { useScopedI18n } from '@/composables/useScopedI18n.js';

defineOptions({ name: 'TextFilterDropdown' });

const inputRef = ref();
const { t } = useScopedI18n();

const props = defineProps({
  filterDropdownProps: {
    type: Object as PropType<FilterDropdownProps<unknown>>,
    required: true,
  },
  placeholder: {
    type: String,
    default: undefined,
  },
});

const placeholderText = computed(() => props.placeholder ?? t('search'));

const onChange = (event: Event): void => {
  const value = (event.target as HTMLInputElement).value;
  props.filterDropdownProps.setSelectedKeys(value ? [value] : []);
};

const onSearch = (): void => {
  props.filterDropdownProps.confirm();
};

const onReset = (): void => {
  props.filterDropdownProps.clearFilters?.();
  props.filterDropdownProps.confirm();
};

const focus = (): void => {
  inputRef.value?.focus();
};

watch(
  () => props.filterDropdownProps.visible,
  (visible) => {
    if (visible) {
      setTimeout(() => {
        focus();
      }, 100);
    }
  },
  { immediate: true },
);
</script>
<style scoped>
.text-filter-dropdown {
  padding: 8px;
  width: 204px;
}

.text-filter-dropdown__input {
  display: block;
}

.text-filter-dropdown__button {
  width: 90px;
}

</style>
