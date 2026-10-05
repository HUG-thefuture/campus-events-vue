<script setup lang="ts">
import { ref, watch } from 'vue'
import { Warning } from '@element-plus/icons-vue'
import type { ConfirmDialogProps, ConfirmDialogEmits } from './types'

const props = withDefaults(defineProps<ConfirmDialogProps>(), {
  title: '确认操作',
  content: '确定要执行此操作吗？',
  confirmText: '确定',
  cancelText: '取消',
  type: 'warning',
})

const emit = defineEmits<ConfirmDialogEmits>()

const visible = ref(false)
// 携带调用方上下文，确认/取消时原样回传
const payload = ref<unknown>(null)
// 标记本次关闭已由 confirm/cancel 显式发出事件，watch 中不再重复发 cancel
const settled = ref(false)

/** 外部通过 ref 调用 open(data?) 打开弹窗 */
function open(data?: unknown) {
  payload.value = data
  settled.value = false
  visible.value = true
}

// 通过 defineExpose 暴露 open，供父组件使用
defineExpose({ open })

// ESC / 右上角 X 等未被 onCancel 捕获的关闭，统一视为取消
watch(visible, (v) => {
  if (!v) {
    if (!settled.value) emit('cancel')
    settled.value = false
  }
})

function onConfirm() {
  settled.value = true
  emit('confirm', payload.value)
  visible.value = false
}
function onCancel() {
  settled.value = true
  emit('cancel')
  visible.value = false
}
</script>

<template>
  <el-dialog
    v-model="visible"
    :title="props.title"
    width="380px"
    :close-on-click-modal="false"
    append-to-body
  >
    <div class="confirm-body">
      <el-icon :size="22" class="confirm-body__icon" :class="`is-${props.type}`"><Warning /></el-icon>
      <p class="confirm-body__content">{{ props.content }}</p>
    </div>
    <template #footer>
      <el-button @click="onCancel">{{ props.cancelText }}</el-button>
      <el-button
        :type="props.type === 'danger' ? 'danger' : 'primary'"
        @click="onConfirm"
      >
        {{ props.confirmText }}
      </el-button>
    </template>
  </el-dialog>
</template>

<style scoped>
.confirm-body {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 4px 0;
}
.confirm-body__icon {
  color: var(--el-color-warning);
  flex-shrink: 0;
  margin-top: 2px;
}
.confirm-body__icon.is-info { color: var(--el-color-info); }
.confirm-body__icon.is-danger { color: var(--el-color-danger); }
.confirm-body__content {
  margin: 0;
  color: var(--el-text-color-regular);
  line-height: 1.6;
}
</style>