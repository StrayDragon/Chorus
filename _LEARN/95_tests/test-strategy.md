# 测试策略（Vitest）

Chorus 主要使用 Vitest 做单元测试，重点覆盖 service 层与 lib 层的业务逻辑。前端交互多数依赖 RSC + router.refresh，因此目前更偏“后端/逻辑单测”，而不是大量 E2E。

## 1) 测试入口与范围

- 配置：`vitest.config.ts`
  - include：`src/**/__tests__/**/*.test.ts`
  - 覆盖率统计：主要统计 `src/services/**/*.ts` 与 `src/lib/**/*.ts`
  - exclude：`src/lib/prisma.ts`、`src/lib/redis.ts`（基础设施层通常更难稳定单测）
  - thresholds：lines/statements 95% 等（要求较高）

## 2) 常见测试风格

### 2.1 Service 单测：大量使用模块 mock + fixture factories

示例：

- `src/services/__tests__/task.service.test.ts`
  - `vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }))`
  - `vi.mock("@/lib/event-bus", ...)`
  - 使用 `src/__test-utils__/fixtures.ts` 生成实体数据（makeTask/makeIdea/…）

这种风格的优点：

- 不需要真实 DB
- 能精确覆盖状态机/边界条件/事件触发

代价：

- mock 维护成本高
- 需要谨慎保证 mock 与真实 Prisma shape 一致

### 2.2 MCP 工具单测：用 fake McpServer 捕获 registerTool handler

示例：

- `src/mcp/__tests__/public-tools-task-ops.test.ts`
  - 自己实现 `fakeMcpServer.registerTool(name, meta, handler)`
  - 然后直接调用 `toolHandlers[name](params)` 做断言

优点：

- 不需要跑 MCP server
- 工具的权限/校验/调用 service 的契约可以被直接验证

## 3) Fixture 工厂（统一 mock 数据）

- `src/__test-utils__/fixtures.ts`
  - `makeTask/makeIdea/makeProposal/...`
  - `authContexts`（user/agent/pm/admin/superAdmin）

建议：

- 新增测试时优先复用 fixtures，避免在测试里散落 UUID/时间戳常量。

