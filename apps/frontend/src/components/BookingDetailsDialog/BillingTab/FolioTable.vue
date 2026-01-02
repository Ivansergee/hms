<!--<template>-->
<!--  <a-table-->
<!--    class="folio-items scroll-table"-->
<!--    :columns="columns"-->
<!--    :data-source="tableRows"-->
<!--    :pagination="false"-->
<!--    :row-class-name="getRowClassName"-->
<!--    :custom-row="customRow"-->
<!--    size="small"-->
<!--    bordered-->
<!--    :scroll="{ y: '390px' }"-->
<!--  >-->
<!--    <template #bodyCell="{ column, record }">-->
<!--      <template v-if="column.key === 'name'">-->
<!--        <CheckCircleFilled-->
<!--          v-if="isItemRecord(record as FolioTableRecord) && isItemPaid(record as FolioItemRecord)"-->
<!--          :style="{ color: '#52c41a' }"-->
<!--        />-->
<!--        {{ getRecordName(record as FolioTableRecord) }}-->
<!--      </template>-->
<!--    </template>-->
<!--  </a-table>-->
<!--</template>-->
<!--<script setup lang="ts">-->
<!--import { h } from "vue";-->
<!--import { CheckCircleFilled, DeleteOutlined, PlusOutlined } from "@ant-design/icons-vue";-->
<!--import type { ColumnType } from "ant-design-vue/es/table";-->
<!--import { getFormattedDate } from "@/utils/dateTimeUtils.ts";-->
<!--import Decimal from "decimal.js";-->
<!--import { useScopedI18n } from "@/composables/useScopedI18n.ts";-->

<!--interface Props {-->
<!--}-->

<!--defineOptions({ name: 'FolioTab' });-->
<!--const { t } = useScopedI18n();-->

<!--const props = defineProps<Props>();-->
<!--const emit = defineEmits();-->

<!--const columns: ColumnType<FolioTableRecord>[] = [-->
<!--  {-->
<!--    title: t('date'),-->
<!--    dataIndex: 'dateOfService',-->
<!--    key: 'dateOfService',-->
<!--    width: 120,-->
<!--    customRender({ record }) {-->
<!--      return getFormattedDate(isItemRecord(record) ? record.dateOfService : record.createdAt);-->
<!--    },-->
<!--  },-->
<!--  {-->
<!--    title: t('service'),-->
<!--    dataIndex: 'serviceId',-->
<!--    key: 'name',-->
<!--    ellipsis: { showTitle: false },-->
<!--    customCell: (record) => {-->
<!--      return { colSpan: isItemRecord(record) ? 1 : 3 };-->
<!--    }-->
<!--  },-->
<!--  {-->
<!--    title: t('quantity'),-->
<!--    dataIndex: 'quantity',-->
<!--    key: 'quantity',-->
<!--    width: 100,-->
<!--    align: 'center',-->
<!--    customCell: (record) => {-->
<!--      return { colSpan: isItemRecord(record) ? 1 : 0 };-->
<!--    }-->
<!--  },-->
<!--  {-->
<!--    title: t('price'),-->
<!--    dataIndex: 'unitPrice',-->
<!--    width: 120,-->
<!--    align: 'center',-->
<!--    customCell: (record) => {-->
<!--      return { colSpan: isItemRecord(record) ? 1 : 0 };-->
<!--    }-->
<!--  },-->
<!--  {-->
<!--    title: t('totalPrice'),-->
<!--    dataIndex: 'totalPrice',-->
<!--    width: 120,-->
<!--    align: 'center',-->
<!--    customRender({ record }) {-->
<!--      return isItemRecord(record) ? record.totalPrice : record.amount;-->
<!--    },-->
<!--  },-->
<!--  {-->
<!--    title: t('balance'),-->
<!--    dataIndex: 'balance',-->
<!--    width: 120,-->
<!--    align: 'center',-->
<!--    customRender({ index }) {-->
<!--      return balanceChanges.value.slice(0, index + 1)-->
<!--        .reduce((sum, value) => {-->
<!--          return new Decimal(sum).add(value).toFixed(2);-->
<!--        }, '0.00')-->
<!--    },-->
<!--  }-->
<!--];-->
<!--</script>-->
<!--<style scoped>-->

<!--</style>-->
