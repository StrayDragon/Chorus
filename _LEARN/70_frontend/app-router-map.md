# 前端入口地图（App Router / RSC / Server Actions）

Chorus 的前端主要在 `src/app/**`（App Router）与 `src/components/**`。整体风格是：

- 列表/详情页面用 Server Components（直接调用 service 读数据）
- 需要变更数据的操作用 Server Actions（`"use server"`），最终也调用 service
- Realtime 用 SSE 驱动 `router.refresh()`，尽量避免复杂的前端状态同步

## 1) Dashboard layout（所有项目页的“壳”）

- `src/app/(dashboard)/layout.tsx`
  - Sidebar + project selector
  - `RealtimeProvider`（仅在项目上下文生效）
  - `NotificationProvider` + `NotificationBell`
  - `GlobalSearch`（Cmd+K）
  - Pixel workspace widget（`PixelCanvasWidget`）

## 2) 项目页路由树（核心工作区）

> 实际页面文件列表可在 `_LEARN/99_codebase/src/app/README.md` 查看完整索引。

- `/projects`
  - `src/app/(dashboard)/projects/page.tsx`
- `/projects/new`
  - `src/app/(dashboard)/projects/new/page.tsx`
- `/projects/{projectUuid}/dashboard`
  - `src/app/(dashboard)/projects/[uuid]/dashboard/page.tsx`
- `/projects/{projectUuid}/ideas` + `/ideas/{ideaUuid}`
  - `src/app/(dashboard)/projects/[uuid]/ideas/*`
- `/projects/{projectUuid}/documents` + `/documents/{documentUuid}`
  - `src/app/(dashboard)/projects/[uuid]/documents/*`
- `/projects/{projectUuid}/proposals` + `/proposals/new` + `/proposals/{proposalUuid}`
  - `src/app/(dashboard)/projects/[uuid]/proposals/*`
- `/projects/{projectUuid}/tasks` + `/tasks/{taskUuid}`
  - `src/app/(dashboard)/projects/[uuid]/tasks/*`（Kanban/DAG/List + detail panel）
- `/projects/{projectUuid}/activity`
  - `src/app/(dashboard)/projects/[uuid]/activity/page.tsx`

## 3) Tasks 页的三视图结构（你读 UI 时的最佳切入点）

推荐阅读顺序：

1. `tasks-page-content.tsx`（Server Component：取数据 + 传给 client toggle）
2. `task-view-toggle.tsx`（Client：Kanban/DAG/List 切换 + panel URL）
3. `kanban-board.tsx`（DnD + optimistic update + blocker/gate dialogs）
4. `dag-view.tsx`（ReactFlow + dagre layout + connect add dependency）

关键 server actions：

- `tasks/actions.ts`
  - `moveTaskToColumnAction`：拖拽移动列（含依赖与验收门禁）
  - `getProjectDependenciesAction`：DAG 数据
- `tasks/[taskUuid]/dependency-actions.ts`
  - `addTaskDependencyAction` / `removeTaskDependencyAction`

## 4) 前端 Realtime 的消费方式

- Provider：`src/contexts/realtime-context.tsx`
  - EventSource 订阅 `/api/events?projectUuid=...`
  - throttle/debounce 后 `router.refresh()`
- Notifications：`src/contexts/notification-context.tsx`
  - EventSource 订阅 `/api/events/notifications`
  - 更新 `unreadCount`

