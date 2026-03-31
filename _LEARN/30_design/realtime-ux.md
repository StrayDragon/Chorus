# Realtime 体验设计：让“协作”可见

Chorus 的实时体验并不是“WebSocket 全量同步”，而是一套有节制的 SSE 推送 + router.refresh 策略：在不引入复杂前端状态管理的前提下，让关键页面在多参与者操作时保持一致。

## 1) 两条 SSE 通道：实体变更 vs 通知

1. 实体变更流（项目级）：`/api/events?projectUuid=...`
   - 载荷：`{ companyUuid, projectUuid, entityType, entityUuid, action }`
   - 触发：服务层 `eventBus.emitChange(...)`
   - UI 行为：**节流/去抖后**触发 `router.refresh()`（避免刷屏）
2. 通知流（用户/agent 级）：`/api/events/notifications`
   - 载荷：`{ type: "new_notification", unreadCount, ... }`
   - 触发：通知 service `eventBus.emit("notification:${type}:${uuid}", ...)`

落点：

- 实体 SSE：`src/app/api/events/route.ts`
- 通知 SSE：`src/app/api/events/notifications/route.ts`
- 前端 provider：`src/contexts/realtime-context.tsx`、`src/contexts/notification-context.tsx`

## 2) 为什么用 router.refresh 而不是“前端维护全量状态”

设计权衡：

- 优点：服务端为真相源（RSC），刷新后状态一致；减少前端状态复杂度与边界 bug。
- 缺点：刷新粒度较粗，需要节流/去抖控制。

Chorus 的实现选择：

- RealtimeProvider 中 throttle（3s 一次）+ debounce（1s 静默）策略
- 仅在页面可见时维持连接（visibilitychange）

参考实现：

- `src/contexts/realtime-context.tsx`（`THROTTLE_MS`/`DEBOUNCE_MS`）

## 3) “执行者可见”的具体 UI 设计点

- Kanban 卡片显示 worker badge/计数  
  - 通过 `getBatchWorkerCountsAction` 批量拉取，而不是每张卡单独请求
- Task 被依赖阻塞时弹出 blocker dialog（并显示阻塞者的 assignee 与 session）
- 验收门禁未通过时弹出 gate blocked dialog（展示未通过的 acceptance criteria）

落点：

- `src/app/(dashboard)/projects/[uuid]/tasks/kanban-board.tsx`

## 4) Realtime 事件从哪来（设计与代码对齐）

典型“变更 → 事件 → UI”路径：

1. 用户/agent 发起变更（server action / api / mcp tool）
2. service 层写 DB 后触发 `eventBus.emitChange(...)`
3. `/api/events` SSE 推送给订阅该 projectUuid 的浏览器
4. RealtimeProvider 收到消息，节流后 `router.refresh()`，页面重新以服务端数据渲染

你可以在 `src/lib/event-bus.ts` 看到：

- 本地 EventEmitter
- 可选 Redis pub/sub（跨实例）
- `_origin` 去重（防止自己发布又被自己消费）

