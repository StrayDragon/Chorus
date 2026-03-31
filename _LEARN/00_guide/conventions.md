# 项目约定与“隐含规则”（Conventions）

这份文档总结 Chorus 代码里经常出现、但不一定每次都会被显式写出的约定。理解这些约定能显著降低你读代码的时间。

## 1) UUID-first（UUID 是系统主语言）

- 对外接口（Web 路由、API、MCP）几乎全部使用 UUID。
- `prisma/schema.prisma` 中每个实体都有 `id: Int`（内部）和 `uuid: String`（对外）并存，但业务逻辑以 `uuid` 为主。
- 多租户隔离：大多数 service 方法都要求 `companyUuid`，防止跨公司数据泄漏。

建议：你在追踪一条链路时，优先关注 `companyUuid` + `projectUuid` + `entityUuid` 这组三元组。

## 2) 分层：Route / RSC / Server Actions → Service → Prisma

典型模式：

- `src/app/api/**/route.ts`：HTTP API 的“薄控制器”，做 auth、parse、调用 service、返回标准响应。
- `src/app/(dashboard)/**/page.tsx`：Server Component，直接调用 service 读取数据并渲染。
- `src/app/(dashboard)/**/actions.ts`：Server Actions，封装“可变更操作”（create/update/move），最终也会调用 service。
- `src/services/*.service.ts`：业务真相源（状态机校验、跨实体协调、事务、发事件）。
- `src/lib/prisma.ts`：Prisma 单例（DAO 层）。

## 3) 状态机优先：允许的迁移在代码里显式声明

- Task：`src/services/task.service.ts` 中 `TASK_STATUS_TRANSITIONS`
- Idea：`src/services/idea.service.ts` 中 `IDEA_STATUS_TRANSITIONS`（并包含历史状态归一化）
- Proposal：DB 字段是字符串，但 service 层会做提交/审批/驳回等操作的约束（见 `proposal.service.ts`）

提示：当你看到“移动 Kanban 列失败”时，根因通常是状态机不允许、依赖未完成或验收门禁未通过。

## 4) Realtime：事件总线（本地 + Redis）是“系统神经”

Chorus 使用双层事件机制：

- `eventBus.emitChange(...)`：面向 UI 的实体变更事件，SSE `/api/events` 推送给浏览器。
- `eventBus.emit("activity", ...)`：面向“活动流/通知”的业务事件；`notification-listener.ts` 订阅并生成通知。
- `eventBus.emit("notification:user:uuid", ...)`：面向某个接收者的通知 SSE 推送（`/api/events/notifications`）。

跨实例：`src/lib/event-bus.ts` 会在 Redis 启用时把事件发布到单一 channel，其他实例订阅后再本地派发（并用 `_origin` 去重）。

## 5) “零侵入”通知：通过监听 Activity 事件实现

设计意图：尽量不在每个 service 函数里手写“发通知”的逻辑，而是统一在 `src/services/notification-listener.ts` 把 Activity 映射成 Notification。

这带来两个结果：

- 你要找“为什么会发这个通知”：去看 listener 的 mapping 与 recipient resolution。
- 你要新增一种通知：通常只需要新增一个 Activity action，并在 listener 里补 mapping + preference field。

## 6) @mention 的数据与通知是解耦的

- Mention 记录：`Mention` 表用于审计与后续扩展。
- Mention 通知：由 `mention.service.ts` 创建 `Notification`（并尊重偏好开关）。

## 7) 数据一致性：DB 不建外键约束（由服务层保证）

`relationMode = "prisma"` 表示数据库层不强制外键，服务层必须更谨慎：

- 读写都要带 `companyUuid`
- 删除要考虑级联（Prisma 层 `onDelete: Cascade` 在模型里体现，但仍需谨慎验证）
- 尽量通过 service 层做跨表操作，不要在 UI 里直接拼 Prisma 查询（少量“读路径”例外）

