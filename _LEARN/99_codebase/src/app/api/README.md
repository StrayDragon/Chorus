# `src/app/api/` 文件级索引（HTTP APIs）

这里是 Chorus 的 REST API 与 SSE/MCP endpoints。多数 route.ts 都遵循：

- `withErrorHandler(...)` 包装
- `getAuthContext(request)` 获取 auth（user/agent/super_admin）
- 调用 `src/services/**` 完成业务
- 用 `success/errors.*` 返回统一格式

学习版 API 约定：`_LEARN/60_backend/api-conventions.md`

## 1) Realtime / MCP（关键入口）

- SSE change stream：`src/app/api/events/route.ts`
- SSE notification stream：`src/app/api/events/notifications/route.ts`
- MCP endpoint：`src/app/api/mcp/route.ts`

## 2) 路由分组（按业务域）

### Admin

- `src/app/api/admin/login/route.ts`
- `src/app/api/admin/session/route.ts`
- `src/app/api/admin/companies/route.ts`
- `src/app/api/admin/companies/[uuid]/route.ts`

### Auth

- `src/app/api/auth/identify/route.ts`：邮箱识别（super_admin / default_auth / oidc / not_found）
- `src/app/api/auth/default-login/route.ts`：default auth 登录（写 `user_session` cookie）
- `src/app/api/auth/callback/route.ts`：OIDC 回调（注册用户 + 写 OIDC cookies）
- `src/app/api/auth/session/route.ts` / `me/route.ts` / `logout/route.ts` / `refresh/route.ts` / `sync-token/route.ts` / `check-default/route.ts`

### Projects / Groups

- `src/app/api/projects/route.ts`
- `src/app/api/projects/[uuid]/route.ts`
- `src/app/api/project-groups/route.ts`
- `src/app/api/project-groups/[uuid]/route.ts`
- `src/app/api/project-groups/[uuid]/dashboard/route.ts`

以及项目内聚合：

- `src/app/api/projects/[uuid]/ideas/route.ts`
- `src/app/api/projects/[uuid]/tasks/route.ts`
- `src/app/api/projects/[uuid]/documents/route.ts`
- `src/app/api/projects/[uuid]/proposals/route.ts`
- `src/app/api/projects/[uuid]/activity/route.ts`
- `src/app/api/projects/[uuid]/available/route.ts`（可领取项）
- `src/app/api/projects/[uuid]/group/route.ts`（项目组相关）

### Ideas

- `src/app/api/ideas/[uuid]/route.ts`
- `src/app/api/ideas/[uuid]/claim/route.ts`
- `src/app/api/ideas/[uuid]/release/route.ts`
- `src/app/api/ideas/[uuid]/move/route.ts`

### Tasks + DAG

- `src/app/api/tasks/[uuid]/route.ts`（detail/update/delete）
- `src/app/api/tasks/[uuid]/claim/route.ts` / `release/route.ts`
- `src/app/api/tasks/[uuid]/dependencies/route.ts`
- `src/app/api/tasks/[uuid]/dependencies/[dependsOnUuid]/route.ts`
- `src/app/api/tasks/[uuid]/sessions/route.ts`（task 的 active sessions/worker 信息）
- `src/app/api/projects/[uuid]/tasks/dependencies/route.ts`（项目 DAG 数据）

### Proposals

- `src/app/api/projects/[uuid]/proposals/summary/route.ts`
- `src/app/api/projects/[uuid]/proposals/[proposalUuid]/validate/route.ts`
- `src/app/api/proposals/[uuid]/route.ts`
- `src/app/api/proposals/[uuid]/approve/route.ts`
- `src/app/api/proposals/[uuid]/reject/route.ts`
- `src/app/api/proposals/[uuid]/close/route.ts`

### Documents / Comments

- `src/app/api/documents/[uuid]/route.ts`
- `src/app/api/comments/route.ts`

### Notifications

- `src/app/api/notifications/route.ts`
- `src/app/api/notifications/read-all/route.ts`
- `src/app/api/notifications/unread-count/route.ts`
- `src/app/api/notifications/preferences/route.ts`
- `src/app/api/notifications/[uuid]/read/route.ts`
- `src/app/api/notifications/[uuid]/archive/route.ts`

附带设计文档：

