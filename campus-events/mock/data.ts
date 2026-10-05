// Mock 数据：场地、活动、报名、签到、预约、看板
// 由 mock/index.ts（vite-plugin-mock 适配层）消费

export interface MockVenue {
  id: string
  name: string
  location: string
  capacity: number
  tags: string[]
  occupied: { start: string; end: string; title: string }[]
}

export const VENUES: MockVenue[] = [
  { id: 'v1', name: '大学生活动中心 A 厅', location: '东区 3 号楼 1F', capacity: 300, tags: ['音响', '舞台', '投影'], occupied: [{ start: '2025-10-18 14:00', end: '2025-10-18 17:00', title: '十佳歌手决赛' }] },
  { id: 'v2', name: '图书馆报告厅', location: '图书馆 B2 层', capacity: 180, tags: ['投影', '录播'], occupied: [{ start: '2025-10-20 19:00', end: '2025-10-20 21:00', title: '学术讲座' }] },
  { id: 'v3', name: '风雨操场', location: '西区体育场旁', capacity: 800, tags: ['户外', '田径'], occupied: [] },
  { id: 'v4', name: '社团活动室 1', location: '南区宿舍 6 栋楼下', capacity: 40, tags: ['桌椅', '白板'], occupied: [{ start: '2025-10-17 14:00', end: '2025-10-17 16:00', title: '读书会' }] },
]

export interface MockActivity {
  id: string
  title: string
  category: '文体' | '讲座' | '社团' | '志愿' | '竞赛' | '其他'
  status: 'draft' | 'open' | 'ongoing' | 'closed'
  startTime: string
  endTime: string
  venueId: string
  venueName: string
  capacity: number
  enrolled: number
  organizer: string
  description: string
  /** 记忆点：卡片票根颜色相（HSL Hue，0-360） */
  posterHue: number
}

/** 分类 -> 票根色相映射（新建活动按分类取色，保证视觉一致） */
export const CATEGORY_HUES: Record<string, number> = {
  文体: 152,
  讲座: 210,
  社团: 28,
  志愿: 96,
  竞赛: 348,
  其他: 260,
}

export const ACTIVITIES: MockActivity[] = [
  { id: 'a1', title: '秋季草坪音乐节', category: '文体', status: 'open', startTime: '2025-10-15 19:00', endTime: '2025-10-15 21:30', venueId: 'v3', venueName: '风雨操场', capacity: 600, enrolled: 412, organizer: '校学生会文艺部', description: '露天草坪上的乐队与民谣演出，欢迎自带野餐垫。', posterHue: 152 },
  { id: 'a2', title: 'AI 与未来职业发展讲座', category: '讲座', status: 'open', startTime: '2025-10-20 19:00', endTime: '2025-10-20 21:00', venueId: 'v2', venueName: '图书馆报告厅', capacity: 180, enrolled: 165, organizer: '就业指导中心', description: '邀请业界工程师讲解 AI 浪潮下的求职路径与技能准备。', posterHue: 210 },
  { id: 'a3', title: '十佳歌手决赛', category: '文体', status: 'ongoing', startTime: '2025-10-18 14:00', endTime: '2025-10-18 18:00', venueId: 'v1', venueName: '大学生活动中心 A 厅', capacity: 300, enrolled: 300, organizer: '学生会文娱部', description: '年度十佳歌手现场决赛，为心仪的选手投票。', posterHue: 152 },
  { id: 'a4', title: '周末社区志愿服务', category: '志愿', status: 'open', startTime: '2025-10-19 09:00', endTime: '2025-10-19 12:00', venueId: 'v4', venueName: '社团活动室 1', capacity: 30, enrolled: 18, organizer: '青年志愿者协会', description: '前往周边社区开展敬老陪伴与环保宣传。', posterHue: 96 },
  { id: 'a5', title: '程序设计新手赛', category: '竞赛', status: 'closed', startTime: '2025-09-28 13:00', endTime: '2025-09-28 17:00', venueId: 'v2', venueName: '图书馆报告厅', capacity: 150, enrolled: 96, organizer: 'ACM 协会', description: '面向大一新生的入门算法竞赛，以赛促学。', posterHue: 348 },
  { id: 'a6', title: '青禾读书会 · 月度场', category: '社团', status: 'draft', startTime: '2025-10-25 15:00', endTime: '2025-10-25 17:00', venueId: 'v4', venueName: '社团活动室 1', capacity: 40, enrolled: 0, organizer: '青禾读书会', description: '共读《解忧杂货店》，欢迎书友交流。（草稿待发布）', posterHue: 28 },
  { id: 'a7', title: '篮球迎新对抗赛', category: '文体', status: 'open', startTime: '2025-10-16 16:00', endTime: '2025-10-16 18:00', venueId: 'v3', venueName: '风雨操场', capacity: 200, enrolled: 134, organizer: '篮球社', description: '老生 vs 新生，全场热血对抗，观众报名即可观赛。', posterHue: 152 },
]

