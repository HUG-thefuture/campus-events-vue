<script setup lang="ts">
import type { PagedTableProps, PagedTableEmits, PagedTableColumn } from './types'

const props = withDefaults(defineProps<PagedTableProps>(), {
  loading: false,
  total: 0,
  page: 1,
  pageSize: 10,
  rowKey: 'id',
  emptyText: '暂无数据',
})

const emit = defineEmits<PagedTableEmits>()

function customSlotName(col: PagedTableColumn) {
  return `col-${col.prop}`
}
</script>

<template>
  <div class="paged-table">
    <el-table
      :data="props.data"
      v-loading="props.loading"
      :row-key="props.rowKey"
      @row-click="(row: any, col: any, event: Event) => emit('row-click', row, col, event)"
    >
      <template v-for="col in props.columns" :key="col.prop">
        <el-table-column
          v-if="!col.custom"
          :prop="col.prop"
          :label="col.label"
          :width="col.width"
          :min-width="col.minWidth"
          :align="col.align"
          show-overflow-tooltip
        />
        <el-table-column v-else :label="col.label" :width="col.width" :min-width="col.minWidth" :align="col.align">
          <template #default="scope">
            <slot :name="customSlotName(col)" v-bind="scope" />
          </template>
        </el-table-column>
      </template>

      <template #empty>
        <el-empty :description="props.emptyText" />
      </template>
    </el-table>

    <div v-if="props.total > 0" class="paged-table__footer">
      <el-pagination
        :current-page="props.page"
        :page-size="props.pageSize"
        :total="props.total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next"
        background
        @update:current-page="(p: number) => emit('update:page', p)"
        @update:page-size="(s: number) => emit('update:pageSize', s)"
      />
    </div>
  </div>
</template>

<style scoped>
.paged-table__footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 14px;
}
</style>