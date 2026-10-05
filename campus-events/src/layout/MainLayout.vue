<script setup lang="ts">
// 主布局：左侧导航（桌面）+ 移动端抽屉，顶部工具条（面包屑 + 用户）
import { ref, computed, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessageBox } from 'element-plus'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const drawerOpen = ref(false)
const isMobile = ref(false)

// 简单响应式判定（匹配 CSS 断点 768px）
function checkMobile() {
  isMobile.value = window.innerWidth < 768
}
checkMobile()
window.addEventListener('resize', checkMobile)
onBeforeUnmount(() => window.removeEventListener('resize', checkMobile))

const menus = computed(() => userStore.menus)
const activePath = computed(() => route.path)

function mobileNavigate(path: string) {
  drawerOpen.value = false
  router.push(path)
}

function iconComponent(name?: string) {
  return name || 'Menu'
}

async function handleLogout() {
  try {
    await ElMessageBox.confirm('确定要退出登录吗？', '退出登录', {
      confirmButtonText: '退出',
      cancelButtonText: '取消',
      type: 'warning',
    })
  } catch {
    return
  }
  userStore.logout()
  router.replace('/login')
}
</script>

<template>
  <div class="layout">
    <!-- 桌面侧栏 -->
    <aside v-if="!isMobile" class="sidebar">
      <div class="brand">
        <span class="brand__mark">青</span>
        <span class="brand__text">
          <strong>青禾</strong>
          <small>校园活动运营</small>
        </span>
      </div>

      <nav class="nav">
        <router-link
          v-for="m in menus"
          :key="m.path"
          :to="m.path"
          class="nav__item"
          :class="{ 'nav__item--active': activePath === m.path }"
        >
          <el-icon :size="18"><component :is="iconComponent(m.icon)" /></el-icon>
          <span>{{ m.title }}</span>
        </router-link>
      </nav>

      <div class="sidebar__foot">
        <p class="u-mono">v1.0 · Mock 演示</p>
      </div>
    </aside>

    <!-- 移动端抽屉 -->
    <el-drawer
      v-model="drawerOpen"
      direction="ltr"
      size="240px"
      :with-header="false"
      class="mobile-drawer"
    >
      <div class="brand">
        <span class="brand__mark">青</span>
        <span class="brand__text">
          <strong>青禾</strong>
          <small>校园活动运营</small>
        </span>
      </div>
      <nav class="nav">
        <a
          v-for="m in menus"
          :key="m.path"
          class="nav__item"
          :class="{ 'nav__item--active': activePath === m.path }"
          @click="mobileNavigate(m.path)"
        >
          <el-icon :size="18"><component :is="iconComponent(m.icon)" /></el-icon>
          <span>{{ m.title }}</span>
        </a>
      </nav>
    </el-drawer>

    <!-- 主区 -->
    <div class="main">
      <header class="topbar">
        <div class="topbar__left">
          <el-button
            v-if="isMobile"
            text
            circle
            :icon="'Menu'"
            @click="drawerOpen = true"
            aria-label="打开菜单"
          />
          <h1 class="topbar__title">{{ route.meta.title || '青禾运营中心' }}</h1>
        </div>
        <div class="topbar__right">
          <span class="topbar__hello">你好，{{ userStore.displayName }}</span>
          <el-dropdown trigger="click">
            <span class="avatar" :style="{ background: `hsl(${userStore.user?.avatarHue ?? 0} 45% 42%)` }">
              {{ userStore.displayName.slice(0, 1) }}
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item disabled>
                  {{ userStore.role === 'admin' ? '超级管理员' : '运营成员' }}
                </el-dropdown-item>
                <el-dropdown-item divided @click="handleLogout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </header>

      <main class="content">
        <router-view v-slot="{ Component }">
          <!-- include 匹配组件名：各视图已用 defineOptions 显式声明 PascalCase 名称 -->
          <keep-alive :include="['Activities', 'Enrollments', 'Venues']">
            <component :is="Component" />
          </keep-alive>
        </router-view>
      </main>
    </div>
  </div>
</template>

<style scoped>
.layout {
  display: flex;
  min-height: 100vh;
}

/* —— 侧栏 —— */
.sidebar {
  width: 220px;
  flex-shrink: 0;
  background: var(--c-moss);
  color: #f4efe3;
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 0;
  height: 100vh;
}
.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 20px 16px;
}
.brand__mark {
  display: inline-grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: var(--c-clay);
  color: #fff;
  font-family: var(--f-serif);
  font-size: 22px;
  font-weight: 700;
  box-shadow: var(--shadow-stamp);
}
.brand__text {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
}
.brand__text strong {
  font-family: var(--f-serif);
  font-size: 18px;
  letter-spacing: 0.06em;
}
.brand__text small {
  font-size: var(--t-4);
  opacity: 0.75;
}
.nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px 12px;
  flex: 1;
}
.nav__item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 11px 14px;
  border-radius: var(--radius-sm);
  color: rgba(244, 239, 227, 0.8);
  font-size: var(--t-2);
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
  text-decoration: none;
}
.nav__item:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}
.nav__item--active {
  background: var(--c-paper);
  color: var(--c-moss);
  font-weight: 600;
  box-shadow: var(--shadow-stamp);
}
.nav__item--active:hover {
  background: var(--c-paper);
  color: var(--c-moss);
}
.sidebar__foot {
  padding: 16px 20px;
  font-size: var(--t-4);
  opacity: 0.55;
}

/* —— 主区 —— */
.main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}
.topbar {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--gutter);
  background: rgba(244, 239, 227, 0.85);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid var(--el-border-color-light);
  position: sticky;
  top: 0;
  z-index: 20;
}
.topbar__left {
  display: flex;
  align-items: center;
  gap: 8px;
}
.topbar__title {
  font-size: 18px;
  margin: 0;
}
.topbar__right {
  display: flex;
  align-items: center;
  gap: 14px;
}
.topbar__hello {
  font-size: var(--t-3);
  color: var(--el-text-color-secondary);
}
.avatar {
  display: inline-grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  color: #fff;
  font-weight: 700;
  cursor: pointer;
  box-shadow: var(--shadow-stamp);
}
.content {
  flex: 1;
  padding: var(--gutter);
  max-width: 1280px;
  width: 100%;
  margin: 0 auto;
  box-sizing: border-box;
}

@media (max-width: 767px) {
  .content {
    padding: 12px;
  }
  .topbar {
    padding: 0 12px;
  }
}
</style>