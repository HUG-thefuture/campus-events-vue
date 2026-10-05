<script setup lang="ts">
// 场地预约：场地卡片 + 预约记录 + 新建预约（含冲突检测）
import { ref, reactive, computed, onMounted } from 'vue'
import { getVenues, getBookings, createBooking, setBookingStatus } from '@/api'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { Booking, Venue } from '@/types'

// 显式声明组件名：keep-alive include 按名称匹配缓存
defineOptions({ name: 'Venues' })

const loading = ref(false)
const venues = ref<Venue[]>([])
const bookings = ref<Booking[]>([])
const dialogOpen = ref(false)
const submitting = ref(false)

const form = reactive({
  venueId: '',
  applicant: '',
  purpose: '',
  start: '',
  end: '',
})

const statusText: Record<string, string> = {
  pending: '待审批',
  approved: '已通过',
  rejected: '已驳回',
}
const statusTag: Record<string, 'warning' | 'success' | 'danger'> = {
  pending: 'warning',
  approved: 'success',
  rejected: 'danger',
}

const selectedVenue = computed(() => venues.value.find((v) => v.id === form.venueId))

// 冲突检测：null=时间未填全；true=与已有占用重叠（冲突）；false=空闲可约
const timeConflict = computed<boolean | null>(() => {
  if (!selectedVenue.value || !form.start || !form.end) return null
  return selectedVenue.value.occupied.some((o) => {
    return form.start < o.end && form.end > o.start
  })
})

async function load() {
  loading.value = true
  try {
    const [v, b] = await Promise.all([getVenues(), getBookings({ page: 1, pageSize: 50 })])
    venues.value = v
    bookings.value = b.list
  } finally {
    loading.value = false
  }
}

function openBooking(venue: Venue) {
  form.venueId = venue.id
  form.applicant = ''
  form.purpose = ''
  form.start = ''
  form.end = ''
  dialogOpen.value = true
}

async function submit() {
  if (!form.venueId || !form.applicant || !form.purpose || !form.start || !form.end) {
    ElMessage.warning('请完整填写预约信息')
    return
  }
  if (form.start >= form.end) {
    ElMessage.warning('结束时间必须晚于开始时间')
    return
  }
  // 冲突时段直接拦截提交，后端 mock 同样校验兜底
  if (timeConflict.value === true) {
    ElMessage.warning('所选时段与已有预约冲突，请更换时间')
    return
  }
  submitting.value = true
  try {
    await createBooking({
      ...form,
      venueName: selectedVenue.value?.name ?? '',
    })
    ElMessage.success('预约已提交，等待审批')
    dialogOpen.value = false
    load()
  } catch {
    // 统一拦截
  } finally {
    submitting.value = false
  }
}

async function decide(id: string, action: 'approved' | 'rejected') {
  const actionText = action === 'approved' ? '通过' : '驳回'
  try {
    await ElMessageBox.confirm(`确定要${actionText}这条预约吗？`, '审批确认', {
      confirmButtonText: actionText,
      cancelButtonText: '取消',
      type: 'warning',
    })
  } catch {
    return
  }
  try {
    await setBookingStatus(id, action)
    ElMessage.success(`已${actionText}预约`)
    load()
  } catch {
    // 统一拦截
  }
}

onMounted(load)
</script>

<template>
  <div v-loading="loading" class="venues">
    <!-- 场地卡片 -->
    <h3 class="section-title">可用场地</h3>
    <div class="venue-grid">
      <div v-for="v in venues" :key="v.id" class="venue ticket stamp">
        <div class="venue__head">
          <h4 class="venue__name">{{ v.name }}</h4>
          <span class="pod pod--moss u-mono">{{ v.capacity }} 人</span>
        </div>
        <p class="venue__loc">{{ v.location }}</p>
        <div class="venue__tags">
          <el-tag v-for="t in v.tags" :key="t" size="small" effect="plain">{{ t }}</el-tag>
        </div>
        <el-button type="primary" plain class="venue__book" @click="openBooking(v)">预约此场地</el-button>
      </div>
    </div>

    <!-- 预约记录 -->
    <h3 class="section-title">预约记录</h3>
    <el-table v-loading="loading" :data="bookings" class="table ticket">
      <el-table-column prop="venueName" label="场地" min-width="140" />
      <el-table-column prop="applicant" label="申请人" width="120" />
      <el-table-column prop="purpose" label="用途" min-width="180" show-overflow-tooltip />
      <el-table-column label="时间段" min-width="220">
        <template #default="{ row }">
          <span class="u-mono">{{ row.start }} ~ {{ row.end }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="statusTag[row.status]">{{ statusText[row.status] }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="160" fixed="right">
        <template #default="{ row }">
          <template v-if="row.status === 'pending'">
            <el-button size="small" type="primary" @click="decide(row.id, 'approved')">通过</el-button>
            <el-button size="small" type="danger" @click="decide(row.id, 'rejected')">驳回</el-button>
          </template>
          <el-text v-else type="info" size="small">已处理</el-text>
        </template>
      </el-table-column>
      <template #empty>
        <el-empty description="暂无预约记录">
          <p class="empty-tip">在场地卡片上发起一条新预约。</p>
        </el-empty>
      </template>
    </el-table>

    <!-- 预约弹窗 -->
    <el-dialog v-model="dialogOpen" :title="`预约 · ${selectedVenue?.name ?? ''}`" width="460px">
      <el-form label-position="top">
        <el-form-item label="申请人">
          <el-input v-model="form.applicant" placeholder="如：青禾读书会" />
        </el-form-item>
        <el-form-item label="用途">
          <el-input v-model="form.purpose" placeholder="如：社团纳新宣讲" />
        </el-form-item>
        <el-form-item label="开始时间">
          <el-date-picker
            v-model="form.start"
            type="datetime"
            placeholder="开始时间"
            format="YYYY-MM-DD HH:mm"
            value-format="YYYY-MM-DD HH:mm"
            class="full"
          />
        </el-form-item>
        <el-form-item label="结束时间">
          <el-date-picker
            v-model="form.end"
            type="datetime"
            placeholder="结束时间"
            format="YYYY-MM-DD HH:mm"
            value-format="YYYY-MM-DD HH:mm"
            class="full"
          />
        </el-form-item>
        <el-alert
          v-if="form.start && form.end && timeConflict === true"
          title="该时段与已有预约冲突，请更换时间"
          type="warning"
          :closable="false"
          show-icon
        />
        <el-alert
          v-else-if="form.start && form.end && timeConflict === false"
          title="该时段空闲，可预约"
          type="success"
          :closable="false"
          show-icon
        />
      </el-form>
      <template #footer>
        <el-button @click="dialogOpen = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submit">提交预约</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.venues {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.section-title {
  margin: 4px 0 0;
  font-size: 17px;
}
.venue-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
}
.venue {
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.venue__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}
.venue__name {
  margin: 0;
  font-size: 16px;
}
.venue__loc {
  margin: 0;
  font-size: var(--t-3);
  color: var(--el-text-color-secondary);
}
.venue__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  min-height: 24px;
}
.venue__book {
  margin-top: 4px;
  width: 100%;
}
.table {
  border-radius: var(--radius-md);
  overflow: hidden;
}
.empty-tip { color: var(--el-text-color-secondary); font-size: var(--t-3); }
.full { width: 100%; }
</style>