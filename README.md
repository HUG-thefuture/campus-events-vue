# 校园活动运营管理前端 · 简历项目

![CI](https://github.com/HUG-thefuture/campus-events-vue/actions/workflows/ci.yml/badge.svg)

本仓库是一个 **Monorepo** 简历项目，包含两个子工程：

| 目录 | 内容 | 说明 |
|------|------|------|
| `campus-events/` | **项目一**：校园活动运营管理前端 | 活动日历 / 报名 / 签到 / 场地预约 / 权限菜单 / 数据看板 |
| `admin-components/` | **项目二**：可复用后台组件库 | 搜索表单 / 分页表格 / 确认弹窗 / 状态标签 |

技术栈：**Vue 3 + Vite 5 + Element Plus + Vue Router + Pinia + Axios + ECharts**，Mock 用 `vite-plugin-mock` 纯本机实现，无需后端即可独立演示。

---

## 技术栈与依赖版本

| 依赖 | 版本 | 用途 |
|------|------|------|
| vue | ^3.5.12 | 框架 |
| vite | ^5.4.9 | 构建工具 |
| element-plus | ^2.8.4 | UI 组件库 |
| vue-router | ^4.4.5 | 路由 + 守卫 |
| pinia | ^2.2.4 | 状态管理 |
| axios | ^1.7.7 | 请求封装 |
| echarts | ^5.5.1 | 看板图表 |
| vite-plugin-mock | ^3.0.2 | 本地 Mock API |
| sass / typescript | latest | 语言/样式 |

> 版本号已写死在两个子工程各自的 `package.json` 中，任何有网机器执行 `pnpm install` 即可安装。本机环境 Node v24 / pnpm v11。

---

## 快速开始

```bash
# 1. 安装依赖（在仓库根目录）
pnpm install

# 2. 启动项目一（校园活动运营前端）
pnpm dev
# 打开 http://localhost:5173

# 3.（可选）另开终端启动项目二（组件库演示）
pnpm --filter @campus/admin-components dev
# 打开 http://localhost:5174
```

### 演示账号

| 用户名 | 密码 | 角色 | 权限 |
|--------|------|------|------|
| `admin` | `123456` | 超级管理员 | 全部菜单（含「发布活动」） |
| `operator` | `123456` | 运营成员 | 看板/活动/报名/签到/场地（**无「发布活动」**） |

> 用 `operator` 登录可直观看到「权限菜单 + 路由守卫」效果：侧栏不再显示发布活动，直接访问 `/activities/new` 会被重定向。

---

## 构建与静态部署

```bash
# 构建项目一
pnpm build
# 产物在 campus-events/dist/

# 本地预览构建产物
pnpm preview

# 构建项目二（组件库演示页，演示产物输出到 demo-dist）
# 建议进目录直接构建（pnpm 11 的 --filter 包装层偶发 deps-check 报错）
cd admin-components && pnpm build && cd ..
# 产物在 admin-components/demo-dist/
```

### 已知边界（2026-09 审计备注）
- 登录态 token/user 存于 localStorage（演示项目惯例）：XSS 场景下可被读取，且前端菜单权限仅作展示层控制。真实后端应改用 HttpOnly Cookie + 服务端鉴权，前端权限只做体验优化。

### 部署静态站点（本项目已用 hash 路由 + base:'./'）

`campus-events/vite.config.ts` 中已配置 `base: './'`，且路由使用 `createWebHashHistory`，因此构建产物是**纯静态**的，可部署到任意静态服务器，无需后端配置：

1. 上传 `campus-events/dist/` 到任意静态托管（Nginx / GitHub Pages / Vercel / Netlify 等）。
2. 无任何服务器重写规则要求（因为用 hash 路由，刷新任意页面不会 404）。

> 说明：`vite-plugin-mock` 仅在 `dev` 环境生效，`build` 产物不包含 Mock。若要给**部署后的静态站点**也提供数据演示，可在 `dist` 部署前把 `mock/data.ts` 的数据手工复制到前端作为回退（见下文「Mock 说明」）。

---

## 项目一功能清单（campus-events）

- **登录 + 权限菜单**：`Pinia(user)` 维护 token/用户/权限，路由 `beforeEach` 拦截未登录与越权访问；侧栏菜单按权限动态过滤。
- **活动日历**：卡片视图 + 按日期分组的日历网格视图，可切换。
- **活动列表/表单**：`ActivityCard` 组件（票根缺口 + 进度豆荚记忆点）、筛选（关键字/状态/分类）、发布活动表单（含表单校验）。
- **报名管理**：列表分页、状态筛选（待确认/已确认/已取消）、确认/取消操作。
- **签到管理**：签到记录列表 + 现场签到弹窗（扫码/人工渠道）。
- **场地预约**：场地卡片 + 预约记录 + 新建预约（含**时段冲突检测**提示）+ 审批（通过/驳回）。
- **数据看板**：4 个统计卡片 + 签到率豆荚 + ECharts 折线趋势图 + 分类环形图。
- **Axios 封装**：`src/utils/request.ts` 统一请求拦截（注入 token）、响应拦截（剥离业务外壳、401 统一登出、错误 ElMessage 提示）。
- **加载态 / 空状态 / 错误引导**：所有列表有 `v-loading`，表格有 `#empty` 空状态与提示文案，看板加载失败有 error 引导。
- **响应式**：桌面固定侧栏，<768px 折叠为抽屉；卡片/图表栅格自适应；移动端不横向溢出（已兜底 `overflow-x: clip`）。
- **可访问性**：`:focus-visible` 3px 陶土橙焦点环；`prefers-reduced-motion` 下关闭动效。

---

## 项目二组件库（admin-components）

四个组件全部用 **Props / Emit / Slots** 配置化，无耦合，可直接复用：

| 组件 | 说明 | 关键 API |
|------|------|----------|
| `SearchForm` | 搜索表单 | `fields` 声明式配置；`@search(model)` / `@reset`；`#actions` slot |
| `PagedTable` | 分页表格 | `columns`/`data`/`total`；`@update:page`/`@update:pageSize`；自定义列 `#col-{prop}` slot；内置空状态 |
| `ConfirmDialog` | 确认弹窗 | `ref.open(payload)` 打开；`@confirm(payload)` 回传上下文 |
| `StatusTag` | 状态标签 | `status` + `map`（状态→label/type 映射）+ `fallbackLabel` 兜底 |

演示页 `demo/DemoView.vue` 给出了**使用示例 + 边界状态**（空表格、未映射状态、删除确认）。

---

## Mock 说明

- Mock 文件在 `campus-events/mock/`：`data.ts`（造数据）→ `index.ts`（vite-plugin-mock 适配层）。
- `vite.config.ts` 中 `viteMockServe({ mockPath: 'mock', enable: true })` 启动时自动拦截 `/api/*` 请求。
- 报名状态、签到、预约、活动等数据为**内存态可变**，session 内增删改生效，重启 dev 后重置。
- 若网络受限无法安装 `vite-plugin-mock`：项目已把 `mock/data.ts` 的数据与 `src/` 解耦，可写一个 `src/api/index.ts` 的纯前端回退（导出同名函数返回 `data.ts` 数据）替换 `request`，结构不变。

---

## 目录结构

```
project/
├── package.json               # workspace 根（pnpm-workspace）
├── pnpm-workspace.yaml
├── campus-events/             # 项目一
│   ├── vite.config.ts
│   ├── index.html
│   ├── mock/                  # Mock 数据层
│   │   ├── data.ts
│   │   └── index.ts
│   └── src/
│       ├── main.ts
│       ├── App.vue
│       ├── api/index.ts       # 业务 API + axios 封装
│       ├── utils/request.ts
│       ├── types/index.ts
│       ├── stores/            # Pinia
│       │   ├── user.ts
│       │   └── activity.ts
│       ├── router/index.ts    # 路由 + 守卫
│       ├── layout/MainLayout.vue
│       ├── components/ActivityCard.vue
│       ├── styles/            # tokens.css + components.css
│       └── views/             # Login/Dashboard/Activities/ActivityForm/
│                              #   Enrollments/Checkins/Venues/NotFound
└── admin-components/          # 项目二
    ├── vite.config.ts
    ├── index.html
    ├── src/
    │   ├── index.ts           # 组件库入口
    │   ├── types.ts
    │   ├── SearchForm.vue
    │   ├── PagedTable.vue
    │   ├── ConfirmDialog.vue
    │   └── StatusTag.vue
    └── demo/                  # 演示页 DemoView.vue + main.ts
```

---

## 产品视角（面试可讲）

- **目标用户**：校园活动运营者（发布/审批）与普通学生（报名/签到）。
- **解决的问题**：活动报名、场地预约、数据统计分散在表单和群接龙里。
- **核心场景**：日历查看→报名→审批（角色差异）→数据看板；mock 模式离线可完整演示。
- **成功指标（实测）**：vue-tsc 0 错、构建通过、浏览器实测；权限菜单差异可现场演示。
- **未来计划**：vitest 组件测试；真实后端联调（接口契约已就绪）；组件库（admin-components）发布 npm 包。
