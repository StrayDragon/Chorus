# API 约定与错误处理（Route Handlers）

Chorus 的 REST API 位于 `src/app/api/**/route.ts`，整体风格偏“薄控制器 + 服务层真相源”。这份文档把常见约定总结出来，方便你读任何一个 route.ts 时快速定位重点。

## 1) 标准返回格式（success/data/meta）

入口：`src/lib/api-response.ts`

- 成功：`{ success: true, data, meta? }`
- 失败：`{ success: false, error: { code, message, details? } }`

常用 helpers：

- `success(data)`
- `paginated(data, page, pageSize, total)`
- `errors.*`（unauthorized/notFound/validationError/invalidStatusTransition 等）

## 2) 统一异常包装：withErrorHandler

入口：`src/lib/api-handler.ts`

作用：

- 捕获 `ApiError` → 返回结构化错误
- 捕获 Prisma 常见错误码（P2002/P2025/P2003）→ 映射成 conflict/notFound/database
- 未知异常 → internal（生产环境隐藏细节）

典型用法：

- `export const GET = withErrorHandler(async (...) => { ... })`

## 3) Auth 获取方式：getAuthContext

入口：`src/lib/auth.ts`

支持三类身份：

- agent：Authorization Bearer `cho_...` API key
- user：OIDC access token（header 或 cookie）
- user（default auth）：`user_session` JWT cookie（并在 edge middleware 自动 refresh）

注意：

- SSE EventSource 无法自定义 Authorization header，因此 `/api/events` 与 `/api/events/notifications` 依赖 cookie auth。

## 4) 状态机与权限通常在 service 层，但 route 会做“最小守门”

例：`src/app/api/tasks/[uuid]/route.ts`

- 先取原 Task 做权限判断（非 user 必须是 assignee）
- 再校验状态迁移是否合法（`isValidTaskStatusTransition`）
- 再做依赖检查（move to in_progress 时必须 dependencies resolved；可选 force 仅允许 user/super_admin）

## 5) 分页与查询参数

- `parsePagination(request)`：把 `page/pageSize` 转成 `skip/take`
- `parseQuery(request)`：读取 querystring

建议你读 API 时的顺序：

1. 先看 auth + permission（谁能做）
2. 再看 validate（输入、状态机、依赖门禁）
3. 再看 service 调用（真正业务）
4. 最后看是否 emit realtime（通常在 service 里）

