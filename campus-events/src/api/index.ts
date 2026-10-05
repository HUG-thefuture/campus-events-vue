// 各业务模块 API（Mock 后端约定 /api 前缀）

import { request } from '@/utils/request'
import type {
  Activity,
  Booking,
  DashboardStats,
  EnrollRecord,
  PageResult,
  SignRecord,
  UserInfo,
  Venue,
} from '@/types'

// —— 认证 ——
export function login(payload: { username: string; password: string }) {
  return request<{ token: string; user: UserInfo }>({ url: '/auth/login', method: 'post', data: payload })
}

// —— 活动 ——
export function getActivities(params: Record<string, unknown>) {
  return request<PageResult<Activity>>({ url: '/activities', method: 'get', params })
}
export function createActivity(data: Partial<Activity>) {
  return request<Activity>({ url: '/activities', method: 'post', data })
}

// —— 报名 ——
export function getEnrollments(params: Record<string, unknown>) {
  return request<PageResult<EnrollRecord>>({ url: '/enrollments', method: 'get', params })
}
export function setEnrollmentStatus(id: string, status: EnrollRecord['status']) {
  return request<EnrollRecord>({ url: `/enrollments/${id}/status`, method: 'patch', data: { status } })
}

// —— 签到 ——
export function getSignRecords(params: Record<string, unknown>) {
  return request<PageResult<SignRecord>>({ url: '/signs', method: 'get', params })
}
export function createSignRecord(data: Partial<SignRecord>) {
  return request<SignRecord>({ url: '/signs', method: 'post', data })
}

// —— 场地 ——
export function getVenues() {
  return request<Venue[]>({ url: '/venues', method: 'get' })
}
export function getBookings(params: Record<string, unknown>) {
  return request<PageResult<Booking>>({ url: '/bookings', method: 'get', params })
}
export function createBooking(data: Partial<Booking>) {
  return request<Booking>({ url: '/bookings', method: 'post', data })
}
export function setBookingStatus(id: string, status: Booking['status']) {
  return request<Booking>({ url: `/bookings/${id}/status`, method: 'patch', data: { status } })
}

// —— 看板 ——
export function getDashboard() {
  return request<DashboardStats>({ url: '/dashboard', method: 'get' })
}