// Axios 实例封装：统一拦截、错误归一化、Mock 开关（配合 vite-plugin-mock 的 /api 前缀）

import axios, { type AxiosInstance, type AxiosRequestConfig, type InternalAxiosRequestConfig } from 'axios'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'

export interface ApiResult<T = unknown> {
  code: number
  data: T
  message: string
}

// 从 localStorage 注入 token（Mock 场景下模拟真实鉴权流程）
function getToken(): string | null {
  return localStorage.getItem('qinhe.token')
}

const service: AxiosInstance = axios.create({
  baseURL: '/api',
  timeout: 10000,
})

// 请求拦截：携带 token
service.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getToken()
  if (token) {
    config.headers = config.headers ?? {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 响应拦截：剥离业务外壳，做错误归一化
service.interceptors.response.use(
  (response) => {
    const res = response.data as ApiResult
    if (res.code !== 0) {
      ElMessage.error(res.message || '请求失败')
      return Promise.reject(new Error(res.message || '请求失败'))
    }
    // 约定：业务数据在 data 字段
    return res.data as never
  },
  (error) => {
    const status = error?.response?.status
    if (status === 401) {
      ElMessage.error('登录已过期，请重新登录')
      // 清除登录态并跳转登录页。必须走 store.logout()：只删 localStorage 时
      // Pinia 内存态仍在，isLoggedIn 仍为 true，路由守卫会继续放行形成"假登录态"，
      // 后续请求反复 401 反复弹错。带上 redirect 让登录后回到原页面（Login 已支持）。
      useUserStore().logout()
      if (location.hash !== '#/login' && !location.hash.startsWith('#/login?')) {
        location.hash = `#/login?redirect=${encodeURIComponent(location.hash.slice(1))}`
      }
    } else {
      const msg = error?.response?.data?.message || error?.message || '网络异常，请稍后重试'
      ElMessage.error(msg)
    }
    return Promise.reject(error)
  },
)

/** 泛型请求：直接返回业务数据 T */
export function request<T>(config: AxiosRequestConfig): Promise<T> {
  return service.request(config) as Promise<T>
}

export default service