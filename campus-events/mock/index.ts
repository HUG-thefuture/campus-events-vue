// vite-plugin-mock 适配层：拦截 /api/* 请求，返回本地 Mock 数据
// 内存态可变数据：报名状态、签到、预约、活动等可在会话内增删改

import type { MockMethod } from 'vite-plugin-mock'
import {
  VENUES,
  ACTIVITIES,
  CATEGORY_HUES,
  ENROLLMENTS,
  SIGNS,
  BOOKINGS,
  DASHBOARD,
  USERS,
  type MockActivity,
  type MockEnrollment,
  type MockSign,
  type MockBooking,
} from './data'

// 运行时可变副本（每次 dev 启动重置）
let activities: MockActivity[] = ACTIVITIES.map((a) => ({ ...a }))
let enrollments: MockEnrollment[] = ENROLLMENTS.map((e) => ({ ...e }))
let signs: MockSign[] = SIGNS.map((s) => ({ ...s }))
let bookings: MockBooking[] = BOOKINGS.map((b) => ({ ...b }))

function ok(data: unknown) {
  return { code: 0, data, message: 'ok' }
}
function fail(message: string, code = 1) {
  return { code, data: null, message }
}

function paginate<T>(list: T[], page = 1, pageSize = 10) {
  const total = list.length
  const start = (page - 1) * pageSize
  const items = list.slice(start, start + pageSize)
  return { list: items, total }
}

let seq = 1000
const nextId = (prefix: string) => `${prefix}${++seq}`

export default [
  // —— 认证 ——
  {
    url: '/api/auth/login',
    method: 'post',
    response: ({ body }: any) => {
      const { username, password } = body || {}
      const u = USERS.find((x) => x.username === username && x.password === password)
      if (!u) return fail('用户名或密码错误')
      return ok({
        token: `mock-token-${u.username}-${Date.now()}`,
        user: {
          username: u.username,
          displayName: u.displayName,
          role: u.role,
          permissions: u.permissions,
          avatarHue: u.avatarHue,
        },
      })
    },
  },

  // —— 活动 ——
  {
    url: '/api/activities',
    method: 'get',
    response: ({ query }: any) => {
      const { page = 1, pageSize = 10 } = query || {}
      return ok(paginate(activities, Number(page), Number(pageSize)))
    },
  },
  {
    url: '/api/activities',
    method: 'post',
    response: ({ body }: any) => {
      const a: MockActivity = {
        id: nextId('a'),
        title: body.title,
        category: body.category,
        status: 'open',
        startTime: body.startTime,
        endTime: body.endTime,
        venueId: body.venueId,
        venueName: body.venueName || '未指定场地',
        capacity: Number(body.capacity) || 50,
        enrolled: 0,
        organizer: body.organizer,
        description: body.description || '',
        // 票根色相：按分类取色，保证同类活动视觉一致
        posterHue: CATEGORY_HUES[body.category] ?? 260,
      }
      activities.unshift(a)
      return ok(a)
    },
  },

  // —— 报名 ——
  {
    url: '/api/enrollments',
    method: 'get',
    response: ({ query }: any) => {
      const { page = 1, pageSize = 10, status, activityId } = query || {}
      let list = enrollments.slice()
      if (status) list = list.filter((e) => e.status === status)
      if (activityId) list = list.filter((e) => e.activityId === activityId)
      return ok(paginate(list, Number(page), Number(pageSize)))
    },
  },
  {
    url: '/api/enrollments/:id/status',
    method: 'patch',
    response: ({ query, body }: any) => {
      const e = enrollments.find((x) => x.id === query.id)
      if (!e) return fail('报名记录不存在', 404)
      e.status = body.status
      return ok(e)
    },
  },

  // —— 签到 ——
  {
    url: '/api/signs',
    method: 'get',
    response: ({ query }: any) => {
      const { page = 1, pageSize = 10, activityId } = query || {}
      let list = signs.slice()
      if (activityId) list = list.filter((s) => s.activityId === activityId)
      return ok(paginate(list, Number(page), Number(pageSize)))
    },
  },
  {
    url: '/api/signs',
    method: 'post',
    response: ({ body }: any) => {
      // 用真实当前时间生成签到时间（补零到两位）
      const d = new Date()
      const p = (n: number) => String(n).padStart(2, '0')
      const now = `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`
      const a = activities.find((x) => x.id === body.activityId)
      const s: MockSign = {
        id: nextId('s'),
        activityId: body.activityId,
        activityTitle: a?.title ?? '未知活动',
        studentName: body.studentName,
        studentId: body.studentId,
        signedAt: now,
        channel: body.channel ?? '扫码签到',
      }
      signs.unshift(s)
      return ok(s)
    },
  },

  // —— 场地 & 预约 ——
  {
    url: '/api/venues',
    method: 'get',
    response: () => ok(VENUES),
  },
  {
    url: '/api/bookings',
    method: 'get',
    response: ({ query }: any) => {
      const { page = 1, pageSize = 10 } = query || {}
      return ok(paginate(bookings, Number(page), Number(pageSize)))
    },
  },
  {
    url: '/api/bookings',
    method: 'post',
    response: ({ body }: any) => {
      // 后端兜底校验：同场地已有待审批/已通过的预约与所选时段重叠则拒绝
      const overlapped = bookings.some(
        (b) => b.venueId === body.venueId && b.status !== 'rejected' && body.start < b.end && body.end > b.start,
      )
      if (overlapped) return fail('所选时段与已有预约冲突', 409)
      const b: MockBooking = {
        id: nextId('b'),
        venueId: body.venueId,
        venueName: body.venueName || '未指定场地',
        applicant: body.applicant,
        purpose: body.purpose,
        start: body.start,
        end: body.end,
        status: 'pending',
      }
      bookings.unshift(b)
      return ok(b)
    },
  },
  {
    url: '/api/bookings/:id/status',
    method: 'patch',
    response: ({ query, body }: any) => {
      const b = bookings.find((x) => x.id === query.id)
      if (!b) return fail('预约不存在', 404)
      b.status = body.status
      // 审批通过 => 占用时段写入场地，冲突检测数据随之更新
      if (body.status === 'approved') {
        const venue = VENUES.find((v) => v.id === b.venueId)
        if (venue && !venue.occupied.some((o) => o.start === b.start && o.end === b.end)) {
          venue.occupied.push({ start: b.start, end: b.end, title: b.purpose })
        }
      }
      return ok(b)
    },
  },

  // —— 看板 ——
  {
    url: '/api/dashboard',
    method: 'get',
    response: () => ok(DASHBOARD),
  },
] as MockMethod[]