<template>
  <a-modal
    :open="isOpen"
    :title="t('payment')"
    @cancel="onClose"
  >
    <template #footer>
      <a-button
        type="primary"
        :disabled="isConfirmButtonDisabled"
        :title="confirmButtonTitle"
        @click="initPayment"
      >
        {{ t('confirm') }}
      </a-button>
    </template>
    <a-table
      class="scroll-table mb-10"
      :columns="columns"
      :data-source="paymentMethods"
      :pagination="false"
      :row-class-name="getRowClassName"
      :custom-row="customRow"
      size="small"
      bordered
      :scroll="{ y: '155px' }"
    />
    <a-radio-group v-model:value="itemsMode">
      <a-radio :value="ItemsMode.ALL">{{ t('all') }}</a-radio>
      <a-radio
        :value="ItemsMode.SELECTED"
      >
        {{ t('selected') }}
      </a-radio>
    </a-radio-group>
    <a-typography-title
      :level="5"
      :style="{ 'text-align': 'right' }"
    >
      {{t('total')}}: {{total}}
    </a-typography-title>
  </a-modal>
</template>
<script setup lang="ts">
import { useScopedI18n } from "@/composables/useScopedI18n.ts";
import type { ColumnType } from "ant-design-vue/es/table";
import { PaymentMethod } from "@/enums/PaymentMethod.ts";
import { computed, ref, watch } from "vue";
import type { FolioItem } from "@shared/types/folio.ts";
import Decimal from "decimal.js";
import { folioQueries } from "@/queries/folioQueries.ts";

type PaymentMethodRecord = { name: PaymentMethod };

interface Props {
  isOpen: boolean;
  allItems: FolioItem[];
  selectedItems: FolioItem[];
}

enum ItemsMode {
  ALL = 'all',
  SELECTED = 'selected'
}

defineOptions({ name: 'PaymentDialog' });
const { t, translateEnum } = useScopedI18n();

const props = defineProps<Props>();
const emit = defineEmits<{
  (event: 'close'): void;
  (event: 'add'): void;
}>();

const selectedMethod = ref<PaymentMethod>();
const itemsMode = ref<ItemsMode>(ItemsMode.ALL);

const columns: ColumnType[] = [
  {
    title: t('paymentMethod'),
    dataIndex: 'name',
    key: 'name',
    customRender({ text }) {
      return translateEnum(PaymentMethod, text);
    },
  }
];

const paymentMethods: PaymentMethodRecord[] = Object.values(PaymentMethod)
  .map(method => ({ name: method }));

const getRowClassName = (record: PaymentMethodRecord) => {
  return selectedMethod.value === record.name ? 'selected' : undefined;
};

const customRow = (record: PaymentMethodRecord) => {
  return {
    onClick: () => {
      if (selectedMethod.value === record.name) {
        selectedMethod.value = undefined;
      } else {
        selectedMethod.value = record.name;
      }
    }
  };
}

const items = computed<FolioItem[]>(() => {
  return itemsMode.value === ItemsMode.ALL ? props.allItems : props.selectedItems;
});

const total = computed<string>(() => {
  return items.value.reduce<string>((total, item) => {
    total = new Decimal(total).add(item.totalPrice).toFixed(2);
    return total;
  }, '0.00');
});

const isConfirmButtonDisabled = computed<boolean>(() => {
  return !selectedMethod.value || total.value === '0.00';
});

const confirmButtonTitle = computed<string | undefined>(() => {
  if (!selectedMethod.value) {
    return t('chooseMethod');
  }
  if (total.value === '0.00') {
    return t('noUnpaidItemsSelected');
  }
});

const onClose = () => {
  selectedMethod.value = undefined;
  emit('close');
};

const initPayment = async () => {
  if (!selectedMethod.value) {
    return;
  }
  await folioQueries.addPayment({
    method: selectedMethod.value,
    amount: total.value,
    folioItemIds: items.value.map(item => item.id),
  });
  emit('add');
};

watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      itemsMode.value = props.selectedItems.length
        ? ItemsMode.SELECTED
        : ItemsMode.ALL;
    }
  }
);
</script>
<style scoped>

</style>
