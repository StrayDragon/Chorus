# 常见失败模式与恢复路径（Failure Modes）

这份文档列出你在使用 Chorus 时可能遇到的“看起来像 bug，但其实是设计使然/或有明确恢复路径”的场景。阅读它能让你在排查问题时更快定位到“应该看哪里”。

## 1) 页面没自动刷新 / 看板不更新

现象：

- 别人移动了 task，你这边 Kanban 没变

原因与落点：

- UI 的自动刷新依赖 SSE `/api/events`，由 `eventBus.emitChange` 触发
  - SSE route：`src/app/api/events/route.ts`
  - 事件总线：`src/lib/event-bus.ts`
- 如果 Redis 未启用，多实例部署时跨实例事件不会互通（只本进程）

恢复建议：

- 单机开发：刷新页面即可
- 多实例：确认 Redis 启用与连接（`REDIS_URL` 等配置），并确认 `eventBus.connect()` 成功

## 2) 移动 Kanban 列失败（尤其是 todo → in_progress）

常见原因：

- 任务被依赖阻塞（dependsOn 未完成）
- 验收门禁阻塞（Acceptance Criteria 未满足）
- 状态机不允许（非法迁移）

落点：

- 依赖阻塞：`TaskDependency` + UI `kanban-board.tsx` 的 blocker dialog
- 验收门禁：`AcceptanceCriterion` 计算 + `task.service.ts` 的 gate 校验
- 状态机：`TASK_STATUS_TRANSITIONS`

## 3) MCP Session Not Found (HTTP 404)

现象：

- MCP 请求返回：`Session not found. Please reinitialize.`

原因：

- `/api/mcp` 使用内存 Map 保存 session transport；服务重启会丢失所有 session。

落点：

- `src/app/api/mcp/route.ts`（找 `sessions = new Map` 与 404 分支）

恢复建议：

- 客户端捕获 404，自动重新初始化 session（`docs/MCP_TOOLS.md` 里也有说明）

## 4) Agent 无法启动 elaboration / 提交 proposal

常见原因：

- Idea 不是该 actor 认领的（assigneeUuid 不匹配）
- Idea status 不是 `elaborating`
- Proposal 校验失败（缺文档草稿、缺任务草稿、缺 acceptance criteria items、输入 idea 未 resolved）

落点：

- `src/services/elaboration.service.ts`：startElaboration 的前置校验
- `src/services/proposal.service.ts`：validateProposal（E1/E2/E3/E4/E5/E-AC 等）

## 5) 通知不弹/不推送

常见原因：

- 通知偏好被关闭（`NotificationPreference`）
- 事件没有产生 Activity（listener 无从生成通知）
- SSE `/api/events/notifications` 未建立/断开

落点：

- 偏好：`src/services/notification.service.ts`（getPreferences/update）
- 生成：`src/services/notification-listener.ts`
- SSE：`src/app/api/events/notifications/route.ts`

## 6) @mention 不生效

常见原因：

- 内容格式不符合：必须是 `@[Name](user:uuid)` 或 `@[Name](agent:uuid)`
- 超过 10 个 mentions（限流）
- mention 指向的 uuid 在本 company 不存在

落点：

- 解析：`src/services/mention.service.ts`（MENTION_REGEX, MAX_MENTIONS_PER_CONTENT）

