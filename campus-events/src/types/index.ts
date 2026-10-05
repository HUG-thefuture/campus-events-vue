// 全局领域类型定义

export type ActivityStatus = 'draft' | 'open' | 'ongoing' | 'closed'

export interface Activity {
  id: string
  title: string
  category: '文体' | '讲座' | '社团' | '志愿' | '竞赛' | '其他'
  status: ActivityStatus
  startTime: string
  endTime: string
  venueId: string
  venueName: string
  capacity: number
  enrolled: number
  organizer: string
  posterHue: number // 记忆点：卡片票根颜色相（见活动卡片）
  description: string
}

export interface EnrollRecord {
  id: string
  activityId: string
  activityTitle: string
  studentName: string
  studentId: string
  phone: string
  status: 'pending' | 'confirmed' | 'cancelled'
  createdAt: string
}

export interface SignRecord {
  id: string
  activityId: string
  activityTitle: string
  studentName: string
  studentId: string
  signedAt: string
  channel: '扫码签到' | '人工签到'
}

export interface Venue {
  id: string
  name: string
  location: string
  capacity: number
  tags: string[]
  // 场地占用时间段，用于预约冲突检测
  occupied: { start: string; end: string; title: string }[]
}

export interface Booking {
  id: string
  venueId: string
  venueName: string
  applicant: string
  purpose: string
  start: string
  end: string
  status: 'pending' | 'approved' | 'rejected'
}

export interface UserInfo {
  username: string
  displayName: string
  role: 'admin' | 'operator'
  permissions: string[]
  avatarHue: number
}

export interface DashboardStats {
  totalActivities: number
  totalEnrollments: number
  totalCheckins: number
  totalVenues: number
  trend: { date: string; activities: number; enrollments: number }[]
  categoryDist: { name: string; value: number }[]
  signRate: number
}

export interface PageResult<T> {
  list: T[]
  total: number
}