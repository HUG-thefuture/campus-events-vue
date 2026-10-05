<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const formRef = ref()
const loading = ref(false)
const form = reactive({
  username: 'admin',
  password: '123456',
})

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
}

async function submit() {
  loading.value = true
  try {
    // 校验纳入 try：validate() 失败同样 reject，避免 unhandled rejection
    await formRef.value.validate()
    await userStore.login(form.username, form.password)
    ElMessage.success('登录成功，欢迎回来')
    const redirect = (route.query.redirect as string) || '/dashboard'
    router.replace(redirect)
  } catch {
    // 表单校验失败由行内提示呈现；登录错误提示已在 axios 拦截器统一处理
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login">
    <div class="login__panel ticket stamp">
      <div class="login__brand">
        <span class="brand__mark">青</span>
        <h1>青禾 · 校园活动运营中心</h1>
        <p>A single place to run campus life.</p>
      </div>

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-position="top"
        size="large"
        @submit.prevent="submit"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" placeholder="admin / operator">
            <template #prefix><el-icon><User /></el-icon></template>
          </el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input
            v-model="form.password"
            type="password"
            show-password
            placeholder="123456"
          >
            <template #prefix><el-icon><Lock /></el-icon></template>
          </el-input>
        </el-form-item>

        <el-button
          type="primary"
          size="large"
          class="login__btn"
          :loading="loading"
          native-type="submit"
        >
          进入运营中心
        </el-button>
      </el-form>

      <div class="login__hint">
        <p class="u-mono">演示账号</p>
        <p>admin / 123456 —— 全部权限（超级管理员）</p>
        <p>operator / 123456 —— 运营成员（无“发布活动”权限）</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: var(--gutter);
  background:
    radial-gradient(circle at 20% 15%, rgba(31, 111, 84, 0.18), transparent 45%),
    radial-gradient(circle at 85% 80%, rgba(224, 122, 63, 0.16), transparent 45%),
    var(--c-paper);
}
.login__panel {
  width: 100%;
  max-width: 400px;
  padding: 32px 30px;
  background: var(--el-bg-color);
}
.login__brand {
  text-align: center;
  margin-bottom: 24px;
}
.login__brand .brand__mark {
  display: inline-grid;
  place-items: center;
  width: 52px;
  height: 52px;
  border-radius: 14px;
  background: var(--c-moss);
  color: #fff;
  font-family: var(--f-serif);
  font-size: 28px;
  font-weight: 700;
  box-shadow: var(--shadow-stamp-lg);
}
.login__brand h1 {
  font-size: 22px;
  margin: 14px 0 4px;
}
.login__brand p {
  margin: 0;
  font-size: var(--t-3);
  color: var(--el-text-color-secondary);
}
.login__btn {
  width: 100%;
  margin-top: 4px;
  box-shadow: var(--shadow-stamp);
}
.login__hint {
  margin-top: 22px;
  padding: 14px 16px;
  background: var(--el-fill-color-light);
  border-radius: var(--radius-sm);
  font-size: var(--t-4);
  color: var(--el-text-color-secondary);
}
.login__hint p {
  margin: 4px 0;
}
.login__hint .u-mono {
  color: var(--c-clay);
  font-weight: 700;
  margin-bottom: 6px;
}

@media (max-width: 480px) {
  .login__panel {
    padding: 24px 18px;
  }
}
</style>