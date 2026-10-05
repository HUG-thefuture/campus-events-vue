<script setup lang="ts">
// 签到管理：记录列表 + 快捷签到（扫码/人工）
import { ref, reactive, onMounted } from 'vue'
import { getActivities, getSignRecords, createSignRecord } from '@/api'
import { ElMessage } from 'element-plus'
import type { Activity, SignRecord } from '@/types'

const loading = ref(false)
const rows = ref<SignRecord[]>([])
const total = ref(0)
const activities = ref<Activity[]>([])
const dialogOpen = ref(false)
const submitting = ref(false)

const query = reactive({ page: 1, pageSize: 10, activityId: '' })

const signForm = reactive({
  activityId: '',
  studentName: '',
  studentId: '',
  channel: '扫码签到' as '扫码签到' | '人工签到',
})

async function load() {
  loading.value = true
  try {
    const res = await getSignRecords({ ...query })
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

function openSign() {
  signForm.activityId = query.activityId || activities.value[0]?.id || ''
  signForm.studentName = ''
  signForm.studentId = ''
  dialogOpen.value = true
}

async function submitSign() {
  if (!signForm.studentName || !signForm.studentId || !signForm.activityId) {
    ElMessage.warning('请完整填写签到信息')
    return
  }
  submitting.value = true
  try {
    await createSignRecord(signForm)
    ElMessage.success('签到成功，已记录')
    dialogOpen.value = false
    load()
  } catch {
    // 错误已统一拦截
  } finally {
    submitting.value = false
  }
}

function search() {
  query.page = 1
  load()
}

onMounted(() => {
  load()
  loadActivities()
})
</script>

<template>
  <div class="checkins">
    <div class="toolbar">
      <el-select v-model="query.activityId" placeholder="全部活动" clearable filterable class="w260" @change="search">
        <el-option v-for="a in activities" :key="a.id" :label="a.title" :value="a.id" />
      </el-select>
      <el-button type="primary" :icon="'Finished'" class="add" @click="openSign">现场签到</el-button>
    </div>

    <el-table v-loading="loading" :data="rows" class="table ticket">
      <el-table-column prop="studentName" label="学生" min-width="120">
        <template #default="{ row }"><span class="name">{{ row.studentName }}</span></template>
      </el-table-column>
      <el-table-column prop="studentId" label="学号" width="140">
        <template #default="{ row }"><span class="u-mono">{{ row.studentId }}</span></template>
      </el-table-column>
      <el-table-column prop="activityTitle" label="活动" min-width="200" show-overflow-tooltip />
      <el-table-column prop="signedAt" label="签到时间" width="130">
        <template #default="{ row }"><span class="u-mono">{{ row.signedAt }}</span></template>
      </el-table-column>
      <el-table-column prop="channel" label="渠道" width="110">
        <template #default="{ row }">
          <span class="pod" :class="{ 'pod--moss': row.channel === '扫码签到' }">{{ row.channel }}</span>
        </template>
      </el-table-column>
      <template #empty>
        <el-empty description="暂无签到记录">
          <p class="empty-tip">点击右上角“现场签到”完成一次签到。</p>
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

    <!-- 现场签到弹窗 -->
    <el-dialog v-model="dialogOpen" title="现场签到" width="420px" class="sign-dialog">
      <el-form label-position="top">
        <el-form-item label="活动">
          <el-select v-model="signForm.activityId" filterable class="full">
            <el-option v-for="a in activities" :key="a.id" :label="a.title" :value="a.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="学生姓名">
          <el-input v-model="signForm.studentName" placeholder="如：张三" />
        </el-form-item>
        <el-form-item label="学号">
          <el-input v-model="signForm.studentId" placeholder="如：202401001" />
        </el-form-item>
        <el-form-item label="签到渠道">
          <el-radio-group v-model="signForm.channel">
            <el-radio-button value="扫码签到">扫码</el-radio-button>
            <el-radio-button value="人工签到">人工</el-radio-button>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogOpen = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitSign">确认签到</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.checkins {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.w260 { width: 260px; }
.add { box-shadow: var(--shadow-stamp); }
.name { font-weight: 600; }
.table { border-radius: var(--radius-md); overflow: hidden; }
.empty-tip { color: var(--el-text-color-secondary); font-size: var(--t-3); }
.pager { display: flex; justify-content: flex-end; }
.full { width: 100%; }

@media (max-width: 640px) {
  .w260 { width: 100%; }
}
</style>