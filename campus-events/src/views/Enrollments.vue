<script setup lang="ts">
// 报名管理：列表 + 状态筛选 + 确认/取消操作
import { ref, reactive, onActivated } from 'vue'
import { useRoute } from 'vue-router'
import { getActivities, getEnrollments, setEnrollmentStatus } from '@/api'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { Activity, EnrollRecord } from '@/types'

// 显式声明组件名：keep-alive include 按名称匹配缓存
defineOptions({ name: 'Enrollments' })

const route = useRoute()
const loading = ref(false)
const rows = ref<EnrollRecord[]>([])
const total = ref(0)
const activities = ref<Activity[]>([])

const query = reactive({
  page: 1,
  pageSize: 10,
  status: '',
  activityId: (route.query.activityId as string) || '',
})

// keep-alive 缓存复用实例：onActivated 首次挂载与每次复用进入都会触发，用它统一加载。
// 活动下拉必须每次进入都刷新——否则"发布活动→返回本页"时新活动不进筛选下拉
// （onMounted 只执行一次，是 2026-09 审计确认的缓存盲区）。
onActivated(() => {
  loadActivities()
  const next = (route.query.activityId as string) || ''
  if (next !== query.activityId) {
    query.activityId = next
    query.page = 1
  }
  load()
})

const statusText: Record<string, string> = {
  pending: '待确认',
  confirmed: '已确认',
  cancelled: '已取消',
}
const statusTag: Record<string, 'warning' | 'success' | 'info'> = {
  pending: 'warning',
  confirmed: 'success',
  cancelled: 'info',
}

async function load() {
  loading.value = true
  try {
    const res = await getEnrollments({ ...query })
    rows.value = res.list
    total.value = res.total
  } finally {
    loading.value = false
  }
}

async function loadActivities() {
  const res = await getActivities({ page: 1, pageSize: 100 })
  activities.value = res.list
}

async function confirm(row: EnrollRecord) {
  try {
    await ElMessageBox.confirm(`确认通过「${row.studentName}」的报名？`, '确认报名', {
      type: 'warning',
    })
  } catch {
    return
  }
  try {
    await setEnrollmentStatus(row.id, 'confirmed')
  } catch {
    return // 错误信息已由拦截器统一弹出（记录不存在/已被处理时 Mock 返回业务错误）
  }
  ElMessage.success('已确认报名')
  load()
}

async function cancel(row: EnrollRecord) {
  try {
    await ElMessageBox.confirm(`取消「${row.studentName}」的报名？`, '取消报名', {
      type: 'warning',
      confirmButtonText: '确认取消',
    })
  } catch {
    return
  }
  try {
    await setEnrollmentStatus(row.id, 'cancelled')
  } catch {
    return // 错误信息已由拦截器统一弹出
  }
  ElMessage.success('已取消报名')
  load()
}

function search() {
  query.page = 1
  load()
}
</script>

<template>
  <div class="enrollments">
    <div class="toolbar">
      <el-select v-model="query.status" placeholder="全部状态" clearable class="w140" @change="search">
        <el-option label="待确认" value="pending" />
        <el-option label="已确认" value="confirmed" />
        <el-option label="已取消" value="cancelled" />
      </el-select>
      <el-select v-model="query.activityId" placeholder="全部活动" clearable filterable class="w220" @change="search">
        <el-option v-for="a in activities" :key="a.id" :label="a.title" :value="a.id" />
      </el-select>
    </div>

    <el-table v-loading="loading" :data="rows" class="table ticket">
      <el-table-column prop="studentName" label="学生" min-width="120">
        <template #default="{ row }">
          <span class="name">{{ row.studentName }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="studentId" label="学号" width="140">
        <template #default="{ row }">
          <span class="u-mono">{{ row.studentId }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="activityTitle" label="活动" min-width="200" show-overflow-tooltip />
      <el-table-column prop="phone" label="手机号" width="140">
        <template #default="{ row }">
          <span class="u-mono">{{ row.phone }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="报名时间" width="120">
        <template #default="{ row }">
          <span class="u-mono">{{ row.createdAt }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="statusTag[row.status]" effect="light">{{ statusText[row.status] }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="160" fixed="right">
        <template #default="{ row }">
          <template v-if="row.status === 'pending'">
            <el-button size="small" type="primary" @click="confirm(row as EnrollRecord)">确认</el-button>
            <el-button size="small" @click="cancel(row as EnrollRecord)">取消</el-button>
          </template>
          <el-text v-else type="info" size="small">已处理</el-text>
        </template>
      </el-table-column>
      <template #empty>
        <el-empty description="暂无报名记录">
          <p class="empty-tip">调整筛选条件，或等待学生报名。</p>
        </el-empty>
      </template>
    </el-table>

    <div class="pager">
      <el-pagination
        v-model:current-page="query.page"
        v-model:page-size="query.pageSize"
        :total="total"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next"
        @current-change="load"
        @size-change="search"
      />
    </div>
  </div>
</template>

<style scoped>
.enrollments {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.w140 { width: 140px; }
.w220 { width: 220px; }
.name {
  font-weight: 600;
}
.table {
  border-radius: var(--radius-md);
  overflow: hidden;
}
.empty-tip {
  color: var(--el-text-color-secondary);
  font-size: var(--t-3);
}
.pager {
  display: flex;
  justify-content: flex-end;
}

@media (max-width: 640px) {
  .w140, .w220 { width: 100%; }
}
</style>