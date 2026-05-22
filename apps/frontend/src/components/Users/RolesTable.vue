<template>
  <div class="roles-table">
    <a-button-group class="roles-table__actions">
      <a-button
        :icon="h(PlusOutlined)"
        :title="t('addRole')"
        @click="openAddDialog"
      />
    </a-button-group>
    <a-table
      class="roles-table__table"
      :columns="columns"
      :data-source="userStore.roles"
      :pagination="{ pageSize: 10 }"
      :custom-row="customRow"
      :show-sorter-tooltip="false"
      row-key="id"
      bordered
      @change="onTableChange"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'name'">
          <HighlightedText
            :text="record.name"
            :query="getTextFilterValue('name')"
          />
        </template>
        <template v-if="column.key === 'permissions'">
          <a-space
            v-if="record.permissions.length"
            wrap
          >
            <a-tag
              v-for="permission in record.permissions"
              :key="permission"
            >
              {{ translateEnum(Permission, permission) }}
            </a-tag>
          </a-space>
        </template>
        <template v-if="column.key === 'type'">
          <a-tag :color="record.isSystem ? 'blue' : 'default'">
            {{ record.isSystem ? t('system') : t('custom') }}
          </a-tag>
        </template>
      </template>
      <template #customFilterIcon="{ filtered }">
        <SearchOutlined :style="{ color: filtered ? '#108ee9' : undefined }" />
      </template>
      <template #customFilterDropdown="filterDropdownProps">
        <SelectFilterDropdown
          v-if="filterDropdownProps.column.key === 'permissions'"
          :filter-dropdown-props="filterDropdownProps"
          :options="permissionFilterOptions"
        />
        <TextFilterDropdown
          v-else
          :filter-dropdown-props="filterDropdownProps"
        />
      </template>
    </a-table>
    <EditRoleDialog
      :is-open="isEditDialogOpen"
      :role="selectedRole"
      @close="closeEditDialog"
    />
  </div>
</template>
<script setup lang="ts">
import { computed, h, ref } from 'vue';
import type { ColumnType } from 'ant-design-vue/es/table';
import type { TableProps } from 'ant-design-vue';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons-vue';
import type { Role } from '@shared/types/user.ts';
import { useUserStore } from '@/stores/userStore.ts';
import { useScopedI18n } from '@/composables/useScopedI18n.ts';
import { getFormattedDate } from '@/utils/dateTimeUtils.ts';
import TextFilterDropdown from '@/components/FilterDropdowns/TextFilterDropdown.vue';
import SelectFilterDropdown from '@/components/FilterDropdowns/SelectFilterDropdown.vue';
import { translateEnum } from '@/i18n/i18n.ts';
import { Permission } from '@shared/enums/Permission.ts';

defineOptions({ name: 'RolesTable' });

const { t } = useScopedI18n();
const userStore = useUserStore();

const selectedRoleId = ref<number>();
const selectedRole = computed<Role | undefined>(
  () => userStore.roles.find((role) => role.id === selectedRoleId.value),
);
const isEditDialogOpen = ref(false);

const permissionFilterOptions = computed(() => userStore.rolePermissions.map((permission) => ({
  label: translateEnum(Permission, permission),
  value: permission,
})));

const includesFilterValue = (source: string | undefined, value: unknown): boolean => {
  if (!source) {
    return false;
  }

  return source.toLowerCase().includes(String(value).toLowerCase());
};

const columns: ColumnType<Role>[] = [
  {
    title: t('name'),
    dataIndex: 'name',
    key: 'name',
    customFilterDropdown: true,
    onFilter: (value, record) => includesFilterValue(record.name, value),
    sorter: (a, b) => a.name.localeCompare(b.name),
  },
  {
    title: t('permissions'),
    dataIndex: 'permissions',
    key: 'permissions',
    customFilterDropdown: true,
    onFilter: (value, record) => record.permissions.includes(value as Permission),
  },
  {
    title: t('type'),
    dataIndex: 'isSystem',
    key: 'type',
    width: 120,
    align: 'center',
    filters: [
      { text: t('system'), value: true },
      { text: t('custom'), value: false },
    ],
    onFilter: (value, record) => record.isSystem === value,
  },
  {
    title: t('createdAt'),
    dataIndex: 'createdAt',
    key: 'createdAt',
    width: 140,
    customRender({ record }) {
      return getFormattedDate(record.createdAt);
    },
    defaultSortOrder: 'descend',
    sorter: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  },
];

const textFilterValues = ref<Record<string, string>>({});

const onTableChange: TableProps<Role>['onChange'] = (_pagination, filters) => {
  textFilterValues.value = {
    name: String(filters.name?.[0] ?? ''),
  };
};

const getTextFilterValue = (columnKey: string): string => textFilterValues.value[columnKey] ?? '';

const openAddDialog = (): void => {
  selectedRoleId.value = undefined;
  isEditDialogOpen.value = true;
};

const openEditDialog = (roleId: number): void => {
  selectedRoleId.value = roleId;
  isEditDialogOpen.value = true;
};

const closeEditDialog = (): void => {
  isEditDialogOpen.value = false;
};

const customRow = (record: Role) => ({
  onClick: () => openEditDialog(record.id),
});
</script>
<style scoped>
.roles-table {
  width: 100%;
}

.roles-table__actions {
  margin-bottom: 10px;
}

.roles-table__table {
  width: 100%;
}

:deep(.roles-table__table .ant-table-row) {
  cursor: pointer;
}
</style>
