# 术语表（Glossary）

Chorus 的学习门槛主要来自“新概念很多且彼此有关”。这份术语表的目标是让你能把 PRD/架构图/代码里的名词对上号，并能快速定位到实现落点。

> 约定：这里的“落点”优先给出最核心的入口文件，更多文件请在 `99_codebase/**` 里查。

| 术语 | 含义（中文解释） | 代码/数据落点（入口） |
|---|---|---|
| Agent Harness | “包裹在模型外面的系统”，负责会话、任务状态、上下文、子 Agent 编排、可观测性、失败恢复等 | `README.md`，`docs/ARCHITECTURE.md` |
| AI-DLC | AI-Driven Development Lifecycle：AI 提议，人类验证的研发方法论 | `docs/PRD_Chorus.zh.md` |
| Reversed Conversation | 核心哲学：AI 先提出方案/拆解，人类做验证/审批 | `docs/PRD_Chorus.zh.md` |
| Tenant / Company | 多租户隔离的顶层边界；绝大多数查询都带 `companyUuid` | `prisma/schema.prisma`（`Company`） |
| Actor / Assignee | actor = 谁触发动作；assignee = 当前被分配执行的人/Agent（多态） | `src/lib/auth.ts`，`src/services/*.service.ts` |
| UUID-first | 系统对外使用 UUID 作为主标识；路由、MCP、API、DB 查询均以 UUID 为主 | `docs/ARCHITECTURE.md`，`prisma/schema.prisma` |
| relationMode = prisma | Prisma 负责关系，不在 DB 层建外键约束（减少迁移/分布式成本，代价是需要服务层保证一致性） | `prisma/schema.prisma` |
| Idea | “人类原始输入”，AI-DLC 的起点 | `prisma/schema.prisma`（`Idea`），`src/services/idea.service.ts` |
| Elaboration | 结构化需求澄清（问答轮次），让 Proposal 的输入更“可执行” | `prisma/schema.prisma`（`ElaborationRound/Question`），`src/services/elaboration.service.ts` |
| Proposal (container model) | 提案容器：包含文档草稿 + 任务草稿，审批后物化为 Document/Task | `prisma/schema.prisma`（`Proposal`），`src/services/proposal.service.ts` |
| DocumentDraft / TaskDraft | Proposal 内部的草稿结构（JSON 字段），用于审批前迭代 | `src/services/proposal.service.ts` |
| Document | PRD/Tech Design 等正式文档（通常由 Proposal 物化产生） | `prisma/schema.prisma`（`Document`），`src/services/document.service.ts` |
| Task | 可执行工作单元，带状态机、指派、多态 assignee、依赖 DAG | `prisma/schema.prisma`（`Task/TaskDependency`），`src/services/task.service.ts` |
| Task DAG | 任务依赖图（有向无环图）；用于决定执行顺序与并行度 | DB：`TaskDependency`；UI：`src/app/(dashboard)/projects/[uuid]/tasks/dag-view.tsx` |
| Story Points = Agent Hours | 估算单位改为“Agent 小时”而非人天 | `docs/PRD_Chorus.zh.md`，UI：`tasks-page-content.tsx` |
| Acceptance Criteria (items) | 结构化验收条目（避免 Markdown 并发写冲突，便于逐条验证） | DB：`AcceptanceCriterion`；逻辑：`src/services/task.service.ts` |
| Session (AgentSession) | 面向“群体/多 Agent 并行”的子会话，用于可观测性与 checkin/checkout | DB：`AgentSession/SessionTaskCheckin`；`src/services/session.service.ts` |
| Checkin / Checkout | Session 与 Task 的关联，表示“这个 session 正在处理哪个任务” | `src/services/session.service.ts`，MCP：`src/mcp/tools/session.ts` |
| Activity Stream | 审计流：记录“谁对什么做了什么”，带 session 归因 | DB：`Activity`；`src/services/activity.service.ts` |
| Notification | 面向用户/Agent 的通知实体（可 SSE 推送，含偏好开关） | DB：`Notification/NotificationPreference`；`src/services/notification.service.ts` |
| Mention (@mention) | `@[Name](type:uuid)` 格式的 mention，触发记录与通知 | `src/services/mention.service.ts` |
| Realtime “change” | 面向 UI 的实体变更事件（created/updated/deleted），通过 SSE 推送 | `src/lib/event-bus.ts`，`src/app/api/events/route.ts` |
| MCP | Model Context Protocol：Agent 通过标准协议调用 Chorus 工具集 | `src/app/api/mcp/route.ts`，`src/mcp/server.ts` |

