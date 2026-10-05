<script setup lang="ts">
// 组件库演示页：展示 SearchForm / PagedTable / ConfirmDialog / StatusTag 四种用法
import { ref, computed, watch } from 'vue'
import {
  SearchForm,
  PagedTable,
  ConfirmDialog,
  StatusTag,
  type SearchField,
  type PagedTableColumn,
} from '../src'

const confirmRef = ref<InstanceType<typeof ConfirmDialog>>()

// —— 1. 搜索表单 ——
const fields: SearchField[] = [
  { prop: 'keyword', label: '关键词', placeholder: '标题 / 姓名' },
  { prop: 'status', label: '状态', type: 'select', options: [
    { label: '启用', value: 'on' },
    { label: '停用', value: 'off' },
  ] },
  { prop: 'range', label: '日期', type: 'daterange' },
]
const searchModel = ref<Record<string, unknown>>({})
function onSearch(m: Record<string, unknown>) {
  searchModel.value = m
}
function onReset() {
  searchModel.value = {}
}

// —— 2. 分页表格 ——
interface Row { id: number; name: string; dept: string; status: string }
const allRows: Row[] = Array.from({ length: 42 }, (_, i) => ({
  id: i + 1,
  name: `用户 ${i + 1}`,
  dept: i % 2 === 0 ? '运营组' : '活动组',
  status: i % 3 === 0 ? 'off' : i % 5 === 0 ? 'pending' : 'on',
}))

const columns: PagedTableColumn[] = [
  { prop: 'id', label: 'ID', width: 80 },
  { prop: 'name', label: '姓名', minWidth: 120 },
  { prop: 'dept', label: '部门', width: 120 },
  { prop: 'status', label: '状态', width: 120, custom: true },
]

const page = ref(1)
const pageSize = ref(10)

// 2026-09 审计修复：旧实现 total 固定 42、页码不随搜索归 1 ——
// 在第 2/3 页搜索会得到空白页且页脚仍显示"共 42 条"。改为：
// 关键词/状态 → 过滤列表 → total 派生，筛选变化时页码归 1。
// （2026-09 二次审计：状态下拉此前未接入过滤，形同摆设，现已生效）
const keyword = computed(() => (searchModel.value.keyword as string | undefined) ?? '')
const status = computed(() => (searchModel.value.status as string | undefined) ?? '')
const filteredRows = computed(() => {
  let list = allRows
  const kw = keyword.value
  if (kw) list = list.filter((r) => r.name.includes(kw))
  if (status.value) list = list.filter((r) => r.status === status.value)
  return list
})
const total = computed(() => filteredRows.value.length)
watch([keyword, status], () => { page.value = 1 })

const pagedData = computed(() => {
  const start = (page.value - 1) * pageSize.value
  return filteredRows.value.slice(start, start + pageSize.value)
})

// —— 状态标签 ——
const statusMap = {
  on: { label: '启用', type: 'success' as const },
  off: { label: '停用', type: 'danger' as const },
  pending: { label: '待审核', type: 'warning' as const },
}

// —— 3. 确认弹窗 ——
const lastConfirm = ref<string>('')
function askDelete(row: Row) {
  confirmRef.value?.open(row)
}
function onConfirm(payload: unknown) {
  const r = payload as Row
  lastConfirm.value = `已确认删除：${r.name} (ID ${r.id})`
}

// —— 边界状态：空表格 ——
const emptyData = ref<Row[]>([])
const emptyCols: PagedTableColumn[] = [
  { prop: 'name', label: '无数据示例' },
]
</script>

<template>
  <div class="demo">
    <header class="demo__hero ticket stamp">
      <h1>admin-components · 组件库演示</h1>
      <p>四个可复用后台组件：SearchForm / PagedTable / ConfirmDialog / StatusTag</p>
    </header>

    <!-- 1. 搜索表单 -->
    <section class="demo-section ticket stamp">
      <h2>① SearchForm 搜索表单</h2>
      <p class="desc">通过 <code>fields</code> 声明式配置字段，<code>search</code>/<code>reset</code> 事件回传模型。</p>
      <SearchForm :fields="fields" @search="onSearch" @reset="onReset" />
      <el-divider />
      <p class="desc">当前搜索模型：<code class="u-code">{{ JSON.stringify(searchModel) }}</code></p>
    </section>

    <!-- 2. 分页表格 -->
    <section class="demo-section ticket stamp">
      <h2>② PagedTable 分页表格</h2>
      <p class="desc">内置加载态、空状态、分页；自定义列用 <code>custom: true</code> + 命名 slot。</p>
      <PagedTable
        :columns="columns"
        :data="pagedData"
        :total="total"
        :page="page"
        :page-size="pageSize"
        @update:page="page = $event"
        @update:page-size="pageSize = $event"
      >
        <template #col-status="{ row }">
          <StatusTag :status="row.status" :map="statusMap" />
        </template>
      </PagedTable>
    </section>

    <!-- 3. 确认弹窗 -->
    <section class="demo-section ticket stamp">
      <h2>③ ConfirmDialog 确认弹窗</h2>
      <p class="desc">通过 <code>ref.open(payload)</code> 打开，<code>confirm(payload)</code> 回传上下文。</p>
      <div class="btn-row">
        <el-button type="danger" plain @click="askDelete(allRows[0])">删除示例行</el-button>
        <span class="u-code">{{ lastConfirm || '尚未确认任何操作' }}</span>
      </div>
      <ConfirmDialog
        ref="confirmRef"
        title="删除用户"
        content="删除后不可恢复，确定继续？"
        confirm-text="删除"
        type="danger"
        @confirm="onConfirm"
      />
    </section>

    <!-- 4. 状态标签 -->
    <section class="demo-section ticket stamp">
      <h2>④ StatusTag 状态标签</h2>
      <p class="desc"><code>map</code> 声明状态 → label/type 映射，未命中走回退文案。</p>
      <div class="tag-row">
        <StatusTag status="on" :map="statusMap" />
        <StatusTag status="off" :map="statusMap" />
        <StatusTag status="pending" :map="statusMap" />
        <StatusTag status="weird" :map="statusMap" fallback-label="未定义状态" />
      </div>
    </section>

    <!-- 5. 边界状态 -->
    <section class="demo-section ticket stamp">
      <h2>⑤ 边界状态：空数据表格</h2>
      <p class="desc"><code>empty-text</code> 可自定义空状态文案。</p>
      <PagedTable :columns="emptyCols" :data="emptyData" :total="0" empty-text="这里什么都没有，试试搜索其他条件" />
    </section>
  </div>
</template>

<style scoped>
.demo {
  display: flex;
  flex-direction: column;
  gap: 18px;
  max-width: 960px;
  margin: 0 auto;
  padding: 24px 16px;
}
.demo__hero {
  padding: 28px;
  background: #fffdf7;
}
.demo__hero h1 {
  margin: 0 0 6px;
  font-size: 22px;
}
.demo__hero p {
  margin: 0;
  color: #7a7265;
}
.demo-section {
  padding: 20px;
  background: #fffdf7;
}
.demo-section h2 {
  margin: 0 0 6px;
  font-size: 17px;
}
.desc {
  color: #7a7265;
  font-size: 13px;
  margin: 0 0 12px;
}
.u-code {
  font-family: 'IBM Plex Mono', ui-monospace, Consolas, monospace;
  font-size: 12px;
  background: #f6f1e5;
  padding: 2px 6px;
  border-radius: 4px;
  word-break: break-all;
}
.btn-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}
.tag-row {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}
</style>