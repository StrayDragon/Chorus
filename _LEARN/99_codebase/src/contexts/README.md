# `src/contexts/` 文件级索引（Providers）

这里集中放置跨页面共享的 React context providers，例如：

- Realtime SSE → router.refresh
- Notifications SSE → unreadCount
- Locale/Intl

## 文件列表

```text
src/contexts/auth-context.tsx
src/contexts/locale-context.tsx
src/contexts/notification-context.tsx
src/contexts/realtime-context.tsx
```

简要说明：

- `realtime-context.tsx`：订阅 `/api/events`，节流/去抖后 refresh；也支持实体级订阅
- `notification-context.tsx`：订阅 `/api/events/notifications`，维护 unreadCount 并通知弹层刷新

