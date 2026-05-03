<template>
  <a-tabs
    v-model:active-key="activeKey"
    type="card"
  >
    <template #rightExtra>
      <a-button
        class="payment-button"
        type="primary"
        @click="isPaymentDialogOpen = true"
      >
        {{ t('payment') }}
      </a-button>
    </template>
    <a-tab-pane
      :key="BillingTabTableType.SERVICE"
      :tab="translateEnum(BillingTabTableType, BillingTabTableType.SERVICE)"
    >
      <ServicesTable
        :folio-id="activeFolio.id"
        :items="serviceItems"
        @change="reloadFolio"
      />
    </a-tab-pane>
    <a-tab-pane
      :key="BillingTabTableType.PAYMENT"
      :tab="translateEnum(BillingTabTableType, BillingTabTableType.PAYMENT)"
    >
      <TransactionsTable
        :folio-id="activeFolio.id"
        :items="transactionItems"
        @change="reloadFolio"
      />
    </a-tab-pane>
    <a-tab-pane
      :key="BillingTabTableType.FOLIO"
      :tab="translateEnum(BillingTabTableType, BillingTabTableType.FOLIO)"
    >
      <a-button-group class="mb-5">
        <a-button
          type="primary"
          :icon="h(PlusOutlined)"
          :title="t('addService')"
          @click="isServiceDialogOpen = true"
        />
        <a-button
          type="primary"
          :icon="h(DeleteOutlined)"
          :title="t('delete')"
          :disabled="!selectedItems.length"
          danger
          @click="onDeleteItems"
        />
      </a-button-group>
      <a-table
        class="folio-items scroll-table"
        :columns="columns"
        :data-source="folioItems"
        :pagination="false"
        :row-class-name="getRowClassName"
        :custom-row="customRow"
        size="small"
        bordered
        :scroll="{ y: '390px' }"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'name'">
            <CheckCircleFilled
              v-if="isServiceRecord(record as FolioTableRecord) && isItemPaid(record as FolioServiceRecord)"
              :style="{ color: '#52c41a' }"
            />
            {{ getRecordName(record as FolioTableRecord) }}
          </template>
        </template>
      </a-table>
    </a-tab-pane>
  </a-tabs>
  <AddFolioItemDialog
    :is-open="isServiceDialogOpen"
    :folio-id="activeFolio.id"
    @add="reloadFolio"
    @close="isServiceDialogOpen = false"
  />
  <PaymentDialog
    :is-open="isPaymentDialogOpen"
    :all-items="unpaidItems"
    :selected-items="unpaidSelectedItems"
    @add="reloadFolio"
    @close="isPaymentDialogOpen = false"
  />
</template>
<script setup lang="ts">
import { computed, h, ref } from 'vue';
import type { ColumnType } from 'ant-design-vue/es/table';
import { useScopedI18n } from '@/composables/useScopedI18n.ts';
import type { Folio, FolioItem } from '@shared/types/folio.ts';
import { useServiceStore } from '@/stores/serviceStore.ts';
import { getFormattedDate } from '@/utils/dateTimeUtils.ts';
import { folioQueries } from '@/queries/folioQueries.ts';
import {
  CheckCircleFilled,
  DeleteOutlined,
  PlusOutlined,
} from '@ant-design/icons-vue';
import { PaymentMethod } from '@/enums/PaymentMethod.ts';
import Decimal from 'decimal.js';
import { BillingTabTableType } from '@/enums/BillingTabTableType.ts';
import {
  FolioItemType,
  type FolioTransactionRecord, type FolioServiceRecord,
  type FolioTableRecord,
} from '@/types/Folio.ts';
import { translateEnum } from '@/i18n/i18n.ts';

interface Props {
  folios: Folio[],
}

defineOptions({ name: 'BillingTab' });
const { t } = useScopedI18n();

const props = defineProps<Props>();

const serviceStore = useServiceStore();

const activeKey = ref<BillingTabTableType>(BillingTabTableType.SERVICE);
const innerFolios = ref<Folio[]>(props.folios);
const activeFolio = ref<Folio>(innerFolios.value[0]);
const isServiceDialogOpen = ref(false);
const isPaymentDialogOpen = ref(false);
const selectedItems = ref<FolioItem[]>([]);

