<template>
  <a-flex
    class="mb-10"
    justify="space-between"
  >
    <a-space>
      <a-button
        type="primary"
        @click="isServiceDialogOpen = true"
      >
        {{ t('add') }}
      </a-button>
      <a-button
        type="primary"
        :icon="h(DeleteOutlined)"
        :title="t('delete')"
        :disabled="!selectedItems.length"
        danger
        @click="onDeleteItems"
      />
    </a-space>
    <a-button
      class="payment-button"
      type="primary"
      @click="isPaymentDialogOpen = true"
    >
      {{ t('payment') }}
    </a-button>
  </a-flex>
  <a-table
    class="folio-items scroll-table"
    :columns="columns"
    :data-source="tableRows"
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
          v-if="isItemRecord(record as FolioTableRecord) && isItemPaid(record as FolioItemRecord)"
          :style="{ color: '#52c41a' }"
        />
        {{ getRecordName(record as FolioTableRecord) }}
      </template>
    </template>
  </a-table>
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
import { computed, h, onMounted, ref } from "vue";
import type { ColumnType } from "ant-design-vue/es/table";
import { useScopedI18n } from "@/composables/useScopedI18n.ts";
import type { Folio, FolioItem, Payment } from "@shared/types/folio.ts";
import { useServiceStore } from "@/stores/serviceStore.ts";
import { getFormattedDate } from "@/utils/dateTimeUtils.ts";
import { folioQueries } from "@/queries/folioQueries.ts";
import { CheckCircleFilled, DeleteOutlined } from '@ant-design/icons-vue';
import { PaymentMethod } from "@/enums/PaymentMethod.ts";
import Decimal from "decimal.js";

interface FolioItemRecord extends FolioItem {
  type: 'item';
}

interface FolioPaymentRecord extends Payment {
  type: 'payment';
}

type FolioTableRecord =  FolioItemRecord | FolioPaymentRecord;

interface Props {
  folios: Folio[],
}

defineOptions({ name: 'FolioTab' });
const { t, translateEnum } = useScopedI18n();

const props = defineProps<Props>();

const serviceStore = useServiceStore();

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
        return getFormattedDate(isItemRecord(record) ? record.dateOfService : record.createdAt);
      },
    },
    {
      title: t('name'),
      dataIndex: 'serviceId',
      key: 'name',
      ellipsis: { showTitle: false },
      customCell: (record) => {
        return { colSpan: isItemRecord(record) ? 1 : 3 };
      }
    },
    {
      title: t('quantity'),
      dataIndex: 'quantity',
      key: 'quantity',
      width: 100,
      align: 'center',
      customCell: (record) => {
        return { colSpan: isItemRecord(record) ? 1 : 0 };
      }
    },
    {
      title: t('price'),
      dataIndex: 'unitPrice',
      width: 120,
      align: 'center',
      customCell: (record) => {
        return { colSpan: isItemRecord(record) ? 1 : 0 };
      }
    },
    {
      title: t('totalPrice'),
      dataIndex: 'totalPrice',
      width: 120,
      align: 'center',
      customRender({ record }) {
        return isItemRecord(record) ? record.totalPrice : record.amount;
      },
    },
    {
      title: t('balance'),
      dataIndex: 'balance',
      width: 120,
      align: 'center',
      customRender({ index }) {
        return balanceChanges.value.slice(0, index + 1)
          .reduce((sum, value) => {
            return new Decimal(sum).add(value).toFixed(2);
          }, '0.00')
      },
    }
];

const unpaidItems = computed<FolioItem[]>(() => {
  return activeFolio.value.items.filter((item) => !isItemPaid(item));
});

const unpaidSelectedItems = computed<FolioItem[]>(() => {
  return selectedItems.value.filter((item) => !isItemPaid(item));
});

const tableRows = computed<FolioTableRecord[]>(() => {
  const items = activeFolio.value.items.map(item => ({
    ...item,
    type: 'item' as const,
  }));

  const payments = activeFolio.value.payments.map(payment => ({
    ...payment,
    type: 'payment' as const,
  }));

  return [...items, ...payments].sort((a, b) => a.createdAt - b.createdAt);
});

const balanceChanges = computed<string[]>(() => {
  return tableRows.value.map(row => isItemRecord(row)
    ? new Decimal(row.totalPrice).negated().toFixed(2)
    : row.amount
  );
});

const customRow = (record: FolioTableRecord) => {
  return {
    onClick: (e: MouseEvent) => {
      if (record.type !== 'item') {
        return;
      }
      const isSelected = selectedItems.value.some(item => item.id === record.id);

      if (e.ctrlKey || e.metaKey) {
        if (isSelected) {
          selectedItems.value = selectedItems.value.filter(item => item.id !== record.id);
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
    }
  };
}

const getRowClassName = (record: FolioTableRecord): string | undefined => {
  if (record.type !== 'item') {
    return;
  }
  return selectedItems.value.some(item => item.id === record.id) ? 'selected' : undefined;
};

const getRecordName = (record: FolioTableRecord): string => {
  if (isItemRecord(record)) {
    return serviceStore.getById(record.serviceId)?.name ?? '';
  } else {
    return `${t('payment')} (${translateEnum(PaymentMethod, record.method)})`;
  }
};

const onDeleteItems = async () => {
  await folioQueries.deleteItems(selectedItems.value.map(item => item.id));
  await reloadFolio();
};

const reloadFolio = async () => {
  selectedItems.value = [];
  activeFolio.value = await folioQueries.getById(activeFolio.value.id);
};

const isItemPaid = (item: FolioItem): boolean => {
  return !!item.paymentId;
};

const isItemRecord = (record: FolioTableRecord): record is FolioItemRecord => {
  return record.type === 'item';
}

onMounted(() => {
  console.log(tableRows.value)
})
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
