# 新增功能时，测试应该写在哪里

这份文档给出一个简单规则：**优先把业务真相测在 service 层，把协议/封装测在 tools/route 层，把 UI 结构契约测在关键组件附近。**

## 1) 你改的是业务规则（状态机/校验/事务/依赖）

落点：

- `src/services/__tests__/*.test.ts`

例子：

- 新增一个 Task 状态迁移规则 → 测 `task.service.ts` 的 transition 校验
- Proposal 校验规则变更 → 测 `proposal.service.ts` 的 `validateProposal`

## 2) 你改的是 REST API 行为（参数/响应/权限/错误码）

落点（两种选择）：

- 更推荐：测对应 service（因为 route 通常很薄）
- 必须测 route 时：在 `src/app/api/**/__tests__` 写（仓库已存在该目录）

## 3) 你改的是 MCP 工具（工具名、输入 schema、handler 逻辑）

落点：

- `src/mcp/__tests__/*.test.ts`

模式：

- fake McpServer 捕获 handler（见 `public-tools-task-ops.test.ts`）

## 4) 你改的是 UI 结构契约（例如过滤器必须渲染、按钮必须存在）

落点：

- 在对应模块附近的 `__tests__`（例如 tasks 视图已有结构性测试）
  - `src/app/(dashboard)/projects/[uuid]/tasks/__tests__/...`

建议：

- UI 单测优先测“结构契约”（是否渲染/是否把正确 props 传下去），避免过度 snapshot。

