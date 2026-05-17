<template>
  <div class="select-filter-dropdown">
    <a-select
      :value="filterDropdownProps.selectedKeys"
      :options="options"
      :placeholder="placeholderText"
      mode="multiple"
      class="select-filter-dropdown__select mb-8 w100"
      @change="onChange"
    />
    <a-button
      type="primary"
      size="small"
      class="select-filter-dropdown__button"
      @click="onSearch"
    >
      <template #icon>
        <SearchOutlined />
      </template>
      {{ t('search') }}
    </a-button>
    <a-button
      size="small"
      class="select-filter-dropdown__button ml-8"
      @click="onReset"
    >
      {{ t('reset') }}
    </a-button>
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue';
import type { PropType } from 'vue';
import type { Key } from 'ant-design-vue/es/_util/type';
import type { SelectValue } from 'ant-design-vue/es/select';
import type { FilterDropdownProps } from 'ant-design-vue/es/table/interface';
import { SearchOutlined } from '@ant-design/icons-vue';
import { useScopedI18n } from '@/composables/useScopedI18n.js';

type SelectOption = {
  label: string;
  value: Key;
};

defineOptions({ name: 'SelectFilterDropdown' });

const { t } = useScopedI18n();

const props = defineProps({
  filterDropdownProps: {
    type: Object as PropType<FilterDropdownProps<unknown>>,
    required: true,
  },
  options: {
    type: Array as PropType<SelectOption[]>,
    required: true,
  },
  placeholder: {
    type: String,
    default: undefined,
  },
});

const placeholderText = computed(() => props.placeholder ?? t('search'));

const onChange = (value: SelectValue): void => {
  const selectedKeys = Array.isArray(value)
    ? value.filter((item): item is Key => ['string', 'number'].includes(typeof item))
    : [];

  props.filterDropdownProps.setSelectedKeys(selectedKeys);
};

const onSearch = (): void => {
  props.filterDropdownProps.confirm();
};

const onReset = (): void => {
  props.filterDropdownProps.clearFilters?.();
  props.filterDropdownProps.confirm();
};
</script>
<style scoped>
.select-filter-dropdown {
  padding: 8px;
  width: 244px;
}

.select-filter-dropdown__select {
  display: block;
}

.select-filter-dropdown__button {
  width: 90px;
}

</style>
