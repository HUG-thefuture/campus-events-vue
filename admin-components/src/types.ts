// 共享类型定义

export type FieldType = 'input' | 'select' | 'date' | 'daterange'

export interface SearchField {
  /** 表单字段 key */
  prop: string
  /** 标签 */
  label: string
  /** 控件类型 */
  type?: FieldType
  /** select 的选项 */
  options?: { label: string; value: string | number }[]
  /** 占位符 */
  placeholder?: string
  /** 默认值 */
  defaultValue?: unknown
}

export interface SearchFormProps {
  fields: SearchField[]
  /** 展示在右侧的操作按钮（slot 可覆盖） */
  showReset?: boolean
  showSearch?: boolean
  labelWidth?: string
}

export interface SearchFormEmits {
  (e: 'search', model: Record<string, unknown>): void
  (e: 'reset'): void
}

export interface PagedTableColumn {
  prop: string
  label: string
  width?: string | number
  minWidth?: string | number
  align?: 'left' | 'center' | 'right'
  // 是否使用 scoped slot 自定义该列（命名 = `col-${prop}`）
  custom?: boolean
}

export interface PagedTableProps {
  columns: PagedTableColumn[]
  // 组件库不约束业务行类型，交给调用方透传
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[]
  loading?: boolean
  total?: number
  page?: number
  pageSize?: number
  rowKey?: string
  emptyText?: string
}

export interface PagedTableEmits {
  (e: 'update:page', page: number): void
  (e: 'update:pageSize', size: number): void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (e: 'row-click', row: any, column: any, event: Event): void
}

export interface ConfirmDialogProps {
  title?: string
  content?: string
  confirmText?: string
  cancelText?: string
  type?: 'info' | 'warning' | 'danger'
}

export interface ConfirmDialogEmits {
  (e: 'confirm', payload: unknown): void
  (e: 'cancel'): void
}

export interface StatusTagProps {
  /** 状态值 */
  status: string
  /** 状态 → label / tag 类型 的映射 */
  map?: Record<string, { label: string; type?: 'success' | 'warning' | 'info' | 'danger' | 'primary' }>
  /** 未命中映射时的回退文案 */
  fallbackLabel?: string
}