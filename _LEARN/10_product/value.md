# 产品价值分析：Chorus 到底解决什么问题

> 读前建议：先快速浏览 `docs/PRD_Chorus.zh.md`，再回到这里看“价值如何落到代码”。

## 1. 一句话定位

Chorus 是一个 **Agent Harness**：让 AI Agent 和人类在同一平台上完成从需求到交付的闭环协作，并把“会话生命周期、任务状态机、上下文连续性、可观测性、失败恢复”系统化。

它不是“给 Jira 加一个 AI”，而是把 AI 当作“一等公民”，让系统天然支持 AI-DLC 的工作流（AI 提议，人类验证）。

## 2. 三个杀手级能力（与代码落点）

### 2.1 Zero Context Injection（零成本上下文注入）

**体验目标**：Agent 开始工作时自动知道“我是谁、我现在应该做什么、哪些任务属于我”。

落点拆解：

- Agent 的身份与人格配置：`Agent` 表的 `persona/systemPrompt/roles/ownerUuid`
  - DB：`prisma/schema.prisma`（`Agent`）
- Agent 进入系统后的“check-in”聚合信息：MCP `chorus_checkin`
  - MCP 描述：`docs/MCP_TOOLS.md`
  - 实现：`src/mcp/tools/public.ts`（工具注册）与相关 service 查询
- Session 的可观测性：`AgentSession` + `SessionTaskCheckin`
  - 逻辑：`src/services/session.service.ts`
  - UI：Task 卡片 worker badge（Kanban 中通过批量 workerCount 拉取）

### 2.2 AI-DLC Workflow（AI 驱动的开发工作流）

**体验目标**：Idea 不直接变成“让开发去做”的任务，而是先经历澄清与提案审批，最后才变成可执行的 Tasks/Documents。

落点拆解（核心链路）：

- Idea：`src/services/idea.service.ts`
- Elaboration（结构化问答）：`src/services/elaboration.service.ts`
- Proposal（容器模型，含草稿）：`src/services/proposal.service.ts`
- 物化：proposal approved 后创建 Document/Task（见 `proposal.service.ts` 调用 `createDocumentFromProposal` / `createTasksFromProposal`）
- Task 执行与验证：`src/services/task.service.ts`（状态机 + 验收条目）

这条链路的序列图与状态机在：

- [`60_backend/core-flows.md`](../60_backend/core-flows.md)
- [`40_architecture/state-machines.md`](../40_architecture/state-machines.md)

### 2.3 Multi-Agent Awareness（多 Agent 协作感知）

**体验目标**：多个 Agent 并行工作时，系统能回答：

- 谁在做哪个任务（实时）
- 哪些任务被卡住（依赖未完成/验收未通过）
- 发生了什么（活动流审计）

落点拆解：

- Session checkin：`src/services/session.service.ts`
- Worker badges/计数：`src/app/(dashboard)/projects/[uuid]/tasks/kanban-board.tsx`（批量拉取 workerCount）
- Task DAG：依赖模型 `TaskDependency` + UI `dag-view.tsx`
- Activity Stream：`src/services/activity.service.ts`
- Notification：`notification-listener.ts` 监听 activity 生成通知，SSE 推送给 UI

## 3. 为什么“需要 Harness”

没有 harness 的 AI 协作会出现这些结构性问题（并不是“提示词写得更好”能解决的）：

- 任务跨会话漂移：下一次打开 Agent 窗口就像“重启失忆”
- 没有可验证的状态机：看板只是 UI，缺乏强约束的状态迁移规则
- 没有可观测性：无法回答“谁做了什么、为什么、基于哪些输入”
- 失败不可恢复：Agent 退出/卡住时，任务无法自动回收/重新认领

Chorus 的价值在于把这些变成“系统能力”，而不是“人脑记忆 + 约定俗成 + 手工同步”。

## 4. 竞争对比（概念层）

可以把 Chorus 理解为：“Linear/Plane 的任务模型 + 专门面向 Agent 的会话/工具/可观测层”。

与传统项目管理工具相比，差异通常出现在：

- **Agent 可执行接口**：MCP 工具是第一等 API（不仅是 Web UI）
- **Session/Checkin**：把“执行中的上下文”显式建模（而不是隐含在聊天窗口里）
- **AI-DLC 审批闭环**：Proposal 是“计划的容器”，审批后物化为可执行实体

更细对比可参考：`docs/COMPARISON_Chorus_vs_Plane.md`

