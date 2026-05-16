<template>
  <a-button-group class="mb-5">
    <a-button
      type="primary"
      :icon="h(DeleteOutlined)"
      :title="t('delete')"
      :disabled="!selectedItems.length"
      danger
    />
  </a-button-group>
  <a-table
    class="folio-items scroll-table"
    :columns="columns"
    :data-source="items"
    :pagination="false"
    :row-class-name="getRowClassName"
    :custom-row="customRow"
    size="small"
    bordered
    :scroll="{ y: '390px' }"
  >
    <template #bodyCell="{ column, record }">
      <a-tooltip
        v-if="column.key === 'name'"
        placement="topLeft"
      >
        <template #title>
          {{ t('paidAt') }} link
        </template>
        <CheckCircleFilled
          v-if="isItemPaid(record as FolioServiceRecord)"
          :style="{ color: '#52c41a' }"
        />
        {{ getRecordName(record as FolioServiceRecord) }}
      </a-tooltip>
    </template>
  </a-table>
  <AddServiceItemDialog
    :is-open="isServiceDialogOpen"
    :folio-id="folioId"
    @add="emitChange"
    @close="isServiceDialogOpen = false"
  />
</template>
<script setup lang="ts">
import type { FolioServiceRecord, FolioTransactionRecord } from '@/types/Folio.ts';
import { useScopedI18n } from '@/composables/useScopedI18n.ts';
import { h, type PropType, ref } from 'vue';
import { CheckCircleFilled, DeleteOutlined } from '@ant-design/icons-vue';
import { useServiceStore } from '@/stores/serviceStore.ts';
import type { ColumnType } from 'ant-design-vue/es/table';
import { getFormattedDate } from '@/utils/dateTimeUtils.ts';
import { folioQueries } from '@/queries/folioQueries.ts';

defineOptions({ name: 'TransactionsTable' });
const { t } = useScopedI18n();

defineProps({
  folioId: {
    type: Number,
    required: true,
  },
  items: {
    type: Array as PropType<FolioTransactionRecord[]>,
    required: true,
  },
});
const emit = defineEmits<{
  change: [];
}>();

const serviceStore = useServiceStore();

const selectedItems = ref<FolioServiceRecord[]>([]);
const isServiceDialogOpen = ref(false);

const columns: ColumnType<FolioTransactionRecord>[] = [
  {
    title: t('date'),
    dataIndex: 'dateOfService',
    key: 'dateOfService',
    width: 120,
    customRender({ record }) {
      return getFormattedDate(record.createdAt);
    },
  },
  {
    title: t('service'),
    dataIndex: 'serviceId',
    key: 'name',
    ellipsis: { showTitle: false },
  },
  {
    title: t('quantity'),
    dataIndex: 'quantity',
    key: 'quantity',
    width: 100,
    align: 'center',
  },
  {
    title: t('price'),
    dataIndex: 'unitPrice',
    width: 120,
    align: 'center',
  },
  {
    title: t('totalPrice'),
    dataIndex: 'totalPrice',
    width: 120,
    align: 'center',
    customRender({ record }) {
      return record.amount;
    },
  },
];

const getRowClassName = (record: FolioServiceRecord): string | undefined => (selectedItems.value.some((item) => item.id === record.id) ? 'selected' : undefined);

const isItemPaid = (item: FolioServiceRecord): boolean => !!item.paymentId;

const getRecordName = (record: FolioServiceRecord): string => serviceStore.getById(record.serviceId)?.name ?? '';

const onDeleteItems = async () => {
  await folioQueries.deleteItems(selectedItems.value.map((item) => item.id));
  emitChange();
};

const emitChange = () => {
  emit('change');
};

const customRow = (record: FolioServiceRecord) => ({
  onClick: (e: MouseEvent) => {
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
</script>
<style scoped>

</style>
