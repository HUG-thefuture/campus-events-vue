import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// admin-components 独立演示工程配置
export default defineConfig({
  base: './',
  plugins: [vue()],
  root: '.',
  server: {
    port: 5174,
    host: true,
  },
  build: {
    outDir: 'demo-dist',
  },
})