<template>
  <div class="users-table">
    <a-button-group class="users-table__actions">
      <a-button
        :icon="h(PlusOutlined)"
        :title="t('addUser')"
        @click="openAddDialog"
      />
    </a-button-group>
    <a-table
      class="users-table__table"
      :columns="columns"
      :data-source="userStore.users"
      :pagination="{ pageSize: 10 }"
      :custom-row="customRow"
      :show-sorter-tooltip="false"
      row-key="id"
      bordered
      @change="onTableChange"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="['username', 'name', 'email'].includes(String(column.key))">
          <HighlightedText
            :text="getTextColumnValue(record, column.key)"
            :query="getTextFilterValue(String(column.key))"
          />
        </template>
        <template v-if="column.key === 'roles'">
          <a-space
            v-if="record.roles.length"
            wrap
          >
            <a-tag
              v-for="role in record.roles"
              :key="role.id"
            >
              {{ role.name }}
            </a-tag>
          </a-space>
        </template>
        <template v-if="column.key === 'isActive'">
          <a-tag :color="record.isActive ? 'green' : 'red'">
            {{ record.isActive ? t('active') : t('disabled') }}
          </a-tag>
        </template>
      </template>
      <template #customFilterIcon="{ filtered }">
        <SearchOutlined :style="{ color: filtered ? '#108ee9' : undefined }" />
      </template>
      <template #customFilterDropdown="filterDropdownProps">
        <SelectFilterDropdown
          v-if="filterDropdownProps.column.key === 'roles'"
          :filter-dropdown-props="filterDropdownProps"
          :options="roleFilterOptions"
        />
        <TextFilterDropdown
          v-else
          :filter-dropdown-props="filterDropdownProps"
        />
      </template>
    </a-table>
    <EditUserDialog
      :is-open="isEditDialogOpen"
      :user="selectedUser"
      @close="closeEditDialog"
    />
  </div>
</template>
<script setup lang="ts">
import {
  computed, h, ref,
} from 'vue';
import type { ColumnType } from 'ant-design-vue/es/table';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons-vue';
import { useUserStore } from '@/stores/userStore.ts';
import { useScopedI18n } from '@/composables/useScopedI18n.ts';
import { getFormattedDate } from '@/utils/dateTimeUtils.ts';
import type { UserListItem } from '@/queries/userQueries.ts';
import TextFilterDropdown from '@/components/FilterDropdowns/TextFilterDropdown.vue';
import SelectFilterDropdown from '@/components/FilterDropdowns/SelectFilterDropdown.vue';
import type { TableProps } from 'ant-design-vue';

defineOptions({ name: 'UsersTable' });

const { t } = useScopedI18n();
const userStore = useUserStore();

const selectedUserId = ref<number>();
const selectedUser = computed<UserListItem | undefined>(
  () => userStore.users.find((user) => user.id === selectedUserId.value),
);

const isEditDialogOpen = ref(false);

const roleFilterOptions = computed(() => userStore.roles.map((role) => ({
  label: role.name,
  value: role.id,
})));

const includesFilterValue = (source: string | undefined, value: unknown): boolean => {
  if (!source) {
    return false;
  }

  return source.toLowerCase().includes(String(value).toLowerCase());
};

const columns: ColumnType<UserListItem>[] = [
  {
    title: t('username'),
    dataIndex: 'username',
    key: 'username',
    customFilterDropdown: true,
    onFilter: (value, record) => includesFilterValue(record.username, value),
    sorter: (a, b) => a.username.localeCompare(b.username),
  },
  {
    title: t('name'),
    dataIndex: 'name',
    key: 'name',
    customFilterDropdown: true,
    onFilter: (value, record) => includesFilterValue(record.name, value),
    sorter: (a, b) => a.name.localeCompare(b.name),
  },
  {
    title: t('email'),
    dataIndex: 'email',
    key: 'email',
    customFilterDropdown: true,
    onFilter: (value, record) => includesFilterValue(record.email, value),
  },
  {
    title: t('roles'),
    dataIndex: 'roles',
    key: 'roles',
    customFilterDropdown: true,
    onFilter: (value, record) => record.roles.some((role) => role.id === value),
  },
  {
    title: t('status'),
    dataIndex: 'isActive',
    key: 'isActive',
    width: 120,
    align: 'center',
    filters: [
      { text: t('active'), value: true },
      { text: t('disabled'), value: false },
    ],
    onFilter: (value, record) => record.isActive === value,
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

const onTableChange: TableProps<UserListItem>['onChange'] = (_pagination, filters) => {
  textFilterValues.value = {
    username: String(filters.username?.[0] ?? ''),
    name: String(filters.name?.[0] ?? ''),
    email: String(filters.email?.[0] ?? ''),
  };
};

const getTextFilterValue = (columnKey: string): string => textFilterValues.value[columnKey] ?? '';

const getTextColumnValue = (record: Record<string, unknown>, columnKey: unknown): string | undefined => {
  if (columnKey === 'username' || columnKey === 'name' || columnKey === 'email') {
    return String(record[columnKey] ?? '');
  }

  return undefined;
};

const openAddDialog = (): void => {
  selectedUserId.value = undefined;
  isEditDialogOpen.value = true;
};

const openEditDialog = (userId: number): void => {
  selectedUserId.value = userId;
  isEditDialogOpen.value = true;
};

const closeEditDialog = (): void => {
  isEditDialogOpen.value = false;
};

const customRow = (record: UserListItem) => ({
  onClick: () => openEditDialog(record.id),
});
</script>
<style scoped>
.users-table {
  width: 100%;
}

.users-table__actions {
  margin-bottom: 10px;
}

.users-table__table {
  width: 100%;
}

:deep(.users-table__table .ant-table-row) {
  cursor: pointer;
}
</style>