const columns: ColumnType<FolioTableRecord>[] = [
  {
    title: t('date'),
    dataIndex: 'dateOfService',
    key: 'dateOfService',
    width: 120,
    customRender({ record }) {
      return getFormattedDate(isServiceRecord(record) ? record.dateOfService : record.createdAt);
    },
  },
  {
    title: t('service'),
    dataIndex: 'serviceId',
    key: 'name',
    ellipsis: { showTitle: false },
    customCell: (record) => ({ colSpan: isServiceRecord(record) ? 1 : 3 }),
  },
  {
    title: t('quantity'),
    dataIndex: 'quantity',
    key: 'quantity',
    width: 100,
    align: 'center',
    customCell: (record) => ({ colSpan: isServiceRecord(record) ? 1 : 0 }),
  },
  {
    title: t('price'),
    dataIndex: 'unitPrice',
    width: 120,
    align: 'center',
    customCell: (record) => ({ colSpan: isServiceRecord(record) ? 1 : 0 }),
  },
  {
    title: t('totalPrice'),
    dataIndex: 'totalPrice',
    width: 120,
    align: 'center',
    customRender({ record }) {
      return isServiceRecord(record) ? record.totalPrice : record.amount;
    },
  },
  {
    title: t('balance'),
    dataIndex: 'balance',
    width: 120,
    align: 'center',
    customRender({ index }) {
      return balanceChanges.value.slice(0, index + 1)
        .reduce((sum, value) => new Decimal(sum).add(value).toFixed(2), '0.00');
    },
  },
];

const unpaidItems = computed<FolioItem[]>(() => activeFolio.value.items.filter((item) => !isItemPaid(item)));

const unpaidSelectedItems = computed<FolioItem[]>(() => selectedItems.value.filter((item) => !isItemPaid(item)));

const serviceItems = computed<FolioServiceRecord[]>(() => activeFolio.value.items.map((item) => ({
  ...item,
  itemType: FolioItemType.SERVICE,
})));

const transactionItems = computed<FolioTransactionRecord[]>(() => activeFolio.value.transactions.map((item) => ({
  ...item,
  itemType: FolioItemType.TRANSACTION,
})));

const folioItems = computed<FolioTableRecord[]>(() => [...serviceItems.value, ...transactionItems.value].sort((a, b) => a.createdAt - b.createdAt));

const balanceChanges = computed<string[]>(() => folioItems.value.map((row) => (isServiceRecord(row)
  ? new Decimal(row.totalPrice).negated().toFixed(2)
  : row.amount)));

const customRow = (record: FolioTableRecord) => ({
  onClick: (e: MouseEvent) => {
    if (record.itemType !== FolioItemType.SERVICE) {
      return;
    }
    const isSelected = selectedItems.value.some((item) => item.id === record.id);

    if (e.ctrlKey || e.metaKey) {
      if (isSelected) {
        selectedItems.value = selectedItems.value.filter((item) => item.id !== record.id);
      } else {
        selectedItems.value.push(record);
      }
      return;
    }
    if (isSelected) {
      selectedItems.value = selectedItems.value.length === 1 ? [] : [record];
    } else {
      selectedItems.value = [record];
    }
  },
});

const getRowClassName = (record: FolioTableRecord): string | undefined => {
  if (record.itemType !== FolioItemType.SERVICE) {
    return;
  }
  return selectedItems.value.some((item) => item.id === record.id) ? 'selected' : undefined;
};

const getRecordName = (record: FolioTableRecord): string => {
  if (isServiceRecord(record)) {
    return serviceStore.getById(record.serviceId)?.name ?? '';
  }
  return `${t('payment')} (${translateEnum(PaymentMethod, record.method)})`;
};

const onDeleteItems = async () => {
  await folioQueries.deleteItems(selectedItems.value.map((item) => item.id));
  await reloadFolio();
};

const reloadFolio = async () => {
  selectedItems.value = [];
  activeFolio.value = await folioQueries.getById(activeFolio.value.id);
};

const isItemPaid = (item: FolioItem): boolean => !!item.paymentId;

const isServiceRecord = (record: FolioTableRecord): record is FolioServiceRecord => record.itemType === FolioItemType.SERVICE;
</script>
<style scoped>
.payment-button {
  background-color: #52c41a;
  border-color: #52c41a;
  color: #fff;

  &:hover,
  &:focus {
    background-color: #73d13d;
    border-color: #73d13d;
    color: #fff;
  }

  &:active {
    background-color: #389e0d;
    border-color: #389e0d;
  }
}
</style>
