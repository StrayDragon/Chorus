# 工具目录（Tool Catalog）与实现落点

> Canonical 文档：`docs/MCP_TOOLS.md`（完整参数与输出格式）  
> 本文重点：**每组工具在代码里在哪里实现，以及它们主要调用哪些 services。**

## 1) Public Tools（所有角色都有）

实现文件：`src/mcp/tools/public.ts`

主要覆盖：

- Projects/Groups：list/get
  - service：`project.service.ts`、`project-group.service.ts`
- Ideas/Documents/Tasks/Proposals：list/get
  - service：`idea.service.ts`、`document.service.ts`、`task.service.ts`、`proposal.service.ts`
- Activity/Comments：查询与写入
  - service：`activity.service.ts`、`comment.service.ts`
- Assignments：`chorus_get_my_assignments` 等
  - service：`assignment.service.ts`
- Notifications：unread count / list / mark read
  - service：`notification.service.ts`
- Elaboration：查询/协作
  - service：`elaboration.service.ts`
- Mentionables/Search：辅助工具
  - service：`mention.service.ts`、`search.service.ts`

代表性工具（建议先理解）：

- `chorus_checkin`：更新 agent lastActiveAt，返回 persona、assignments、unreadCount  
  - 关键逻辑：默认 persona 生成、owner 首次 checkin 通知（`emitAgentCheckinIfFirst`）
- `chorus_search`：跨 6 类实体的统一搜索（scope + snippet）

## 2) Session Tools（所有角色都有）

实现文件：`src/mcp/tools/session.ts`

覆盖：

- create/reopen/close session
- checkin/checkout task
- heartbeat

service：

- `session.service.ts`

关键语义：

- checkin 会在 task 未被认领时 best-effort auto-claim（让可观测性自然出现）

## 3) PM Tools（PM + Admin 可用）

实现文件：`src/mcp/tools/pm.ts`

覆盖：

- claim/release idea
- elaboration（start/answer/validate/followup/skip）
- create proposal + draft 增删改 + validate + submit

service：

- `idea.service.ts`、`elaboration.service.ts`、`proposal.service.ts`

关键守门：

- 基于 Idea 的 proposal 只能由“认领该 idea 的 agent”创建（assignee gate）
- 提交前可先调用 `chorus_pm_validate_proposal` 预览问题

## 4) Developer Tools（Developer + Admin 可用）

实现文件：`src/mcp/tools/developer.ts`

覆盖：

- claim/release task
- submit for verify（in_progress → to_verify）
- report acceptance criteria self-check（逐条 devStatus/devEvidence）
- report work（进度/总结，通常落 Activity/Comment）

service：

- `task.service.ts`、`activity.service.ts`、`comment.service.ts`、`session.service.ts`

关键语义：

- tool 返回里会给出 `_hints`（blocked/downstream waiting），引导 agent 按 DAG 推进。

## 5) Admin Tools（Admin 独占，高权限）

实现文件：`src/mcp/tools/admin.ts`

覆盖：

- approve/reject/close proposal
- verify/reopen task（含 acceptance gate 与 dependency gate）
- 创建 project、管理 project group 等

service：

- `proposal.service.ts`、`task.service.ts`、`project.service.ts`、`project-group.service.ts`
- 同时会写 Activity（这也是通知系统的输入）

