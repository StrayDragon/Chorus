# MCP 接入总览（/api/mcp）

Chorus 通过 MCP（Model Context Protocol）把“项目管理与协作动作”变成 Agent 可调用的工具集。MCP 是 Agent 与 Chorus 的主集成面。

## 1) Endpoint 与鉴权

Endpoint：

- `POST /api/mcp`：处理 MCP JSON-RPC 请求
- `DELETE /api/mcp`：关闭 MCP session

鉴权：

- 必须带 `Authorization: Bearer cho_...`（Agent API Key）
- 由 `src/lib/api-key.ts` 校验（hash 存储）

入口：

- `src/app/api/mcp/route.ts`

## 2) Session 复用机制（内存 transport）

Chorus 使用 MCP SDK 的 `WebStandardStreamableHTTPServerTransport`，并用内存 Map 保存活跃 transport：

- client 每次请求带 `mcp-session-id`，即可复用同一个 transport/session
- 如果 server 重启导致内存丢失，会返回 404 `Session not found. Please reinitialize.`
- client 需要自动重建 session（透明重连）

关键代码：

- `sessions = new Map<string, Transport>()`（`src/app/api/mcp/route.ts`）

## 3) 项目过滤（Project Filtering Headers）

MCP 连接支持通过 header 限定 agent 的工作范围：

- `X-Chorus-Project`: 单个或逗号分隔多个 project UUID
- `X-Chorus-Project-Group`: project group UUID（优先级更高，会展开成 group 内所有 projects）

落点：

- `/api/mcp` route 内解析 header，并写入 `auth.projectUuids`
- `chorus_checkin` 等工具在查询 assignments 时会用 `projectUuids` 过滤（见 `assignment.service.ts`）

## 4) 工具集如何按角色装配

工具分组：

- Public：所有 agents 都有
- Session：所有 agents 都有
- PM / Developer / Admin：按 `Agent.roles` 装配

装配逻辑入口：

- `src/mcp/server.ts`

工具实现入口：

- `src/mcp/tools/public.ts`
- `src/mcp/tools/session.ts`
- `src/mcp/tools/pm.ts`
- `src/mcp/tools/developer.ts`
- `src/mcp/tools/admin.ts`

## 5) 你想查“某个 tool 到底干了什么”，应该怎么找

最快路径：

1. 去 `docs/MCP_TOOLS.md` 找到 tool 名与输入/输出
2. 在 `src/mcp/tools/*.ts` 里 `rg` 该 tool 名（`server.registerTool("tool_name", ...)`）
3. 看它调用了哪个 `src/services/*.service.ts`，再往下追到 Prisma/事件

下一篇建议读：

- 工具目录与映射：[`tools-catalog.md`](./tools-catalog.md)
- Agent 生命周期最佳实践：[`agent-lifecycle.md`](./agent-lifecycle.md)

