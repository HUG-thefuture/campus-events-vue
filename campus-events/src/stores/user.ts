// 登录用户状态：token + 用户信息 + 菜单权限（基于 role/permissions 派生）

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { UserInfo } from '@/types'
import { login as loginApi } from '@/api'

const TOKEN_KEY = 'qinhe.token'
const USER_KEY = 'qinhe.user'

export interface MenuItem {
  path: string
  title: string
  icon?: string
  permission?: string
  hidden?: boolean
}

// 全量菜单（含所需权限点），由登录用户的权限过滤
export const ALL_MENUS: MenuItem[] = [
  { path: '/dashboard', title: '数据看板', icon: 'DataAnalysis', permission: 'dashboard' },
  { path: '/activities', title: '活动管理', icon: 'Calendar', permission: 'activity' },
  { path: '/activities/new', title: '发布活动', icon: 'CirclePlus', permission: 'activity:create', hidden: true },
  { path: '/enrollments', title: '报名管理', icon: 'User', permission: 'enrollment' },
  { path: '/checkins', title: '签到管理', icon: 'Finished', permission: 'checkin' },
  { path: '/venues', title: '场地预约', icon: 'OfficeBuilding', permission: 'venue' },
]

export const useUserStore = defineStore('user', () => {
  const token = ref<string>(localStorage.getItem(TOKEN_KEY) || '')
  const user = ref<UserInfo | null>(parseUser())

  function parseUser(): UserInfo | null {
    const raw = localStorage.getItem(USER_KEY)
    if (!raw) return null
    try {
      return JSON.parse(raw)
    } catch {
      return null
    }
  }

  const isLoggedIn = computed(() => !!token.value)
  const displayName = computed(() => user.value?.displayName || user.value?.username || '访客')
  const role = computed(() => user.value?.role || 'operator')

  // 菜单权限：admin 拥有全部；operator 依据 permissions 列表过滤
  const menus = computed<MenuItem[]>(() => {
    if (!user.value) return []
    // localStorage 数据可能被手动改坏：permissions 缺失时按空数组降级，避免页面崩溃
    const perms = user.value.permissions ?? []
    const isAdmin = user.value.role === 'admin'
    return ALL_MENUS.filter((m) => {
      if (m.hidden) return false
      if (isAdmin) return true
      if (!m.permission) return true
      return perms.includes(m.permission)
    })
  })

  function hasPermission(perm: string): boolean {
    if (!user.value) return false
    if (user.value.role === 'admin') return true
    return (user.value.permissions ?? []).includes(perm)
  }

  async function login(username: string, password: string) {
    const res = await loginApi({ username, password })
    token.value = res.token
    user.value = res.user
    localStorage.setItem(TOKEN_KEY, res.token)
    localStorage.setItem(USER_KEY, JSON.stringify(res.user))
    return res.user
  }

  function logout() {
    token.value = ''
    user.value = null
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  }

  return {
    token,
    user,
    isLoggedIn,
    displayName,
    role,
    menus,
    hasPermission,
    login,
    logout,
  }
})