<script setup lang="ts">
// 数据看板：统计卡片 + 报名趋势折线 + 分类环形图（echarts）
import { ref, onMounted, onBeforeUnmount, computed, nextTick } from 'vue'
import * as echarts from 'echarts'
import { getDashboard } from '@/api'
import type { DashboardStats } from '@/types'

const loading = ref(true)
const error = ref(false)
const stats = ref<DashboardStats | null>(null)

const trendRef = ref<HTMLElement>()
const catRef = ref<HTMLElement>()
let trendChart: echarts.ECharts | null = null
let catChart: echarts.ECharts | null = null

const statCards = computed(() => [
  { label: '在管活动', value: stats.value?.totalActivities ?? 0, unit: '场' },
  { label: '累计报名', value: stats.value?.totalEnrollments ?? 0, unit: '人次' },
  { label: '已完成签到', value: stats.value?.totalCheckins ?? 0, unit: '人次' },
  { label: '可预约场地', value: stats.value?.totalVenues ?? 0, unit: '间' },
])

function rgb(hex: string, a: number) {
  const n = parseInt(hex.slice(1), 16)
  const r = (n >> 16) & 255
  const g = (n >> 8) & 255
  const b = n & 255
  return `rgba(${r}, ${g}, ${b}, ${a})`
}

function renderTrend() {
  if (!trendRef.value || !stats.value) return
  trendChart = echarts.init(trendRef.value)
  const d = stats.value.trend
  trendChart.setOption({
    tooltip: { trigger: 'axis' },
    legend: { data: ['活动数', '报名数'], bottom: 0 },
    grid: { left: 40, right: 16, top: 16, bottom: 36 },
    xAxis: { type: 'category', data: d.map((x) => x.date), axisLine: { lineStyle: { color: '#d8d0bd' } } },
    yAxis: { type: 'value', splitLine: { lineStyle: { color: '#ece7da' } } },
    series: [
      {
        name: '活动数',
        type: 'line',
        smooth: true,
        data: d.map((x) => x.activities),
        lineStyle: { color: '#1f6f54', width: 3 },
        itemStyle: { color: '#1f6f54' },
        areaStyle: { color: rgb('#1f6f54', 0.12) },
      },
      {
        name: '报名数',
        type: 'line',
        smooth: true,
        data: d.map((x) => x.enrollments),
        lineStyle: { color: '#e07a3f', width: 3 },
        itemStyle: { color: '#e07a3f' },
        areaStyle: { color: rgb('#e07a3f', 0.10) },
      },
    ],
  })
}

function renderCategory() {
  if (!catRef.value || !stats.value) return
  catChart = echarts.init(catRef.value)
  catChart.setOption({
    tooltip: { trigger: 'item' },
    legend: { orient: 'vertical', right: 8, top: 'center' },
    series: [
      {
        type: 'pie',
        radius: ['45%', '72%'],
        center: ['38%', '50%'],
        avoidLabelOverlap: true,
        label: { show: false },
        itemStyle: { borderColor: '#f4efe3', borderWidth: 3 },
        data: stats.value.categoryDist.map((c, i) => ({
          ...c,
          itemStyle: { color: ['#1f6f54', '#4f9d7d', '#e07a3f', '#d99a2b', '#3d6b8a', '#7a7265'][i % 6] },
        })),
      },
    ],
  })
}

async function load() {
  loading.value = true
  error.value = false
  try {
    stats.value = await getDashboard()
    await nextTick() // 等待 DOM 渲染后再初始化图表
    renderTrend()
    renderCategory()
  } catch {
    error.value = true
  } finally {
    loading.value = false
  }
}

function resize() {
  trendChart?.resize()
  catChart?.resize()
}

onMounted(() => {
  load()
  window.addEventListener('resize', resize)
})
onBeforeUnmount(() => {
  window.removeEventListener('resize', resize)
  trendChart?.dispose()
  catChart?.dispose()
})
</script>

<template>
  <div v-loading="loading">
    <template v-if="error">
      <el-alert
        title="看板数据加载失败"
        description="Mock 服务未响应，请确认 dev 服务已启动后刷新重试。"
        type="error"
        show-icon
        :closable="false"
      />
    </template>

    <template v-else-if="stats">
      <!-- 统计卡片 -->
      <div class="stats">
        <div v-for="c in statCards" :key="c.label" class="stat ticket stamp">
          <span class="stat-label">{{ c.label }}</span>
          <span class="stat-num">{{ c.value }}<small class="stat-unit">{{ c.unit }}</small></span>
        </div>
      </div>

      <!-- 签到率胶囊 -->
      <div class="rate-row">
        <span class="pod pod--active">签到率 {{ Math.round((stats.signRate ?? 0) * 100) }}%</span>
        <span class="pod">报名转化 · 近 7 天</span>
      </div>

      <!-- 图表 -->
      <div class="charts">
        <div class="chart-card ticket stamp">
          <h3>报名 / 活动趋势</h3>
          <div ref="trendRef" class="chart"></div>
        </div>
        <div class="chart-card ticket stamp">
          <h3>活动分类分布</h3>
          <div ref="catRef" class="chart"></div>
        </div>
      </div>
    </template>

    <el-empty v-else description="暂无数据" />
  </div>
</template>

<style scoped>
.stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
}
.stat {
  padding: 18px 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.stat-unit {
  font-size: var(--t-3);
  color: var(--el-text-color-secondary);
  margin-left: 4px;
  font-family: var(--f-sans);
}
.rate-row {
  display: flex;
  gap: 12px;
  margin: 18px 0;
  flex-wrap: wrap;
}
.charts {
  display: grid;
  grid-template-columns: 3fr 2fr;
  gap: 16px;
}
.chart-card {
  padding: 18px;
}
.chart-card h3 {
  margin: 0 0 12px;
  font-size: 15px;
}
.chart {
  height: 300px;
  width: 100%;
}

@media (max-width: 767px) {
  .charts {
    grid-template-columns: 1fr;
  }
  .chart {
    height: 260px;
  }
}
</style>