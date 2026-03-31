# Service 层地图（Business Logic Index）

Service 层（`src/services/*.service.ts`）是 Chorus 的“业务真相源”。Route handlers、RSC pages、Server Actions、MCP tools 最终都会落到这些 service 方法上。

下面按模块列出每个 service 的职责与典型入口。更细的“文件级索引”请看：`_LEARN/99_codebase/src/services/README.md`。

## 核心业务服务

- `idea.service.ts`
  - Idea CRUD、指派/认领、状态机（open/elaborating/…）
  - 关键点：`IDEA_STATUS_TRANSITIONS` + `normalizeIdeaStatus`
- `elaboration.service.ts`
  - 结构化需求澄清：start/answer/validate/followup/skip/get
  - 关键点：round 限制（<=5）、问题格式校验、actor 必须是 assignee
- `proposal.service.ts`
  - Proposal 容器：draft 编辑、validate、submit、approve（物化）、reject（回 draft）、close/delete
  - 关键点：`validateProposal`（E1~E5 + E-AC），approve 时校验 acceptanceCriteriaItems
- `task.service.ts`
  - Task CRUD、状态机、依赖 DAG、验收条目（AcceptanceCriterion）与汇总
  - 关键点：`TASK_STATUS_TRANSITIONS`、`computeAcceptanceStatus`、依赖检查与 gate
- `document.service.ts`
  - Document CRUD（含 proposal 物化创建）
- `project.service.ts` / `project-group.service.ts`
  - 项目与项目组 CRUD、统计、查询辅助（例如 MCP 过滤 header 里的 groupUuid → projectUuids）

## 协作与可观测性

- `activity.service.ts`
  - 写入 Activity，并通过 `eventBus.emit("activity", ...)` 广播给通知系统
- `comment.service.ts`
  - 多态评论（Idea/Task/Proposal/Document），并触发实体变更事件 + mention 后处理
- `mention.service.ts`
  - 解析 `@[Name](type:uuid)` markers，写 Mention 记录并创建 mention 通知（尊重偏好）
- `session.service.ts`
  - AgentSession CRUD，checkin/checkout/heartbeat，checkin 会在 task 无 assignee 时自动 claim
- `assignment.service.ts`
  - “我的指派/可领取项”查询（考虑 agent owner 代认领）
- `notification.service.ts`
  - Notification CRUD、偏好、unreadCount 计算，并通过 eventBus 推送 SSE 事件
- `notification-listener.ts`
  - 监听 activity 事件，映射成 notifications（解耦：业务动作不需要手写通知）

## 平台与账户

- `agent.service.ts` / `user.service.ts` / `company.service.ts`
  - Agents、API keys、用户/公司管理（含 default auth 的自动 provision）

## 交叉模块

- `search.service.ts`
  - 统一搜索（Task/Idea/Proposal/Document/Project/ProjectGroup），生成 snippet

## 你读 service 的推荐顺序（高收益）

1. `task.service.ts`（状态机 + DAG + 验收条目）
2. `proposal.service.ts`（容器模型与物化）
3. `elaboration.service.ts`（结构化澄清的约束）
4. `session.service.ts`（可观测性与多 agent 协作）
5. `notification-listener.ts`（事件驱动的通知策略）

