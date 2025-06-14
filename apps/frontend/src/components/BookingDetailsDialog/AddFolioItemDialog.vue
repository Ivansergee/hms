<template>
  <a-modal
    :open="isOpen"
    :title="t('addService')"
    @cancel="onClose"
  >
    <template #footer>
      <a-button
        type="primary"
        :disabled="!selectedService"
        @click="onAdd"
      >
        {{ t('add') }}
      </a-button>
    </template>
    <a-row
      class="mb-10"
      :gutter="10"
    >
      <a-col :span="12">
        <a-table
          class="scroll-table"
          :columns="groupsCol"
          :data-source="groups"
          :pagination="false"
          :row-class-name="getGroupRowClassName"
          :custom-row="customGroupRow"
          size="small"
          bordered
          :scroll="{ y: '155px' }"
        />
      </a-col>
      <a-col :span="12">
        <a-table
          class="scroll-table"
          :columns="servicesCol"
          :data-source="services"
          :pagination="false"
          :row-class-name="getServiceRowClassName"
          :custom-row="customServiceRow"
          size="small"
          bordered
          :scroll="{ y: '155px' }"
        />
      </a-col>
    </a-row>
    <a-form
      ref="formRef"
      class="form"
      layout="vertical"
      :model="formModel"
      :rules="rules"
      :hide-required-mark="true"
    >
      <a-row>
        <a-col :span="12">
          <a-form-item
            name="dateOfService"
            :label="t('dateOfService')"
          >
            <a-date-picker
              v-model:value="formModel.dateOfService"
              format="DD.MM.YYYY"
            />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item
            name="quantity"
            :label="t('quantity')"
          >
            <a-input-number v-model:value="formModel.quantity" :min="1"/>
          </a-form-item>
        </a-col>
      </a-row>
    </a-form>
  </a-modal>
</template>
<script setup lang="ts">
import { useServiceStore } from "@/stores/serviceStore.ts";
import type { ColumnType } from "ant-design-vue/es/table";
import { useScopedI18n } from "@/composables/useScopedI18n.ts";
import { computed, reactive, ref } from "vue";
import type { Service, ServiceGroup } from "@shared/types/service.ts";
import dayjs, { type Dayjs } from "dayjs";
import type { RuleObject } from "ant-design-vue/es/form";
import { folioQueries } from "@/queries/folioQueries.ts";
import Decimal from "decimal.js";
import { toISOString } from "@/utils/dateTimeUtils.ts";

interface Props {
  isOpen: boolean;
  folioId: number;
}

interface FormModel {
  dateOfService: Dayjs;
  quantity: number;
}

defineOptions({ name: 'AddFolioItemDialog' });
const { t } = useScopedI18n();

const props = defineProps<Props>();
const emit = defineEmits<{
  (event: 'close'): void;
  (event: 'add'): void;
}>();

const serviceStore = useServiceStore();

const servicesCol: ColumnType[] = [
  {
    title: t('name'),
    dataIndex: 'name',
    key: 'name',
    ellipsis: true,
  },
  {
    title: t('price'),
    dataIndex: 'price',
    key: 'price',
  },
];

const groupsCol: ColumnType[] = [
  {
    title: t('group'),
    dataIndex: 'name',
    key: 'group',
  },
];

const groups = computed<ServiceGroup[]>(() => {
  return [
    { id: 0, name: t('all') },
    ...serviceStore.groups,
  ];
});

const services = computed<Service[]>(() => {
  if (selectedGroup.value.id === 0) {
    return serviceStore.services;
  }
  return serviceStore.services.filter(service => service.groupId === selectedGroup.value?.id);
});

const formRef = ref();
const selectedGroup = ref<ServiceGroup>(groups.value[0]);
const selectedService = ref<Service>();

const formModel = reactive<FormModel>({
  dateOfService: dayjs(),
  quantity: 1,
});

const rules: { [key: string]: RuleObject[] } = {
  dateOfService: [{
    required: true,
    message: t('errorRequiredField'),
  }],
  quantity: [{
    required: true,
    message: t('errorRequiredField'),
  }],
}

const customGroupRow = (record: ServiceGroup) => {
  return {
    onClick: () => {
        selectedGroup.value = record;
    }
  };
}

const customServiceRow = (record: Service) => {
  return {
    onClick: () => {
      if (selectedService.value?.id === record.id) {
        selectedService.value = undefined;
      } else {
        selectedService.value = record;
      }
    }
  };
}

const getGroupRowClassName = (record: ServiceGroup): string | undefined => {
  return selectedGroup.value?.id === record.id ? 'selected' : undefined;
};

const getServiceRowClassName = (record: Service): string | undefined => {
  return selectedService.value?.id === record.id ? 'selected' : undefined;
};

const onAdd = async () => {
  if (selectedService.value) {
    try {
      await formRef.value?.validate();
      await folioQueries.addItem(props.folioId, {
        serviceId: selectedService.value.id,
        quantity: formModel.quantity,
        unitPrice: selectedService.value.price,
        totalPrice: new Decimal(selectedService.value.price).mul(formModel.quantity).toFixed(2),
        dateOfService: toISOString(formModel.dateOfService),
      });
      emit('add');
    } catch {
      return;
    }
    onClose();
  }
};

const onClose = () => {
  selectedService.value = undefined;
  selectedGroup.value = groups.value[0];
  formModel.quantity = 1;
  formModel.dateOfService = dayjs();
  emit('close');
};
</script>
<style scoped>
:deep(.ant-table-cell) {
  padding: 4px 8px !important;
}
</style>
