<script setup lang="ts">
// 发布活动表单：新增活动（无编辑场景，但结构支持回填）
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { createActivity, getVenues } from '@/api'
import { ElMessage } from 'element-plus'
import type { Activity, Venue } from '@/types'

const router = useRouter()
const formRef = ref()
const saving = ref(false)
const venues = ref<Venue[]>([])

const form = reactive({
  title: '',
  category: '文体' as Activity['category'],
  organizer: '',
  venueId: '',
  capacity: 50,
  startTime: '',
  endTime: '',
  description: '',
})

const rules = {
  title: [{ required: true, message: '请输入活动标题', trigger: 'blur' }],
  category: [{ required: true, message: '请选择分类', trigger: 'change' }],
  organizer: [{ required: true, message: '请输入主办方', trigger: 'blur' }],
  venueId: [{ required: true, message: '请选择场地', trigger: 'change' }],
  startTime: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
  endTime: [{ required: true, message: '请选择结束时间', trigger: 'change' }],
}

const selectedVenue = computed(() => venues.value.find((v) => v.id === form.venueId))

async function loadVenues() {
  venues.value = await getVenues()
}

function goBack() {
  router.back()
}

async function submit() {
  saving.value = true
  try {
    // 校验纳入 try：validate() 失败同样 reject，避免 unhandled rejection
    await formRef.value.validate()
    await createActivity({
      ...form,
      venueName: selectedVenue.value?.name ?? '',
    })
    ElMessage.success('活动发布成功')
    router.replace('/activities')
  } catch {
    // 表单校验失败由行内提示呈现；请求错误已统一拦截
  } finally {
    saving.value = false
  }
}

onMounted(loadVenues)
</script>

<template>
  <div class="form-page">
    <div class="form-page__head">
      <el-button text :icon="'ArrowLeft'" @click="goBack">返回</el-button>
      <h2 class="form-page__title">发布活动</h2>
      <p class="form-page__sub">填写活动信息，提交后进入“报名中”。</p>
    </div>

    <div class="panel ticket">
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="96px"
        label-position="left"
        class="form"
      >
        <el-form-item label="活动标题" prop="title">
          <el-input v-model="form.title" placeholder="如：秋季草坪音乐节" maxlength="30" show-word-limit />
        </el-form-item>

        <el-row :gutter="16">
          <el-col :xs="24" :sm="12">
            <el-form-item label="活动分类" prop="category">
              <el-select v-model="form.category" class="full">
                <el-option v-for="c in ['文体', '讲座', '社团', '志愿', '竞赛', '其他']" :key="c" :label="c" :value="c" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="主办方" prop="organizer">
              <el-input v-model="form.organizer" placeholder="如：校学生会" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="活动场地" prop="venueId">
          <el-select v-model="form.venueId" placeholder="选择场地" class="full">
            <el-option
              v-for="v in venues"
              :key="v.id"
              :label="`${v.name}（容纳 ${v.capacity} 人）`"
              :value="v.id"
            />
          </el-select>
        </el-form-item>

        <el-row :gutter="16">
          <el-col :xs="24" :sm="12">
            <el-form-item label="开始时间" prop="startTime">
              <el-date-picker
                v-model="form.startTime"
                type="datetime"
                placeholder="选择开始时间"
                format="YYYY-MM-DD HH:mm"
                value-format="YYYY-MM-DD HH:mm"
                class="full"
              />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="结束时间" prop="endTime">
              <el-date-picker
                v-model="form.endTime"
                type="datetime"
                placeholder="选择结束时间"
                format="YYYY-MM-DD HH:mm"
                value-format="YYYY-MM-DD HH:mm"
                class="full"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="报名上限" prop="capacity">
          <el-input-number v-model="form.capacity" :min="1" :max="2000" />
          <span class="field-hint">人</span>
        </el-form-item>

        <el-form-item label="活动简介" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="3"
            maxlength="200"
            show-word-limit
            placeholder="一句话介绍这场活动，会展示在活动卡片上"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" :loading="saving" class="submit" @click="submit">
            发布活动
          </el-button>
          <el-button @click="goBack">取消</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<style scoped>
.form-page {
  max-width: 720px;
}
.form-page__head {
  margin-bottom: 16px;
}
.form-page__title {
  margin: 8px 0 2px;
  font-size: 22px;
}
.form-page__sub {
  margin: 0;
  color: var(--el-text-color-secondary);
  font-size: var(--t-3);
}
.panel {
  padding: 24px 28px;
}
.full {
  width: 100%;
}
.field-hint {
  margin-left: 8px;
  color: var(--el-text-color-secondary);
  font-size: var(--t-3);
}
.submit {
  box-shadow: var(--shadow-stamp);
}

@media (max-width: 640px) {
  .panel {
    padding: 16px 14px;
  }
}
</style>