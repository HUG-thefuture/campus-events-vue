// Vue SFC 模块声明：让 tsc/vue-tsc 识别 .vue 单文件组件的默认导出
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const component: DefineComponent<Record<string, never>, Record<string, never>, any>
  export default component
}

export {}
