# 角色画像与权限边界（Humans + Agents）

Chorus 把“人类用户”和“AI Agents”都作为参与者建模，但它们的能力边界不同。理解这些边界，对理解 MCP 工具集、UI 能做什么、服务层如何做权限校验很关键。

## 1) 人类用户（User）

目标：

- 创建/维护项目背景（Projects / Project Groups）
- 提交 Ideas（原始需求/想法）
- 审批 Proposal（验证 AI 的计划）
- 验证 Tasks（最终验收）

系统能力（典型）：

- 通过 Web UI 操作（Cookie/OIDC/Default Auth）
- 接收 SSE 通知、查看活动流
- 作为 Agent 的 owner（拥有自己的 agents 与 api keys）

数据落点：

- DB：`User`（OIDC 登录为主）+ `Agent.ownerUuid`
- Auth：`src/lib/auth.ts`（User auth context）

## 2) PM Agent

目标：

- 需求分析与澄清（Elaboration）
- 生成 Proposal：文档草稿 + 任务草稿 + 依赖草案（DAG）
- 提交 Proposal 进入待审批状态

系统能力：

- MCP 工具集：Public + Session + PM
- 可以读写 Idea/Proposal 的关键字段（依赖 service 层约束）

落点：

- Agent roles：`Agent.roles` 包含 `"pm"`
- MCP 注册：`src/mcp/server.ts`（根据 roles 装配 tools）
- PM 工具：`src/mcp/tools/pm.ts`

## 3) Developer Agent

目标：

- 认领/执行 Tasks
- checkin 到任务（让系统可观测）
- 更新任务状态并提交验证

系统能力：

- MCP 工具集：Public + Session + Developer
- 通过 Session 工具维护心跳、checkin/checkout

落点：

- Agent roles：`"developer"`
- Developer 工具：`src/mcp/tools/developer.ts`
- Session 工具：`src/mcp/tools/session.ts`
- Session 逻辑：`src/services/session.service.ts`

## 4) Admin Agent / 超级管理员

目标：

- 代理高权限的人类动作（创建公司、审批、验证、管理生命周期）

风险：

- 这是“危险权限”，如果被滥用会破坏多租户隔离/数据完整性。

落点：

- Admin 工具：`src/mcp/tools/admin.ts`
- Super admin auth：`src/lib/super-admin.ts`

## 5) “Owner” 与“Assignee”的区别（常见误解点）

- **Owner（Agent.ownerUuid）**：这个 Agent 属于哪个人类用户（用于权限与通知归属）。
- **Assignee（Idea/Task.assigneeType + assigneeUuid）**：当前这条工作项分配给谁执行（可以是 user，也可以是 agent）。

典型场景：

- Developer Agent 提交任务进入验证：系统可能会通知“Agent 的 owner”（人类）去做验证或关注进度（见 `notification-listener.ts` 的 recipient resolution）。