export interface MockEnrollment {
  id: string
  activityId: string
  activityTitle: string
  studentName: string
  studentId: string
  phone: string
  status: 'pending' | 'confirmed' | 'cancelled'
  createdAt: string
}

const NAMES = ['张伟', '王芳', '李娜', '刘洋', '陈静', '杨帆', '赵磊', '孙悦', '周杰', '吴敏', '郑爽', '冯磊', '蒋雯', '沈静', '韩雪', '陶冶', '林峰', '何雨']
function seedEnrollments(): MockEnrollment[] {
  const list: MockEnrollment[] = []
  let n = 1
  for (const a of ACTIVITIES) {
    const count = Math.min(a.enrolled, 20)
    for (let i = 0; i < count; i++) {
      const name = NAMES[(n + i) % NAMES.length]
      list.push({
        id: `e${n}`,
        activityId: a.id,
        activityTitle: a.title,
        studentName: name,
        studentId: `20240${String((n % 9) + 1)}${String(100 + ((n * 7) % 900))}`,
        phone: `138${String(10000000 + n * 311).slice(0, 8)}`,
        status: i % 7 === 0 ? 'pending' : i % 5 === 0 ? 'cancelled' : 'confirmed',
        createdAt: `2025-10-${String(8 + (n % 10)).padStart(2, '0')} ${String(9 + (n % 10)).padStart(2, '0')}:${String(n % 60).padStart(2, '0')}`,
      })
      n++
    }
  }
  return list
}
export const ENROLLMENTS: MockEnrollment[] = seedEnrollments()

export interface MockSign {
  id: string
  activityId: string
  activityTitle: string
  studentName: string
  studentId: string
  signedAt: string
  channel: '扫码签到' | '人工签到'
}

export const SIGNS: MockSign[] = (() => {
  const list: MockSign[] = []
  let n = 1
  for (const a of ACTIVITIES) {
    const count = Math.min(a.enrolled, 14)
    for (let i = 0; i < count; i++) {
      const name = NAMES[(n + i * 3) % NAMES.length]
      const enroll = ENROLLMENTS.find((e) => e.activityId === a.id)
      list.push({
        id: `s${n}`,
        activityId: a.id,
        activityTitle: a.title,
        studentName: name,
        studentId: enroll ? enroll.studentId : `20240100${n}`,
        signedAt: `2025-10-${String(8 + (n % 10)).padStart(2, '0')} ${String(10 + (n % 10)).padStart(2, '0')}:${String((n * 3) % 60).padStart(2, '0')}`,
        channel: n % 3 === 0 ? '人工签到' : '扫码签到',
      })
      n++
    }
  }
  return list
})()

export interface MockBooking {
  id: string
  venueId: string
  venueName: string
  applicant: string
  purpose: string
  start: string
  end: string
  status: 'pending' | 'approved' | 'rejected'
}

export const BOOKINGS: MockBooking[] = [
  { id: 'b1', venueId: 'v1', venueName: '大学生活动中心 A 厅', applicant: '学生会文娱部', purpose: '十佳歌手决赛', start: '2025-10-18 14:00', end: '2025-10-18 18:00', status: 'approved' },
  { id: 'b2', venueId: 'v2', venueName: '图书馆报告厅', applicant: '就业指导中心', purpose: 'AI 职业发展讲座', start: '2025-10-20 19:00', end: '2025-10-20 21:00', status: 'approved' },
  { id: 'b3', venueId: 'v3', venueName: '风雨操场', applicant: '篮球社', purpose: '迎新对抗赛', start: '2025-10-16 16:00', end: '2025-10-16 18:00', status: 'pending' },
  { id: 'b4', venueId: 'v4', venueName: '社团活动室 1', applicant: '青禾读书会', purpose: '月度读书分享', start: '2025-10-25 15:00', end: '2025-10-25 17:00', status: 'pending' },
]

export const DASHBOARD = {
  totalActivities: ACTIVITIES.length,
  totalEnrollments: ENROLLMENTS.length,
  totalCheckins: SIGNS.length,
  totalVenues: VENUES.length,
  signRate: SIGNS.length / Math.max(1, ENROLLMENTS.length),
  trend: Array.from({ length: 7 }, (_, i) => {
    const day = 8 + i
    return {
      date: `10-${String(day).padStart(2, '0')}`,
      activities: (i % 3) + 1,
      enrollments: 20 + ((i * 11) % 30),
    }
  }),
  categoryDist: [
    { name: '文体', value: 3 },
    { name: '讲座', value: 1 },
    { name: '社团', value: 1 },
    { name: '志愿', value: 1 },
    { name: '竞赛', value: 1 },
  ],
}

export const USERS = [
  { username: 'admin', password: '123456', displayName: '运营管理员', role: 'admin', permissions: ['*'], avatarHue: 30 },
  { username: 'operator', password: '123456', displayName: '活动运营小王', role: 'operator', permissions: ['dashboard', 'activity', 'enrollment', 'checkin', 'venue'], avatarHue: 150 },
]