// 活动状态 store：维护活动列表状态、筛选条件、以及跨页面的「当场活动」选中态

import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Activity } from '@/types'

export const useActivityStore = defineStore('activity', () => {
  // 全部活动（部分页面需要做筛选/日历渲染，故拉全量到内存模拟轻量后台）
  const activities = ref<Activity[]>([])
  const loading = ref(false)
  // 全局筛选
  const filters = ref<{ keyword: string; status: string; category: string }>({
    keyword: '',
    status: '',
    category: '',
  })
  // 当前被聚焦查看的活动（详情/签到/报名跳转携带）
  const current = ref<Activity | null>(null)

  function setActivities(list: Activity[]) {
    activities.value = list
  }
  function setCurrent(activity: Activity | null) {
    current.value = activity
  }
  function setFilters(partial: Partial<typeof filters.value>) {
    filters.value = { ...filters.value, ...partial }
  }

  // 报名配额进度（供活动卡片记忆点渲染）
  function progressOf(a: Activity): number {
    if (a.capacity <= 0) return 0
    return Math.min(100, Math.round((a.enrolled / a.capacity) * 100))
  }

  function statusLabel(s: Activity['status']): string {
    const map: Record<string, string> = {
      draft: '草稿',
      open: '报名中',
      ongoing: '进行中',
      closed: '已结束',
    }
    return map[s] ?? s
  }

  return {
    activities,
    loading,
    filters,
    current,
    setActivities,
    setCurrent,
    setFilters,
    progressOf,
    statusLabel,
  }
})