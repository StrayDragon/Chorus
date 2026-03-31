# `src/lib/` 文件级索引

`src/lib` 是 Chorus 的基础设施与通用工具集。读 service 层时，你会频繁跳进这里看 auth、事件、错误、Prisma 单例等。

## 1) 核心文件速查表

| 文件 | 作用（摘要） |
|---|---|
| `api-handler.ts` | API route 的错误处理 wrapper（`withErrorHandler`）+ `ApiError` + parseBody/query/pagination |
| `api-response.ts` | 统一 API 响应格式与错误码 helpers（`success/paginated/errors.*`） |
| `api-key.ts` | Agent API key 的提取与校验（hash 存储） |
| `auth.ts` | `getAuthContext`（统一鉴权入口）+ role/assignee helpers + require* decorators |
| `auth-server.ts` | Server Components/Actions 从 httpOnly cookie 读取 auth context |
| `auth-client.ts` | 浏览器端 OIDC token 管理（oidc-client-ts）+ `authFetch`（401 自动 refresh） |
| `default-auth.ts` | default auth（`DEFAULT_USER/DEFAULT_PASSWORD`）启用与校验 |
| `user-session.ts` | default auth user 的 JWT session（HS256）+ refresh token 机制 |
| `oidc-auth.ts` | OIDC access token 校验（Remote JWKS）+ issuer → company → user |
| `oidc.ts` | OIDC client 配置存储与 UserManager 构建（前端） |
| `middleware.ts` |（不在 lib，在 `src/middleware.ts`）Edge refresh 与 legacy redirect |
| `event-bus.ts` | 双层事件总线（EventEmitter + Redis pub/sub）+ `emitChange` |
| `redis.ts` | Redis pub/sub client 单例与 URL 构建（支持 REDIS_URL 或拆分 vars） |
| `prisma.ts` | Prisma client 单例（DAO） |
| `uuid-resolver.ts` | 把 (type, uuid) 解析成 name/assignee/createdBy 等展示字段（批量优化） |
| `errors.ts` | 业务错误类型（AlreadyClaimedError / NotClaimedError / isPrismaNotFound 等） |
| `cookie-utils.ts` | cookie options 与 JWT maxAge 推导 |
| `super-admin.ts` | super admin 识别与 auth 辅助 |
| `utils.ts` | 通用 `cn` 等小工具（供 UI 使用） |
| `animation.ts` | 动画常量与 framer-motion variants（UI 统一动效） |
| `project-colors.ts` | 项目标识色（UI badge 等） |

## 2) 文件列表（完整）

```text
src/lib/animation.ts
src/lib/api-handler.ts
src/lib/api-key.ts
src/lib/api-response.ts
src/lib/auth-client.ts
src/lib/auth-server.ts
src/lib/auth.ts
src/lib/cookie-utils.ts
src/lib/default-auth.ts
src/lib/errors.ts
src/lib/event-bus.ts
src/lib/oidc-auth.ts
src/lib/oidc.ts
src/lib/prisma.ts
src/lib/project-colors.ts
src/lib/redis.ts
src/lib/super-admin.ts
src/lib/user-session.ts
src/lib/utils.ts
src/lib/uuid-resolver.ts
```

## 3) 测试与 mocks

- tests：`src/lib/__tests__/**`
- mocks：`src/lib/__mocks__/**`

tests 文件列表：

```text
src/lib/__tests__/animation.test.ts
src/lib/__tests__/api-handler.test.ts
src/lib/__tests__/api-key.test.ts
src/lib/__tests__/api-response.test.ts
src/lib/__tests__/auth-client.test.ts
src/lib/__tests__/auth-server.test.ts
src/lib/__tests__/auth.test.ts
src/lib/__tests__/cookie-utils.test.ts
src/lib/__tests__/default-auth.test.ts
src/lib/__tests__/errors.test.ts
src/lib/__tests__/event-bus.test.ts
src/lib/__tests__/oidc-auth.test.ts
src/lib/__tests__/oidc.test.ts
src/lib/__tests__/project-colors.test.ts
src/lib/__tests__/setup-smoke.test.ts
src/lib/__tests__/super-admin.test.ts
src/lib/__tests__/user-session.test.ts
src/lib/__tests__/utils.test.ts
src/lib/__tests__/uuid-resolver.test.ts
```

mocks 文件列表：

```text
src/lib/__mocks__/event-bus.ts
src/lib/__mocks__/prisma.ts
```
