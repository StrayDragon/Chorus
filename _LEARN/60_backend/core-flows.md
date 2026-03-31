# 核心链路精读（End-to-End）

这份文档把 Chorus 最重要的几条链路用“可执行的追踪方式”写清楚：你可以跟着每一步去点开对应文件，理解系统如何从 UI/MCP 走到 service/DB，再走回 realtime/notifications。

## Flow 0: AI-DLC 主流程（全景）

```mermaid
flowchart TD
  A[Idea: open] -->|claim| B[Idea: elaborating]
  B -->|start elaboration| C[ElaborationRound: pending_answers]
  C -->|answer| D[ElaborationRound: answered]
  D -->|validate ok| E[Idea.elaborationStatus: resolved]
  E -->|create proposal| F[Proposal: draft]
  F -->|submit| G[Proposal: pending]
  G -->|approve| H[Proposal: approved]
  H --> I[Document(s)]
  H --> J[Task(s) + DAG]
  J -->|execute| K[Task: in_progress/to_verify/done]
```

关键落点：

- 数据：`prisma/schema.prisma`
- Idea：`src/services/idea.service.ts`
- Elaboration：`src/services/elaboration.service.ts`
- Proposal：`src/services/proposal.service.ts`
- Tasks：`src/services/task.service.ts`

## Flow 1: MCP Session 建立与复用（含 404 重建）

入口：

- MCP endpoint：`src/app/api/mcp/route.ts`
- server/tool 装配：`src/mcp/server.ts`

```mermaid
sequenceDiagram
  autonumber
  participant Agent as Agent Client
  participant MCP as POST /api/mcp
  participant Auth as validateApiKey()
  participant Sess as sessions Map
  participant Srv as createMcpServer()

  Agent->>MCP: POST (Authorization: Bearer cho_..., mcp-session-id?)
  MCP->>Auth: validateApiKey(cho_...)
  Auth-->>MCP: agent + roles + companyUuid

  alt mcp-session-id exists and found
    MCP->>Sess: get(sessionId)
    Sess-->>MCP: transport
  else mcp-session-id exists but not found
    MCP-->>Agent: 404 jsonrpc error (-32001)
  else no mcp-session-id
    MCP->>Sess: create new transport + new sessionId
    MCP->>Srv: createMcpServer(auth) + connect(transport)
    MCP->>Sess: sessions.set(sessionId, transport)
  end

  MCP-->>Agent: transport.handleRequest response
```

学习点：

- sessions 是内存 Map，server 重启会丢；客户端应对 404 自动 reinit（`docs/MCP_TOOLS.md` 也有说明）。
- 工具集按 roles 装配（Public/Session/PM/Developer/Admin）。

## Flow 2: Proposal 提交（draft → pending）与完整校验

入口：

- service：`src/services/proposal.service.ts`（`submitProposal` / `validateProposal`）

```mermaid
sequenceDiagram
  autonumber
  participant UI as UI / MCP
  participant Svc as proposal.service.ts
  participant DB as Prisma
  participant SSE as eventBus.emitChange

  UI->>Svc: submitProposal(proposalUuid, companyUuid)
  Svc->>DB: load Proposal (uuid, companyUuid)
  alt status != draft
    Svc-->>UI: error "Only draft proposals..."
  else draft
    Svc->>Svc: validateProposal()
    Svc->>DB: load proposal drafts + inputUuids
    Note over Svc: E1 docDraft>=1<br/>E2 each doc content>=100<br/>E3 taskDraft>=1<br/>E4 inputUuids non-empty<br/>E5 input ideas elaborationStatus=resolved<br/>E-AC each task draft has acceptanceCriteriaItems
    alt validation invalid
      Svc-->>UI: error with issue list
    else valid
      Svc->>DB: update Proposal.status = pending
      Svc->>DB: if inputType=idea: update Idea.status elaborating -> proposal_created
      Svc->>SSE: emitChange(entityType="proposal", action="updated")
      Svc-->>UI: updated Proposal
    end
  end
```

你排查“为什么提交失败”时，就去看 `validateProposal` 的 issue 列表：它是最关键的“质量闸门”之一。

## Flow 3: Proposal 审批（pending → approved）并物化 Document/Task/DAG

