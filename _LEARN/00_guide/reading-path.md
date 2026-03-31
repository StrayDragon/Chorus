# 推荐阅读路线（Learning Paths）

这份路线图的目标是：**你能在 30 分钟内掌握 Chorus 的主干结构**，并在 2-4 小时内具备“能改代码且不迷路”的整体认知。

## 通用路线（建议所有人都走一遍）

1. 产品与方法论：`README.md` + `docs/PRD_Chorus.zh.md`
2. 技术架构总览：`docs/ARCHITECTURE.md`（建议同时配合阅读）  
   学习版入口：[`40_architecture/system-overview.md`](../40_architecture/system-overview.md)
3. 端到端主链路精读（含序列图）：[`60_backend/core-flows.md`](../60_backend/core-flows.md)
4. 最后再看源码地图：[`99_codebase/index.md`](../99_codebase/index.md)

## 你是产品/PM（想理解价值、边界、工作流）

1. [`10_product/value.md`](../10_product/value.md)
2. [`20_user/journeys.md`](../20_user/journeys.md)
3. [`40_architecture/state-machines.md`](../40_architecture/state-machines.md)
4. 参考：`docs/DESIGN_REQUIREMENTS_ELABORATION.md`（需求澄清设计）

## 你是后端开发（想从 DB/Service/API 入手）

1. 先看数据模型：`prisma/schema.prisma` + [`40_architecture/data-model.md`](../40_architecture/data-model.md)
2. 再看服务层地图：[`60_backend/services-map.md`](../60_backend/services-map.md)
3. 跟着主链路走一遍：[`60_backend/core-flows.md`](../60_backend/core-flows.md)
4. API 约定与错误处理：[`60_backend/api-conventions.md`](../60_backend/api-conventions.md)
5. Realtime/通知：[`40_architecture/realtime-events.md`](../40_architecture/realtime-events.md)

## 你是前端开发（想理解页面结构、实时刷新、交互复杂点）

1. 页面地图：[`70_frontend/app-router-map.md`](../70_frontend/app-router-map.md)
2. Task 三视图：Kanban/DAG/List（从 `tasks-page-content.tsx` 追进去）
3. Global Search、@mention、Notifications：[`30_design/information-architecture.md`](../30_design/information-architecture.md)
4. Realtime provider / router.refresh 的机制：[`40_architecture/realtime-events.md`](../40_architecture/realtime-events.md)

## 你在做 Agent / MCP（想接入工具、做编排）

1. MCP Endpoint 与 session 复用：[`80_mcp/mcp-overview.md`](../80_mcp/mcp-overview.md)
2. 工具目录与实现映射：[`80_mcp/tools-catalog.md`](../80_mcp/tools-catalog.md)
3. Session checkin/checkout 与任务可观测性：[`80_mcp/agent-lifecycle.md`](../80_mcp/agent-lifecycle.md)

## 你在做部署/运维（Docker/CDK/云上）

1. 本地运行：[`90_ops/local-dev.md`](../90_ops/local-dev.md)
2. CDK 部署：[`90_ops/cdk.md`](../90_ops/cdk.md)
3. Realtime 跨实例（Redis Pub/Sub）：[`40_architecture/realtime-events.md`](../40_architecture/realtime-events.md)

