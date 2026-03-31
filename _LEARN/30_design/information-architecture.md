# 信息架构与交互导航（Design View）

Chorus 的 UI 不是“单纯的 CRUD 列表”，它围绕 AI-DLC 的流程与可观测性组织信息：你需要在同一时间看到“工作项、状态、依赖、执行者、审计与通知”。这份文档从信息架构角度解释它为什么这么长，以及它如何映射到路由结构与组件。

## 1) 全局层 vs 项目层

在 `src/app/(dashboard)/layout.tsx` 中，导航被分为两类：

- **全局页**：`/projects`、`/projects/new`、`/settings`、`/project-groups/**`  
  特点：没有单一 projectUuid 上下文。
- **项目页**：`/projects/{uuid}/...`  
  特点：页面被 `RealtimeProvider(projectUuid)` 包裹，具备 SSE 驱动的自动刷新能力。

这也解释了为什么 Global Search 默认 scope 会随当前 URL 自动变化：

- 项目内：默认 `scope=project`
- project group 内：默认 `scope=group`
- 其它：默认 `scope=global`

落点：

- UI：`src/components/global-search.tsx`（`scope` 初始化逻辑）
- API：`src/app/api/search/route.ts`（scope/scopeUuid 校验）
- Service：`src/services/search.service.ts`（resolve group projects + 分实体检索）

## 2) “面板式详情”是为了减少上下文跳转

Tasks 使用“列表 + 右侧详情面板”的交互（并用 URL 表达面板状态）：

- 列表页：`/projects/{uuid}/tasks`
- 面板打开：`/projects/{uuid}/tasks/{taskUuid}`

对应代码：

- `src/app/(dashboard)/projects/[uuid]/tasks/page.tsx`
- `src/app/(dashboard)/projects/[uuid]/tasks/[taskUuid]/page.tsx`
- `src/app/(dashboard)/projects/[uuid]/tasks/tasks-page-content.tsx`

这类设计的好处是：

- 分享 URL 即可定位到“打开哪个任务面板”
- 浏览任务列表时不会丢失上下文

## 3) 同一实体的多种视图（Kanban / DAG / List）

Task 支持三种视图，分别满足不同心智模型：

- Kanban：按状态列（最适合“推进流程”）
- DAG：按依赖关系（最适合“规划顺序与并行”）
- List：移动端/快速浏览（最适合“轻量筛选与打开面板”）

落点：

- `src/app/(dashboard)/projects/[uuid]/tasks/task-view-toggle.tsx`
- `src/app/(dashboard)/projects/[uuid]/tasks/kanban-board.tsx`
- `src/app/(dashboard)/projects/[uuid]/tasks/dag-view.tsx`（`@xyflow/react` + `dagre` 布局）

## 4) Cmd+K 搜索不是“锦上添花”，而是跨实体协作的必需品

AI-DLC 会产生多个实体类型（Idea/Proposal/Doc/Task），且需要在讨论/审计时快速跳转。Global Search 的设计要点：

- Scope：global/group/project（避免“结果太多”）
- 类型过滤：all/task/idea/proposal/document/project（避免“跨类型噪音”）
- Snippet：只展示命中附近片段（降低信息负担）

落点：

- UI：`src/components/global-search.tsx`（debounce + keyboard navigation）
- Service：`src/services/search.service.ts`（snippet 生成）

