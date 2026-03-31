# `src/mcp/` 文件级索引（MCP Server + Tools）

入口：

- `src/mcp/server.ts`：根据 roles 注册 tools（Public/Session/PM/Developer/Admin）
- `src/app/api/mcp/route.ts`：HTTP endpoint（transport/session 管理）

## 文件列表

```text
src/mcp/server.ts
src/mcp/tools/public.ts
src/mcp/tools/session.ts
src/mcp/tools/pm.ts
src/mcp/tools/developer.ts
src/mcp/tools/admin.ts
src/mcp/tools/schema-utils.ts
src/mcp/__tests__/public-tools-proposalUuids.test.ts
src/mcp/__tests__/public-tools-task-ops.test.ts
```

## 你通常会怎么读这里

1. 先读 `server.ts` 看 roles 如何装配 tools
2. 再按你关心的角色读 `tools/*.ts`
3. 最后读 MCP endpoint（`src/app/api/mcp/route.ts`）理解 session 语义

