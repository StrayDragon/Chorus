// src/mcp/tools/session.ts
// Agent Session MCP 工具 (所有角色可用)
// UUID-Based Architecture: All operations use UUIDs

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { AgentAuthContext } from "@/types/auth";
import * as sessionService from "@/services/session.service";

export function registerSessionTools(server: McpServer, auth: AgentAuthContext) {
  // chorus_list_sessions - 列出当前 Agent 的 Sessions
  server.registerTool(
    "chorus_list_sessions",
    {
      description: "列出当前 Agent 的所有 Sessions",
      inputSchema: z.object({
        status: z.enum(["active", "inactive", "closed"]).optional().describe("按状态筛选"),
      }),
    },
    async ({ status }) => {
      const sessions = await sessionService.listAgentSessions(
        auth.companyUuid,
        auth.actorUuid,
        status
      );

      return {
        content: [{ type: "text", text: JSON.stringify(sessions, null, 2) }],
      };
    }
  );

  // chorus_get_session - 获取 Session 详情
  server.registerTool(
    "chorus_get_session",
    {
      description: "获取 Session 详情及活跃 checkins",
      inputSchema: z.object({
        sessionUuid: z.string().describe("Session UUID"),
      }),
    },
    async ({ sessionUuid }) => {
      const session = await sessionService.getSession(auth.companyUuid, sessionUuid);
      if (!session) {
        return { content: [{ type: "text", text: "Session 不存在" }], isError: true };
      }

      if (session.agentUuid !== auth.actorUuid) {
        return { content: [{ type: "text", text: "无权访问此 Session" }], isError: true };
      }

      return {
        content: [{ type: "text", text: JSON.stringify(session, null, 2) }],
      };
    }
  );

  // chorus_create_session - 创建新 Session
  server.registerTool(
    "chorus_create_session",
    {
      description: "Create a new Agent Session. TIP: Before creating, call chorus_list_sessions first to check for existing sessions that can be reopened with chorus_reopen_session.",
      inputSchema: z.object({
        name: z.string().describe("Session name (e.g. 'frontend-worker')"),
        description: z.string().optional().describe("Session description"),
        expiresAt: z.string().optional().describe("Expiration time (ISO 8601)"),
      }),
    },
    async ({ name, description, expiresAt }) => {
      const session = await sessionService.createSession({
        companyUuid: auth.companyUuid,
        agentUuid: auth.actorUuid,
        name,
        description,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      });

      return {
        content: [{ type: "text", text: JSON.stringify(session, null, 2) }],
      };
    }
  );

  // chorus_close_session - 关闭 Session
  server.registerTool(
    "chorus_close_session",
    {
      description: "关闭一个 Session（批量 checkout 所有 checkins）",
      inputSchema: z.object({
        sessionUuid: z.string().describe("Session UUID"),
      }),
    },
    async ({ sessionUuid }) => {
      const session = await sessionService.getSession(auth.companyUuid, sessionUuid);
      if (!session) {
        return { content: [{ type: "text", text: "Session 不存在" }], isError: true };
      }

      if (session.agentUuid !== auth.actorUuid) {
        return { content: [{ type: "text", text: "无权关闭此 Session" }], isError: true };
      }

      const closed = await sessionService.closeSession(auth.companyUuid, sessionUuid);

      return {
        content: [{ type: "text", text: JSON.stringify(closed, null, 2) }],
      };
    }
  );

  // chorus_reopen_session - 重新打开已关闭的 Session
  server.registerTool(
    "chorus_reopen_session",
    {
      description: "Reopen a closed Session (closed → active). Use this to reuse a previous session instead of creating a new one.",
      inputSchema: z.object({
        sessionUuid: z.string().describe("Session UUID"),
      }),
    },
    async ({ sessionUuid }) => {
      const session = await sessionService.getSession(auth.companyUuid, sessionUuid);
      if (!session) {
        return { content: [{ type: "text", text: "Session not found" }], isError: true };
      }

      if (session.agentUuid !== auth.actorUuid) {
        return { content: [{ type: "text", text: "No permission to reopen this Session" }], isError: true };
      }

      if (session.status !== "closed") {
        return { content: [{ type: "text", text: `Session is ${session.status}, only closed sessions can be reopened` }], isError: true };
      }

      const reopened = await sessionService.reopenSession(auth.companyUuid, sessionUuid);

      return {
        content: [{ type: "text", text: JSON.stringify(reopened, null, 2) }],
      };
    }
  );

  // chorus_session_checkin_task - Session checkin 到 Task
  server.registerTool(
    "chorus_session_checkin_task",
    {
      description: "将 Session checkin 到指定 Task",
      inputSchema: z.object({
        sessionUuid: z.string().describe("Session UUID"),
        taskUuid: z.string().describe("Task UUID"),
      }),
    },
    async ({ sessionUuid, taskUuid }) => {
      const session = await sessionService.getSession(auth.companyUuid, sessionUuid);
      if (!session) {
        return { content: [{ type: "text", text: "Session 不存在" }], isError: true };
      }

      if (session.agentUuid !== auth.actorUuid) {
        return { content: [{ type: "text", text: "无权操作此 Session" }], isError: true };
      }

      const checkin = await sessionService.sessionCheckinToTask(
        auth.companyUuid,
        sessionUuid,
        taskUuid
      );

      return {
        content: [{ type: "text", text: JSON.stringify(checkin, null, 2) }],
      };
    }
  );

  // chorus_session_checkout_task - Session checkout from Task
  server.registerTool(
    "chorus_session_checkout_task",
    {
      description: "将 Session 从指定 Task checkout",
      inputSchema: z.object({
        sessionUuid: z.string().describe("Session UUID"),
        taskUuid: z.string().describe("Task UUID"),
      }),
    },
    async ({ sessionUuid, taskUuid }) => {
      const session = await sessionService.getSession(auth.companyUuid, sessionUuid);
      if (!session) {
        return { content: [{ type: "text", text: "Session 不存在" }], isError: true };
      }

      if (session.agentUuid !== auth.actorUuid) {
        return { content: [{ type: "text", text: "无权操作此 Session" }], isError: true };
      }

      await sessionService.sessionCheckoutFromTask(auth.companyUuid, sessionUuid, taskUuid);

      return {
        content: [{ type: "text", text: "已成功 checkout" }],
      };
    }
  );

  // chorus_session_heartbeat - 心跳
  server.registerTool(
    "chorus_session_heartbeat",
    {
      description: "Session 心跳（更新 lastActiveAt）",
      inputSchema: z.object({
        sessionUuid: z.string().describe("Session UUID"),
      }),
    },
    async ({ sessionUuid }) => {
      const session = await sessionService.getSession(auth.companyUuid, sessionUuid);
      if (!session) {
        return { content: [{ type: "text", text: "Session 不存在" }], isError: true };
      }

      if (session.agentUuid !== auth.actorUuid) {
        return { content: [{ type: "text", text: "无权操作此 Session" }], isError: true };
      }

      await sessionService.heartbeatSession(auth.companyUuid, sessionUuid);

      return {
        content: [{ type: "text", text: `心跳成功: ${new Date().toISOString()}` }],
      };
    }
  );
}
