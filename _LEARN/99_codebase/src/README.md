# `src/` 总览（Codebase Map）

`src/` 是 Chorus 的主代码区，包含：

- Next.js App Router（页面与 API）
- 业务服务层（services）
- MCP server/tools
- Realtime/SSE 与通知
- 通用库（auth、event bus、uuid resolver 等）

## 1) 目录结构

| 路径 | 作用 |
|---|---|
| `src/app/` | App Router：页面（dashboard/admin/login/onboarding）+ HTTP APIs（`src/app/api/**`） |
| `src/services/` | 业务服务层（状态机、校验、事务、事件） |
| `src/lib/` | 通用库（auth、api-response、event-bus、prisma、redis 等） |
| `src/mcp/` | MCP server 与 tool 实现（public/session/pm/dev/admin） |
| `src/components/` | 业务 UI 组件（搜索、通知、mention、elaboration、pixel workspace 等） |
| `src/components/ui/` | shadcn/ui 基础组件 |
| `src/contexts/` | Realtime/Notifications 等 provider（SSE consumption） |
| `src/hooks/` | UI hooks（mobile/panel url 等） |
| `src/i18n/` | next-intl 配置与 locale 相关 |
| `src/types/` | 类型定义（auth/elaboration/admin 等） |
| `src/actions/` | 全局 server actions（若有） |
| `src/__tests__` / `src/**/__tests__` | Vitest 单测 |

## 2) 顶层文件

```text
src/instrumentation.ts
src/middleware.ts
```

说明：

- `src/middleware.ts`：Edge Middleware，负责 cookie token refresh + legacy URL redirect（例如 `?task=...` → panel URL）

## 3) 分册索引

- `src/app/`：[`app/README.md`](./app/README.md)
- `src/app/api/`：[`app/api/README.md`](./app/api/README.md)
- `src/services/`：[`services/README.md`](./services/README.md)
- `src/lib/`：[`lib/README.md`](./lib/README.md)
- `src/components/`：[`components/README.md`](./components/README.md)
- `src/mcp/`：[`mcp/README.md`](./mcp/README.md)
- `src/contexts/`：[`contexts/README.md`](./contexts/README.md)
- `src/hooks/`：[`hooks/README.md`](./hooks/README.md)
- `src/types/`：[`types/README.md`](./types/README.md)
- `src/i18n/`：[`i18n/README.md`](./i18n/README.md)
- `src/actions/`：[`actions/README.md`](./actions/README.md)
- `src/__mocks__/`：[`__mocks__/README.md`](./__mocks__/README.md)
- `src/__test-utils__/`：[`__test-utils__/README.md`](./__test-utils__/README.md)
