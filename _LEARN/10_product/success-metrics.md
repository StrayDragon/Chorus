# 成功指标（Success Metrics）与可观测数据源

Chorus 的目标不是“做一个更漂亮的看板”，而是让 AI 与人类协作的研发闭环更快、更可靠、更可审计。下面给出一组可操作的指标，并标注它们在现有数据模型中的落点，便于后续做仪表盘或运营分析。

## 1) 速度类指标（Speed）

- Idea → Proposal 的平均耗时  
  数据：`Idea.createdAt` 到 `Proposal.createdAt`（`Proposal.inputUuids` 包含该 ideaUuid）
- Proposal pending → approved 的平均耗时  
  数据：`Proposal.status` 变更 + `reviewedAt`
- Task in_progress → to_verify → done 的平均耗时  
  数据：`Task.status` 变更事件（建议从 `Activity` 里读 action/value 计算）

## 2) 质量类指标（Quality）

- 任务返工率（to_verify → in_progress 的比例）  
  数据：Task 状态机迁移记录（`Activity`：`task:status_changed`）
- 验收条目一次通过率  
  数据：`AcceptanceCriterion.status` 由 pending → passed/failed 的统计
- Proposal 审批驳回率（pending → rejected_to_draft / revised）  
  数据：Proposal 相关 activity + `Proposal.status`

## 3) 协作类指标（Collaboration）

- 并行度（同一时间活跃 sessions 数 / 活跃 checkins 数）  
  数据：`AgentSession.status=active` + `SessionTaskCheckin.checkoutAt is null`
- 可见性覆盖率（有 checkin 的任务占比）  
  数据：task 总数 vs `SessionTaskCheckin` 去重 taskUuid 数
- 提及与互动强度（@mention / comment_added）  
  数据：`Mention`、`Comment`、`Activity.action=comment_added`

## 4) 可靠性类指标（Reliability）

- SSE 连接稳定性（断连次数、平均持续时间）  
  当前代码未落库，可后续在前端埋点；服务端 SSE 在：
  - `/api/events`：`src/app/api/events/route.ts`
  - `/api/events/notifications`：`src/app/api/events/notifications/route.ts`
- MCP session 重建次数（404 Session not found）  
  当前未落库，可在 `/api/mcp` route 里加计数（落点：`src/app/api/mcp/route.ts`）

## 5) 成本类指标（Cost）

- Agent hours 消耗（storyPoints 总和，按状态分布）  
  数据：`Task.storyPoints` 聚合；UI 已在 tasks 页显示总计（`tasks-page-content.tsx`）

## 6) 数据源总览（你在代码里该看哪里）

- 主数据模型：`prisma/schema.prisma`
- 业务事件与审计：`src/services/activity.service.ts`
- 通知与偏好：`src/services/notification.service.ts`、`NotificationPreference`
- 会话与 checkin：`src/services/session.service.ts`
- 搜索：`src/services/search.service.ts`（统一 6 类实体）

