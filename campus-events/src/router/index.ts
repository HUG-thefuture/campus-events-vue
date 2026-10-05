// 路由配置 + 守卫（登录拦截 + 权限校验）

import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router'
import { useUserStore } from '@/stores/user'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/Login.vue'),
    meta: { title: '登录', public: true },
  },
  {
    path: '/',
    component: () => import('@/layout/MainLayout.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'dashboard',
        component: () => import('@/views/Dashboard.vue'),
        meta: { title: '数据看板', permission: 'dashboard' },
      },
      {
        path: 'activities',
        name: 'activities',
        component: () => import('@/views/Activities.vue'),
        meta: { title: '活动管理', permission: 'activity' },
      },
      {
        path: 'activities/new',
        name: 'activity-new',
        component: () => import('@/views/ActivityForm.vue'),
        meta: { title: '发布活动', permission: 'activity:create' },
      },
      {
        path: 'enrollments',
        name: 'enrollments',
        component: () => import('@/views/Enrollments.vue'),
        meta: { title: '报名管理', permission: 'enrollment' },
      },
      {
        path: 'checkins',
        name: 'checkins',
        component: () => import('@/views/Checkins.vue'),
        meta: { title: '签到管理', permission: 'checkin' },
      },
      {
        path: 'venues',
        name: 'venues',
        component: () => import('@/views/Venues.vue'),
        meta: { title: '场地预约', permission: 'venue' },
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/NotFound.vue'),
    meta: { title: '404', public: true },
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

router.beforeEach((to) => {
  const userStore = useUserStore()

  // 公开页面放行
  if (to.meta.public) return true

  // 未登录 → 登录页
  if (!userStore.isLoggedIn) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  // 已登录但无权限 → 重定向到看板（或第一个可访问菜单）
  const perm = to.meta.permission as string | undefined
  if (perm && !userStore.hasPermission(perm)) {
    const first = userStore.menus[0]
    return first ? { path: first.path } : { name: 'not-found' }
  }

  return true
})

router.afterEach((to) => {
  const title = to.meta.title as string | undefined
  document.title = title ? `${title} · 青禾运营中心` : '青禾 · 校园活动运营中心'
})

export default router