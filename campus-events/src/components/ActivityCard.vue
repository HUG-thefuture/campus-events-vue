<script setup lang="ts">
// 活动卡片：展示「票根缺口 + 进度豆荚」记忆点
import { computed } from 'vue'
import type { Activity } from '@/types'

const props = defineProps<{ activity: Activity; progress: number }>()
defineEmits<{ (e: 'click', activity: Activity): void }>()

// 票根色相：海报/票根主色随活动 posterHue 变化（mock 按分类取色）
const ticketStyle = computed(() => ({
  '--ticket-hue': String(props.activity.posterHue ?? 152),
}))

const statusClass: Record<string, string> = {
  draft: '',
  open: 'pod--active',
  ongoing: 'pod--moss',
  closed: '',
}
const statusText: Record<string, string> = {
  draft: '草稿',
  open: '报名中',
  ongoing: '进行中',
  closed: '已结束',
}
</script>

<template>
  <article class="card ticket stamp" :style="ticketStyle" @click="$emit('click', props.activity)">
    <!-- 顶部：类别 + 状态 -->
    <div class="card__head">
      <span class="card__cat">{{ props.activity.category }}</span>
      <span class="pod" :class="statusClass[props.activity.status]">
        {{ statusText[props.activity.status] }}
      </span>
    </div>

    <!-- 标题 -->
    <h3 class="card__title">{{ props.activity.title }}</h3>
    <p class="card__desc">{{ props.activity.description }}</p>

    <!-- 时间 / 场地元信息 -->
    <div class="card__meta">
      <span class="u-mono">{{ props.activity.startTime }}</span>
      <span class="card__venue">{{ props.activity.venueName }}</span>
    </div>

    <!-- 进度豆荚（记忆点） -->
    <div class="card__progress">
      <div class="pod pod--active">
        {{ props.activity.enrolled }} / {{ props.activity.capacity }}
      </div>
      <div class="bar">
        <div class="bar__fill" :style="{ width: props.progress + '%' }"></div>
      </div>
      <span class="u-mono bar__value">{{ props.progress }}%</span>
    </div>
  </article>
</template>

<style scoped>
.card {
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 18px;
  /* 票根顶边：使用活动自身色相（hsl），与整体纸墨青风格融合 */
  border-top: 3px solid hsl(var(--ticket-hue), 45%, 58%);
}
.card__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.card__cat {
  font-size: var(--t-4);
  color: hsl(var(--ticket-hue), 38%, 36%);
  font-weight: 700;
  border: 1px solid hsl(var(--ticket-hue), 45%, 64%);
  background: hsl(var(--ticket-hue), 60%, 96%);
  padding: 2px 8px;
  border-radius: var(--radius-sm);
}
.card__title {
  margin: 0;
  font-size: 17px;
  line-height: 1.35;
}
.card__desc {
  margin: 0;
  font-size: var(--t-3);
  color: var(--el-text-color-secondary);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.card__meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: var(--t-4);
  color: var(--el-text-color-secondary);
}
.card__venue {
  color: var(--el-text-color-regular);
}
.card__progress {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 2px;
}
.bar {
  flex: 1;
  height: 8px;
  border-radius: 999px;
  background: var(--el-fill-color-light);
  overflow: hidden;
}
.bar__fill {
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, hsl(var(--ticket-hue), 45%, 55%), var(--c-clay));
}
.bar__value {
  font-size: var(--t-4);
  color: var(--c-clay);
  font-weight: 700;
}
</style>