- `src/app/api/notifications/README.md`

### Mentionables / Search

- `src/app/api/mentionables/route.ts`（供 mention editor 搜索用户/agent）
- `src/app/api/search/route.ts`（统一搜索）

附带设计文档：

- `src/app/api/mentionables/README.md`

### Agents / API Keys / Sessions / Me

- `src/app/api/agents/route.ts`、`src/app/api/agents/[uuid]/route.ts`
- `src/app/api/api-keys/route.ts`、`src/app/api/api-keys/[uuid]/route.ts`
- `src/app/api/sessions/[uuid]/route.ts`
- `src/app/api/me/assignments/route.ts`

### Health

- `src/app/api/health/route.ts`

## 3) 完整文件列表

```text
src/app/api/__tests__/proposals-summary-route.test.ts
src/app/api/__tests__/tasks-route.test.ts
src/app/api/admin/companies/[uuid]/route.ts
src/app/api/admin/companies/route.ts
src/app/api/admin/login/route.ts
src/app/api/admin/session/route.ts
src/app/api/agents/[uuid]/route.ts
src/app/api/agents/[uuid]/sessions/route.ts
src/app/api/agents/route.ts
src/app/api/api-keys/[uuid]/route.ts
src/app/api/api-keys/route.ts
src/app/api/auth/callback/route.ts
src/app/api/auth/check-default/route.ts
src/app/api/auth/default-login/route.ts
src/app/api/auth/identify/route.ts
src/app/api/auth/logout/route.ts
src/app/api/auth/me/route.ts
src/app/api/auth/refresh/route.ts
src/app/api/auth/session/route.ts
src/app/api/auth/sync-token/route.ts
src/app/api/comments/route.ts
src/app/api/documents/[uuid]/route.ts
src/app/api/events/notifications/route.ts
src/app/api/events/route.ts
src/app/api/health/route.ts
src/app/api/ideas/[uuid]/claim/route.ts
src/app/api/ideas/[uuid]/move/route.ts
src/app/api/ideas/[uuid]/release/route.ts
src/app/api/ideas/[uuid]/route.ts
src/app/api/mcp/__tests__/route.test.ts
src/app/api/mcp/route.ts
src/app/api/me/assignments/route.ts
src/app/api/mentionables/README.md
src/app/api/mentionables/route.ts
src/app/api/notifications/README.md
src/app/api/notifications/[uuid]/archive/route.ts
src/app/api/notifications/[uuid]/read/route.ts
src/app/api/notifications/preferences/route.ts
src/app/api/notifications/read-all/route.ts
src/app/api/notifications/route.ts
src/app/api/notifications/unread-count/route.ts
src/app/api/project-groups/[uuid]/dashboard/route.ts
src/app/api/project-groups/[uuid]/route.ts
src/app/api/project-groups/route.ts
src/app/api/projects/[uuid]/activity/route.ts
src/app/api/projects/[uuid]/available/route.ts
src/app/api/projects/[uuid]/documents/route.ts
src/app/api/projects/[uuid]/group/route.ts
src/app/api/projects/[uuid]/ideas/route.ts
src/app/api/projects/[uuid]/proposals/[proposalUuid]/validate/route.ts
src/app/api/projects/[uuid]/proposals/route.ts
src/app/api/projects/[uuid]/proposals/summary/route.ts
src/app/api/projects/[uuid]/route.ts
src/app/api/projects/[uuid]/tasks/dependencies/route.ts
src/app/api/projects/[uuid]/tasks/route.ts
src/app/api/projects/route.ts
src/app/api/proposals/[uuid]/approve/route.ts
src/app/api/proposals/[uuid]/close/route.ts
src/app/api/proposals/[uuid]/reject/route.ts
src/app/api/proposals/[uuid]/route.ts
src/app/api/search/route.ts
src/app/api/sessions/[uuid]/route.ts
src/app/api/tasks/[uuid]/claim/route.ts
src/app/api/tasks/[uuid]/dependencies/[dependsOnUuid]/route.ts
src/app/api/tasks/[uuid]/dependencies/route.ts
src/app/api/tasks/[uuid]/release/route.ts
src/app/api/tasks/[uuid]/route.ts
src/app/api/tasks/[uuid]/sessions/route.ts
```

