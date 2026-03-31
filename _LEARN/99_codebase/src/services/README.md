# `src/services/` 文件级索引

Service 层是 Chorus 的业务真相源：状态机、校验、事务协调、事件发射、跨实体操作都在这里发生。

> 学习版精读入口：`_LEARN/60_backend/services-map.md`

## 1) 主文件（每个文件做什么）

| 文件 | 作用（摘要） |
|---|---|
| `activity.service.ts` | Activity stream：列举与创建审计事件；创建时 `eventBus.emit("activity", ...)` |
| `agent.service.ts` | Agent CRUD、API key 相关（面向 agent 管理） |
| `assignment.service.ts` | “我的指派/可领取项”查询（合并 agent 认领 + owner 代认领） |
| `comment.service.ts` | 多态评论（Idea/Task/Proposal/Document）；发 change 事件；解析 mention |
| `company.service.ts` | Company 查询/管理（含按邮箱域名识别 company） |
| `document.service.ts` | Document CRUD；包含从 proposal draft 物化创建文档 |
| `elaboration.service.ts` | 结构化需求澄清（start/answer/validate/followup/skip/get） |
| `idea.service.ts` | Idea CRUD + 状态机 + 认领/释放 + mention 后处理 |
| `index.ts` | services 聚合导出（供其它模块 import） |
| `mention.service.ts` | 解析 `@[Name](type:uuid)` markers；写 Mention；发 mention 通知 |
| `notification-listener.ts` | 监听 activity 事件并生成通知（type mapping + recipients + prefs） |
| `notification.service.ts` | Notification CRUD、unread count、偏好管理、SSE emit |
| `project-group.service.ts` | ProjectGroup CRUD（含 dashboard 统计等） |
| `project.service.ts` | Project CRUD + 统计（dashboard 用） + group→projectUuids 辅助 |
| `proposal.service.ts` | Proposal 容器：draft 编辑、validate、submit、approve 物化、reject/close/delete |
| `search.service.ts` | 统一搜索（6 实体）+ snippet 生成 + scope 展开 |
| `session.service.ts` | AgentSession + checkin/checkout/heartbeat；checkin 时 auto-claim task（best-effort） |
| `task.service.ts` | Task CRUD、状态机、依赖 DAG（cycle detection）、验收条目与 gate、unblocked tasks |
| `user.service.ts` | User 管理（含 default auth 的自动 provision、OIDC user create/update） |

## 2) 测试（__tests__）

目录：`src/services/__tests__/`

特点：

- 大量 mock Prisma + eventBus
- 覆盖状态机、校验、依赖、通知映射等关键逻辑

完整文件列表：

```text
src/services/__tests__/activity.service.test.ts
src/services/__tests__/agent.service.test.ts
src/services/__tests__/assignment.service.test.ts
src/services/__tests__/comment.service.test.ts
src/services/__tests__/company.service.test.ts
src/services/__tests__/document.service.test.ts
src/services/__tests__/elaboration.service.pure.test.ts
src/services/__tests__/elaboration.service.test.ts
src/services/__tests__/idea.service.pure.test.ts
src/services/__tests__/idea.service.test.ts
src/services/__tests__/mention.service.pure.test.ts
src/services/__tests__/mention.service.test.ts
src/services/__tests__/notification-listener.test.ts
src/services/__tests__/notification.service.test.ts
src/services/__tests__/project-group.service.test.ts
src/services/__tests__/project.service.test.ts
src/services/__tests__/proposal.service.pure.test.ts
src/services/__tests__/proposal.service.test.ts
src/services/__tests__/search.service.test.ts
src/services/__tests__/session.service.test.ts
src/services/__tests__/task.service.pure.test.ts
src/services/__tests__/task.service.test.ts
src/services/__tests__/user.service.test.ts
```
