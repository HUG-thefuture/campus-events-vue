// 组件库统一入口：导出四个后台组件 + 类型
export { default as SearchForm } from './SearchForm.vue'
export { default as PagedTable } from './PagedTable.vue'
export { default as ConfirmDialog } from './ConfirmDialog.vue'
export { default as StatusTag } from './StatusTag.vue'

export type {
  SearchField,
  SearchFormProps,
  SearchFormEmits,
  PagedTableColumn,
  PagedTableProps,
  PagedTableEmits,
  ConfirmDialogProps,
  ConfirmDialogEmits,
  StatusTagProps,
} from './types'