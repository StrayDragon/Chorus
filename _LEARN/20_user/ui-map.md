# UI 地图（App Router 信息架构）

这份文档把 `src/app/**` 的页面按“用户心智模型”重排成一个导航地图，方便你从体验倒推到代码位置。

## 1) Dashboard 区（主要工作区）

入口：`src/app/(dashboard)/layout.tsx`  
主要特征：

- 左侧侧边栏（项目上下文 + 导航）
- Global Search（Cmd+K）
- Pixel workspace widget（实时 agent 状态视觉化）
- RealtimeProvider / NotificationProvider（SSE 驱动的刷新与通知）

页面：

- Projects 列表：`/projects` → `src/app/(dashboard)/projects/page.tsx`
- 新建 Project：`/projects/new` → `src/app/(dashboard)/projects/new/page.tsx`
- Project Dashboard：`/projects/{uuid}/dashboard`
- Ideas：`/projects/{uuid}/ideas` 与详情 `/ideas/{ideaUuid}`
- Documents：`/projects/{uuid}/documents` 与详情 `/documents/{documentUuid}`
- Proposals：`/projects/{uuid}/proposals`、新建 `/proposals/new`、详情 `/proposals/{proposalUuid}`
- Tasks：`/projects/{uuid}/tasks` 与“面板模式”详情 `/tasks/{taskUuid}`
- Activity：`/projects/{uuid}/activity`
- Settings：`/settings`
- Project Groups：`/project-groups` 与详情 `/project-groups/{uuid}`

## 2) Admin 区（公司/租户管理）

入口：`src/app/admin/**`

- Company 列表、新建、详情：`/admin/companies*`
- Admin 登录：`/login/admin`

## 3) Login / Onboarding

- Login：`/login` + callback/silent-refresh
- Onboarding：`/onboarding`

## 4) Realtime 与通知（用户能感知到的“自动刷新”从哪来）

- 实体变更 SSE：`/api/events`（按 projectUuid 可过滤）
- 通知 SSE：`/api/events/notifications`（按 user/agent 身份订阅）

对应 Provider：

- `src/contexts/realtime-context.tsx`
- `src/contexts/notification-context.tsx`

