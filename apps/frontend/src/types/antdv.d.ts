import 'ant-design-vue';

declare module 'ant-design-vue/es/table' {
  interface ColumnType {
    dataIndex: string;
  }
}
