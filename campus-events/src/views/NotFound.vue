<script setup lang="ts">
import { useRouter } from 'vue-router'
const router = useRouter()
</script>

<template>
  <div class="not-found">
    <div class="box ticket stamp">
      <span class="code u-mono">404</span>
      <h2>页面走丢了</h2>
      <p>你访问的地址不存在，可能已被移动或删除。</p>
      <el-button type="primary" @click="router.replace('/dashboard')">回到看板</el-button>
    </div>
  </div>
</template>

<style scoped>
.not-found {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: var(--gutter);
}
.box {
  text-align: center;
  padding: 48px 40px;
  background: var(--el-bg-color);
}
.code {
  font-size: 64px;
  font-weight: 700;
  color: var(--c-clay);
  line-height: 1;
}
h2 {
  margin: 12px 0 4px;
}
p {
  color: var(--el-text-color-secondary);
  margin: 0 0 20px;
}
</style>