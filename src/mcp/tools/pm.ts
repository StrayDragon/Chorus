// src/mcp/tools/pm.ts
// PM Agent 专属 MCP 工具 (ARCHITECTURE.md §5.2)

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { AgentAuthContext } from "@/types/auth";
import * as projectService from "@/services/project.service";
import * as ideaService from "@/services/idea.service";
import * as proposalService from "@/services/proposal.service";

export function registerPmTools(server: McpServer, auth: AgentAuthContext) {
  // chorus_claim_idea - 认领 Idea
  server.registerTool(
    "chorus_claim_idea",
    {
      description: "认领一个 Idea（open → assigned）",
      inputSchema: z.object({
        ideaUuid: z.string().describe("Idea UUID"),
      }),
    },
    async ({ ideaUuid }) => {
      const idea = await ideaService.getIdeaById(auth.companyId, ideaUuid);
      if (!idea) {
        return { content: [{ type: "text", text: "Idea 不存在" }], isError: true };
      }

      if (idea.status !== "open") {
        return { content: [{ type: "text", text: "只能认领 open 状态的 Idea" }], isError: true };
      }

      const updated = await ideaService.claimIdea({
        ideaId: idea.id,
        assigneeType: "agent",
        assigneeId: auth.actorId,
      });

      return {
        content: [{ type: "text", text: JSON.stringify(updated, null, 2) }],
      };
    }
  );

  // chorus_release_idea - 放弃认领 Idea
  server.registerTool(
    "chorus_release_idea",
    {
      description: "放弃认领 Idea（assigned → open）",
      inputSchema: z.object({
        ideaUuid: z.string().describe("Idea UUID"),
      }),
    },
    async ({ ideaUuid }) => {
      const idea = await ideaService.getIdeaById(auth.companyId, ideaUuid);
      if (!idea) {
        return { content: [{ type: "text", text: "Idea 不存在" }], isError: true };
      }

      if (idea.status !== "assigned") {
        return { content: [{ type: "text", text: "只能放弃 assigned 状态的 Idea" }], isError: true };
      }

      // 检查是否是认领者
      const isAssignee =
        (idea.assigneeType === "agent" && idea.assigneeId === auth.actorId) ||
        (idea.assigneeType === "user" && auth.ownerId && idea.assigneeId === auth.ownerId);

      if (!isAssignee) {
        return { content: [{ type: "text", text: "只有认领者可以放弃认领" }], isError: true };
      }

      const updated = await ideaService.releaseIdea(idea.id);

      return {
        content: [{ type: "text", text: JSON.stringify(updated, null, 2) }],
      };
    }
  );

  // chorus_update_idea_status - 更新 Idea 状态
  server.registerTool(
    "chorus_update_idea_status",
    {
      description: "更新 Idea 状态（仅认领者可操作）",
      inputSchema: z.object({
        ideaUuid: z.string().describe("Idea UUID"),
        status: z.enum(["in_progress", "pending_review", "completed"]).describe("新状态"),
      }),
    },
    async ({ ideaUuid, status }) => {
      const idea = await ideaService.getIdeaById(auth.companyId, ideaUuid);
      if (!idea) {
        return { content: [{ type: "text", text: "Idea 不存在" }], isError: true };
      }

      // 检查是否是认领者
      const isAssignee =
        (idea.assigneeType === "agent" && idea.assigneeId === auth.actorId) ||
        (idea.assigneeType === "user" && auth.ownerId && idea.assigneeId === auth.ownerId);

      if (!isAssignee) {
        return { content: [{ type: "text", text: "只有认领者可以更新状态" }], isError: true };
      }

      // 验证状态转换
      if (!ideaService.isValidIdeaStatusTransition(idea.status, status)) {
        return {
          content: [{ type: "text", text: `无效的状态转换: ${idea.status} → ${status}` }],
          isError: true,
        };
      }

      const updated = await ideaService.updateIdea(idea.id, { status });

      return {
        content: [{ type: "text", text: JSON.stringify(updated, null, 2) }],
      };
    }
  );

  // chorus_pm_create_proposal - 创建提议
  server.registerTool(
    "chorus_pm_create_proposal",
    {
      description: "创建提议（PRD/任务拆分/技术方案）",
      inputSchema: z.object({
        projectUuid: z.string().describe("项目 UUID"),
        title: z.string().describe("提议标题"),
        description: z.string().optional().describe("提议描述"),
        inputType: z.enum(["idea", "document"]).describe("输入类型"),
        inputIds: z.array(z.number()).describe("输入 ID 列表"),
        outputType: z.enum(["document", "task"]).describe("输出类型"),
        outputData: z.record(z.string(), z.unknown()).describe("输出数据（Document 草稿或 Task 列表）"),
      }),
    },
    async ({ projectUuid, title, description, inputType, inputIds, outputType, outputData }) => {
      const projectId = await projectService.getProjectIdByUuid(auth.companyId, projectUuid);
      if (!projectId) {
        return { content: [{ type: "text", text: "项目不存在" }], isError: true };
      }

      const proposal = await proposalService.createProposal({
        companyId: auth.companyId,
        projectId,
        title,
        description,
        inputType,
        inputIds,
        outputType,
        outputData,
        createdBy: auth.actorId,
      });

      return {
        content: [{ type: "text", text: JSON.stringify(proposal, null, 2) }],
      };
    }
  );
}
