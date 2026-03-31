# 鉴权与会话（User / Agent / Edge Refresh）

Chorus 同时面对“浏览器用户”和“外部 Agent”。为了兼顾开发体验与安全性，它实现了三条鉴权通道，并且在 Edge Middleware 里做了 token refresh，让 UI 的长连接（SSE）也能稳定工作。

## 1) 三类身份

### 1.1 User（OIDC）

- token 形态：OIDC access token（JWT，RS/ES 签名）
- 校验：`src/lib/oidc-auth.ts`（Remote JWKS，issuer → company）
- 使用场景：
  - 浏览器端 `authFetch` 可带 Authorization header（如果有）
  - Server Components/Actions 通过 httpOnly cookie `oidc_access_token` 读取

### 1.2 User（Default Auth，本地/测试）

- 启用条件：`DEFAULT_USER` + `DEFAULT_PASSWORD`
- 登录接口：`POST /api/auth/default-login`
  - 生成 `user_session` JWT（长寿命 365d），写入 httpOnly cookie
- 校验：`src/lib/user-session.ts`（HS256，NEXTAUTH_SECRET）

### 1.3 Agent（API Key）

- token 形态：`cho_...` API key
- 校验：`src/lib/api-key.ts`（hash 存储）
- 使用场景：
  - MCP：`/api/mcp` 必须带 Authorization Bearer `cho_...`
  - MCP 里可通过 headers 做项目过滤（`X-Chorus-Project(-Group)`）

## 2) getAuthContext：统一入口

入口：`src/lib/auth.ts`

优先级（概念上）：

1. Authorization header
   - `cho_` → agent api key
   - JWT → OIDC access token
   - 其它 → 尝试 user_session
2. Cookie user_session（default auth）
3. Cookie oidc_access_token（为 EventSource 这类不能发 header 的场景兜底）

## 3) Edge Middleware：让 cookie token 自动续命

入口：`src/middleware.ts`

做两件事：

1. Default auth：`user_session` 快过期时，用 `user_refresh` 重新签一个 access token（Edge Runtime 本地完成）
2. OIDC：access token 快过期时，用 refresh token 去 OIDC token endpoint 刷新（需要 issuer discovery，内存缓存 10min）

意义：

- EventSource 的 SSE 请求只能带 cookie，不能带 Authorization header
- 如果 cookie token 不续命，UI 会在长时间打开时随机 401

## 4) Server Components 的 auth：getServerAuthContext

入口：`src/lib/auth-server.ts`

- 优先 `oidc_access_token` cookie
- 再尝试 `user_session` cookie

这也是为什么 RSC pages 常见模式是：

```ts
const auth = await getServerAuthContext();
if (!auth) redirect("/login");
```

## 5) MCP 的 auth 与 session

入口：`src/app/api/mcp/route.ts`

- 每个 MCP request 都会先 validate api key，然后创建 `AgentAuthContext`
- MCP session transport 存在内存 Map（server restart 会丢）
- role-based tool registration 在 `src/mcp/server.ts`

