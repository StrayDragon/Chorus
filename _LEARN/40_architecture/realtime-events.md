# Realtime 与事件系统（EventBus / SSE / Redis）

Chorus 的实时能力不是单点实现，而是一条完整链路：

`业务变更` → `发事件` → `SSE 推送` → `前端 refresh/局部订阅` → `用户看到 UI 更新`

## 1) EventBus：本地 EventEmitter + 可选 Redis Pub/Sub

入口：`src/lib/event-bus.ts`

设计要点：

- 本地交付：同一进程内 `EventEmitter` 直接派发（最低成本）
- 跨实例交付：Redis pub/sub 把事件广播到其他实例（ElastiCache Serverless 兼容单 channel）
- 去重：每个进程有 `_instanceId`，Redis 回来的事件若 `_origin` 是自己则忽略

Redis 配置入口：

- `src/lib/redis.ts`：支持 `REDIS_URL` 或 `REDIS_HOST/PORT/USERNAME/PASSWORD`

```mermaid
flowchart LR
  subgraph InstanceA[Next.js Instance A]
    SvcA[services] -->|emitChange / emit(activity)| BusA[eventBus]
    BusA -->|local emit| UIA[SSE routes]
  end

  subgraph InstanceB[Next.js Instance B]
    BusB[eventBus] -->|local emit| UIB[SSE routes]
  end

  BusA -->|publish| Redis[(Redis channel chorus:events)]
  Redis -->|subscribe| BusB
```

## 2) 两类 SSE：change stream 与 notification stream

### 2.1 change stream：`/api/events`

入口：`src/app/api/events/route.ts`

- 订阅 channel：`eventBus.on("change", handler)`
- 过滤：按 `companyUuid` 强制隔离；按 query `projectUuid` 可选过滤
- 心跳：每 30s `: heartbeat`

变更事件的产生位置（举例）：

- `src/services/task.service.ts`：create/update/delete/claim 等后 `emitChange`
- `src/services/idea.service.ts`：create/update/delete/claim 等后 `emitChange`
- `src/services/proposal.service.ts`：create/submit/approve/reject/close/delete 后 `emitChange`
- `src/services/session.service.ts`：checkin/checkout/close session 后 `emitChange`（让 UI 能更新 worker 状态）

### 2.2 notification stream：`/api/events/notifications`

入口：`src/app/api/events/notifications/route.ts`

- 订阅 channel：`notification:${auth.type}:${auth.actorUuid}`
- 事件由 `notification.service.ts` 发出（create/createBatch 计算 unreadCount 后 emit）

## 3) 前端消费：RealtimeProvider 的节流/去抖刷新策略

入口：`src/contexts/realtime-context.tsx`

- 采用 `EventSource` 连接 `/api/events?projectUuid=...`
- 每次 message：
  - 对“全局 refresh”做 throttle/debounce（最多 3s 刷新一次）
  - 对“实体订阅”立即派发（`subscribeEntity`）
- visibilitychange：页面不可见时断开，恢复可见时重连并触发一次 refresh

## 4) 通知生成：Activity → Notification（解耦）

这条链路把“业务动作”与“通知策略”分开：

1. 业务 service 创建 Activity：`activity.service.ts` → `eventBus.emit("activity", ...)`
2. listener 订阅 activity：`notification-listener.ts`
3. listener 解析 action/targetType 映射通知类型，解析 recipients，尊重偏好
4. notification.service.ts 写入 DB，并 emit `notification:*` 事件给 SSE

建议配合阅读：

- `src/services/activity.service.ts`
- `src/services/notification-listener.ts`
- `src/services/notification.service.ts`