入口：

- service：`src/services/proposal.service.ts`（`approveProposal`）

```mermaid
sequenceDiagram
  autonumber
  participant Admin as Admin/Human
  participant Svc as proposal.service.ts
  participant TX as prisma.$transaction
  participant Doc as createDocumentFromProposal
  participant Task as createTasksFromProposal
  participant DB as Prisma
  participant SSE as eventBus.emitChange

  Admin->>Svc: approveProposal(proposalUuid, companyUuid, reviewedByUuid)
  Svc->>DB: find Proposal
  Svc->>TX: begin
  TX->>DB: update Proposal.status=approved + reviewedAt
  alt has documentDrafts
    TX->>Doc: createDocumentFromProposal(...) per draft
  end
  alt has taskDrafts
    Note over TX: validate acceptanceCriteriaItems<br/>then materialize tasks + dependencies
    TX->>Task: createTasksFromProposal(...)
  end
  TX-->>Svc: commit + return mappings
  Svc->>SSE: emitChange(entityType="proposal", action="updated")
  Svc->>DB: if inputType=idea: update Idea.status proposal_created -> completed
  Svc-->>Admin: ApprovalResult (includes draftUuid → realUuid mapping)
```

学习点：

- 物化是事务内完成，避免“proposal 状态已 approved 但 artifacts 半失败”的不一致。
- tasks 物化前会再次校验 `acceptanceCriteriaItems` 的描述有效性。

## Flow 4: Task 执行可观测性（Session checkin → UI worker badges）

入口：

- MCP 工具：`src/mcp/tools/session.ts`（`chorus_session_checkin_task`）
- service：`src/services/session.service.ts`（`sessionCheckinToTask`）
- realtime：`src/app/api/events/route.ts` + `src/contexts/realtime-context.tsx`

```mermaid
sequenceDiagram
  autonumber
  participant Agent as Developer Agent
  participant MCP as chorus_session_checkin_task
  participant SessSvc as session.service.ts
  participant TaskSvc as task.service.ts
  participant DB as Prisma
  participant Bus as eventBus.emitChange
  participant SSE as /api/events
  participant UI as Browser (RealtimeProvider)

  Agent->>MCP: checkin(sessionUuid, taskUuid)
  MCP->>SessSvc: sessionCheckinToTask(companyUuid, sessionUuid, taskUuid)
  SessSvc->>DB: verify session active + task exists
  alt task has no assignee
    SessSvc->>TaskSvc: claimTask(...) (best-effort)
  end
  SessSvc->>DB: upsert SessionTaskCheckin(checkoutAt=null)
  SessSvc->>DB: update AgentSession.lastActiveAt
  SessSvc->>Bus: emitChange(entityType="task", action="updated")
  Bus-->>SSE: SSE push
  SSE-->>UI: event message
  UI->>UI: throttle/debounce router.refresh()
  UI-->>UI: Kanban worker badge updates on refreshed data
```

## Flow 5: 通知链路（Activity → Notification → SSE）

入口：

- activity：`src/services/activity.service.ts`
- listener：`src/services/notification-listener.ts`
- notification service：`src/services/notification.service.ts`
- SSE：`src/app/api/events/notifications/route.ts`

```mermaid
sequenceDiagram
  autonumber
  participant Svc as Any service
  participant Act as activity.service.ts
  participant Bus as eventBus
  participant Listener as notification-listener.ts
  participant Notif as notification.service.ts
  participant SSE as /api/events/notifications
  participant UI as NotificationProvider

  Svc->>Act: createActivity(...)
  Act->>Bus: emit("activity", event)
  Bus-->>Listener: on("activity", event)
  Listener->>Listener: resolve type + recipients + prefs
  Listener->>Notif: create/createBatch(...)
  Notif->>Bus: emit("notification:{type}:{uuid}", {unreadCount,...})
  Bus-->>SSE: SSE push (cookie auth scoped)
  SSE-->>UI: new_notification event
  UI->>UI: update unreadCount + refresh popup list
```

补充：

- @mention 通知是另一条路径：`mention.service.ts` 直接调用 `notificationService.createBatch`（不一定经过 activity）。

