<script setup lang="ts">
import { ref, watch } from 'vue'
import type { SearchFormProps, SearchFormEmits, SearchField } from './types'

const props = withDefaults(defineProps<SearchFormProps>(), {
  showReset: true,
  showSearch: true,
  labelWidth: '80px',
})

const emit = defineEmits<SearchFormEmits>()

// 基于字段配置初始化 model（含 defaultValue）
function buildModel(fields: SearchField[]) {
  const m: Record<string, unknown> = {}
  for (const f of fields) {
    m[f.prop] = f.defaultValue ?? ''
  }
  return m
}

const model = ref<Record<string, unknown>>(buildModel(props.fields))

watch(
  () => props.fields,
  (fields) => {
    model.value = buildModel(fields)
  },
  { deep: true },
)

function doSearch() {
  emit('search', { ...model.value })
}
function doReset() {
  model.value = buildModel(props.fields)
  emit('reset')
}
</script>

<template>
  <el-form class="search-form" :label-width="props.labelWidth" inline @submit.prevent="doSearch">
    <el-form-item v-for="f in props.fields" :key="f.prop" :label="f.label">
      <el-input
        v-if="!f.type || f.type === 'input'"
        v-model="model[f.prop] as string"
        :placeholder="f.placeholder || `请输入${f.label}`"
        clearable
        @keyup.enter="doSearch"
      />
      <el-select
        v-else-if="f.type === 'select'"
        v-model="model[f.prop]"
        :placeholder="f.placeholder || `请选择${f.label}`"
        clearable
      >
        <el-option v-for="o in f.options" :key="String(o.value)" :label="o.label" :value="o.value" />
      </el-select>
      <el-date-picker
        v-else-if="f.type === 'date'"
        v-model="model[f.prop]"
        type="date"
        value-format="YYYY-MM-DD"
        :placeholder="f.placeholder || `选择${f.label}`"
      />
      <el-date-picker
        v-else-if="f.type === 'daterange'"
        v-model="model[f.prop]"
        type="daterange"
        value-format="YYYY-MM-DD"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
      />
    </el-form-item>

    <el-form-item v-if="props.showSearch || props.showReset" class="search-form__actions">
      <slot name="actions" :search="doSearch" :reset="doReset" :model="model">
        <el-button v-if="props.showSearch" type="primary" native-type="submit" @click="doSearch">
          查询
        </el-button>
        <el-button v-if="props.showReset" @click="doReset">重置</el-button>
      </slot>
    </el-form-item>
  </el-form>
</template>

<style scoped>
.search-form {
  display: flex;
  flex-wrap: wrap;
  gap: 0 12px;
}
.search-form__actions {
  margin-left: auto;
}
@media (max-width: 640px) {
  .search-form__actions {
    margin-left: 0;
  }
}
</style>