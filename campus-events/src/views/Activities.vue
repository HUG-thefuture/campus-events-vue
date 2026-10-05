<script setup lang="ts">
// 活动管理：卡片列表 + 按日日历网格两种视图 + 筛选
import { ref, computed, onActivated } from 'vue'
import { useRouter } from 'vue-router'
import { getActivities } from '@/api'
import { useActivityStore } from '@/stores/activity'
import ActivityCard from '@/components/ActivityCard.vue'
import type { Activity } from '@/types'

// 显式声明组件名：keep-alive include 按名称匹配缓存
defineOptions({ name: 'Activities' })

const router = useRouter()
const activityStore = useActivityStore()

const loading = ref(false)
const all = ref<Activity[]>([])
const view = ref<'grid' | 'calendar'>('grid')
const search = ref('')
const statusFilter = ref('')
const categoryFilter = ref('')

const filtered = computed(() => {
  let list = all.value
  if (search.value) {
    const kw = search.value.trim().toLowerCase()
    list = list.filter((a) => a.title.toLowerCase().includes(kw) || a.organizer.includes(kw))
  }
  if (statusFilter.value) list = list.filter((a) => a.status === statusFilter.value)
  if (categoryFilter.value) list = list.filter((a) => a.category === categoryFilter.value)
  return list
})

// —— 日历视图：按日期分组 ——
const calendarGroups = computed(() => {
  const map = new Map<string, Activity[]>()
  for (const a of filtered.value) {
    const day = a.startTime.slice(0, 10)
    if (!map.has(day)) map.set(day, [])
    map.get(day)!.push(a)
  }
  return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]))
})

function weekdayLabel(day: string) {
  const d = new Date(day + 'T00:00:00')
  return ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][d.getDay()]
}

async function load() {
  loading.value = true
  try {
    const res = await getActivities({ page: 1, pageSize: 100 })
    all.value = res.list
    activityStore.setActivities(res.list)
  } finally {
    loading.value = false
  }
}

function goNew() {
  router.push('/activities/new')
}

function openDetail(a: Activity) {
  activityStore.setCurrent(a)
  router.push({ path: '/enrollments', query: { activityId: a.id } })
}

// keep-alive 缓存复用实例：onMounted 只在首次挂载执行一次，"发布活动→返回列表"
// 时不会重新拉取，新活动要手动刷新才能看到。onActivated 在首次挂载与每次
// 缓存复用进入时都会触发，用它统一加载数据。
onActivated(load)
</script>

<template>
  <div v-loading="loading" class="activities">
    <!-- 工具栏 -->
    <div class="toolbar">
      <el-input
        v-model="search"
        placeholder="搜索活动标题 / 主办方"
        clearable
        class="toolbar__search"
      >
        <template #prefix><el-icon><Search /></el-icon></template>
      </el-input>
      <el-select v-model="statusFilter" placeholder="全部状态" clearable class="toolbar__select">
        <el-option label="草稿" value="draft" />
        <el-option label="报名中" value="open" />
        <el-option label="进行中" value="ongoing" />
        <el-option label="已结束" value="closed" />
      </el-select>
      <el-select v-model="categoryFilter" placeholder="全部分类" clearable class="toolbar__select">
        <el-option v-for="c in ['文体', '讲座', '社团', '志愿', '竞赛', '其他']" :key="c" :label="c" :value="c" />
      </el-select>

      <el-radio-group v-model="view" class="toolbar__view">
        <el-radio-button value="grid">卡片</el-radio-button>
        <el-radio-button value="calendar">日历</el-radio-button>
      </el-radio-group>

      <el-button type="primary" :icon="'Plus'" class="toolbar__add" @click="goNew">
        发布活动
      </el-button>
    </div>

    <!-- 卡片视图 -->
    <div v-if="view === 'grid' && filtered.length" class="grid">
      <ActivityCard
        v-for="a in filtered"
        :key="a.id"
        :activity="a"
        :progress="activityStore.progressOf(a)"
        @click="openDetail"
      />
    </div>

    <!-- 日历视图 -->
    <div v-else-if="view === 'calendar' && filtered.length" class="calendar">
      <div v-for="[day, list] in calendarGroups" :key="day" class="cal-day ticket">
        <div class="cal-day__head">
          <span class="cal-day__date u-mono">{{ day }}</span>
          <span class="cal-day__week">{{ weekdayLabel(day) }}</span>
        </div>
        <div class="cal-day__items">
          <div v-for="a in list" :key="a.id" class="cal-item" @click="openDetail(a)">
            <span class="pod" :class="{ 'pod--active': a.status === 'open', 'pod--moss': a.status === 'ongoing' }">
              {{ activityStore.statusLabel(a.status) }}
            </span>
            <span class="cal-item__title">{{ a.title }}</span>
            <span class="u-mono cal-item__time">{{ a.startTime.slice(11, 16) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <el-empty v-else description="没有找到符合条件的活动">
      <p class="empty-tip">尝试调整筛选条件，或发布一场新活动。</p>
    </el-empty>
  </div>
</template>

<style scoped>
.activities {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
}
.toolbar__search {
  width: 260px;
}
.toolbar__select {
  width: 140px;
}
.toolbar__view {
  margin-left: auto;
}
.toolbar__add {
  box-shadow: var(--shadow-stamp);
}
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 16px;
}
.calendar {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.cal-day {
  padding: 14px 18px;
}
.cal-day__head {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin-bottom: 10px;
}
.cal-day__date {
  font-weight: 700;
  font-size: 15px;
  color: var(--c-moss);
}
.cal-day__week {
  font-size: var(--t-4);
  color: var(--el-text-color-secondary);
}
.cal-day__items {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.cal-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border-radius: var(--radius-sm);
  background: var(--el-fill-color-light);
  cursor: pointer;
  transition: background 0.15s;
}
.cal-item:hover {
  background: var(--el-fill-color);
}
.cal-item__title {
  flex: 1;
  font-size: var(--t-2);
}
.cal-item__time {
  color: var(--el-text-color-secondary);
  font-size: var(--t-4);
}
.empty-tip {
  color: var(--el-text-color-secondary);
  font-size: var(--t-3);
}

@media (max-width: 640px) {
  .toolbar__search {
    width: 100%;
  }
  .toolbar__view {
    margin-left: 0;
  }
  .toolbar__add {
    width: 100%;
  }
}
</style>