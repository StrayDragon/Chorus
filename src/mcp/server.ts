// src/mcp/server.ts
// MCP Server 实例 (ARCHITECTURE.md §5.2)

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerPublicTools } from "./tools/public";
import { registerPmTools } from "./tools/pm";
import { registerDeveloperTools } from "./tools/developer";
import type { AgentAuthContext } from "@/types/auth";

// 创建 MCP Server 工厂函数
export function createMcpServer(auth: AgentAuthContext): McpServer {
  const server = new McpServer({
    name: "chorus",
    version: "1.0.0",
  });

  // 注册公共工具（所有 Agent 可用）
  registerPublicTools(server, auth);

  // 根据角色注册专属工具
  const roles = auth.roles || [];

  if (roles.includes("pm")) {
    // PM Agent 拥有所有工具
    registerPmTools(server, auth);
    registerDeveloperTools(server, auth);
  } else if (roles.includes("developer")) {
    // Developer Agent 只有开发者工具
    registerDeveloperTools(server, auth);
  }

  return server;
}
