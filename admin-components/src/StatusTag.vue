<script setup lang="ts">
import { computed } from 'vue'
import type { StatusTagProps } from './types'

const props = withDefaults(defineProps<StatusTagProps>(), {
  map: () => ({}),
  fallbackLabel: '未知',
})

const resolved = computed(() => {
  const hit = props.map[props.status]
  return hit ?? { label: props.fallbackLabel, type: 'info' as const }
})
</script>

<template>
  <el-tag :type="resolved.type" effect="light" size="small">
    {{ resolved.label }}
  </el-tag>
</template>