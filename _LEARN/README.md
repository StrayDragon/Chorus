# Chorus 学习索引（从产品到源码）

这份 `_LEARN/**` 是面向“全面理解 Chorus”的学习版文档集合：既提供推荐阅读路线，也提供可检索的源码地图与核心链路精读。它不替代仓库已有的 `README.md` / `docs/**`，而是把“为什么这样设计”与“代码落在哪里”连成一条可跟随的学习路径。

## 你现在可以从哪里开始

1. 先读：[`00_guide/reading-path.md`](./00_guide/reading-path.md)
2. 再读：[`40_architecture/system-overview.md`](./40_architecture/system-overview.md)
3. 然后跟着主链路精读：[`60_backend/core-flows.md`](./60_backend/core-flows.md)

## 四个视角入口

- 产品视角：[`10_product/value.md`](./10_product/value.md)
- 用户视角：[`20_user/journeys.md`](./20_user/journeys.md)
- 设计视角：[`30_design/information-architecture.md`](./30_design/information-architecture.md)
- 开发者视角（后端/前端/MCP）：  
  - 后端：[`60_backend/services-map.md`](./60_backend/services-map.md)  
  - 前端：[`70_frontend/app-router-map.md`](./70_frontend/app-router-map.md)  
  - MCP：[`80_mcp/mcp-overview.md`](./80_mcp/mcp-overview.md)

## 三条“主干链路”（建议按顺序理解）

1. **Idea → Elaboration → Proposal → Tasks**
   - 数据与状态机：[`40_architecture/state-machines.md`](./40_architecture/state-machines.md)
   - 端到端序列图：[`60_backend/core-flows.md`](./60_backend/core-flows.md)
2. **MCP 工具体系（Agent 如何接入 Chorus 并操作任务）**
   - MCP 接入与会话：[`80_mcp/mcp-overview.md`](./80_mcp/mcp-overview.md)
   - 工具目录（实现落点映射）：[`80_mcp/tools-catalog.md`](./80_mcp/tools-catalog.md)
3. **Realtime/SSE/Notifications（为什么 UI 会“自动刷新”）**
   - 事件总线与跨实例：[`40_architecture/realtime-events.md`](./40_architecture/realtime-events.md)
   - 通知生成链路：[`60_backend/core-flows.md`](./60_backend/core-flows.md)

## 源码地图（每个文件都能找到）

从这里进入“目录分册 + 文件级摘要表”：

- 总入口：[`99_codebase/index.md`](./99_codebase/index.md)
- `src` 总览：[`99_codebase/src/README.md`](./99_codebase/src/README.md)

## 术语表（强烈建议遇到不熟就回来看）

- [`00_guide/glossary.md`](./00_guide/glossary.md)

## 使用建议（如何读源码最快）

1. 先把“实体模型 + 状态机 + 事件链路”看懂：`prisma/schema.prisma` + `src/services/*` + `src/lib/event-bus.ts`
2. 再看“UI 如何把这些模型表现出来”：`src/app/(dashboard)` + `src/components`
3. 最后再看 “Agent 侧如何自动化”：`src/app/api/mcp/route.ts` + `src/mcp/tools/*`

