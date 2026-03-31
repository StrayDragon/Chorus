# `packages/` 索引（Monorepo Packages）

根目录 `pnpm-workspace.yaml` 包含 `packages/*`，但显式排除了 `packages/openclaw-plugin`（仍在仓库里，只是不作为 workspace 包参与 pnpm 安装/构建）。

## 1) `packages/chorus-cdk`（AWS CDK）

用途：部署 Chorus 到 AWS（ECS/ALB/Aurora/Redis）。

关键入口：

- `lib/chorus-stack.ts`：组装 Network/Database/Cache/Service
- `lib/service.ts`：ECS Fargate + ALB HTTPS + 镜像构建 + 环境变量/secret 注入

完整文件列表：

```text
packages/chorus-cdk/bin/chorus.d.ts
packages/chorus-cdk/bin/chorus.js
packages/chorus-cdk/bin/chorus.ts
packages/chorus-cdk/cdk.json
packages/chorus-cdk/lib/cache.ts
packages/chorus-cdk/lib/chorus-stack.ts
packages/chorus-cdk/lib/database.ts
packages/chorus-cdk/lib/network.ts
packages/chorus-cdk/lib/service.ts
packages/chorus-cdk/package.json
packages/chorus-cdk/tsconfig.json
```

学习版文档：

- `_LEARN/90_ops/cdk.md`

## 2) `packages/openclaw-plugin`（OpenClaw 插件）

用途：作为外部客户端/插件侧的实现参考，通常负责：

- MCP client（连 `/api/mcp`）
- SSE listener（订阅 `/api/events` 等）
- 把 Chorus 的工具封装成更易用的命令/技能（skills）

> 注意：该包在 `pnpm-workspace.yaml` 被排除；如果你要单独开发它，需要单独安装依赖/构建。

完整文件列表：

```text
packages/openclaw-plugin/README.md
packages/openclaw-plugin/images/slug.png
packages/openclaw-plugin/openclaw.plugin.json
packages/openclaw-plugin/package.json
packages/openclaw-plugin/skills/chorus/SKILL.md
packages/openclaw-plugin/skills/develop/SKILL.md
packages/openclaw-plugin/skills/idea/SKILL.md
packages/openclaw-plugin/skills/proposal/SKILL.md
packages/openclaw-plugin/skills/quick-dev/SKILL.md
packages/openclaw-plugin/skills/review/SKILL.md
packages/openclaw-plugin/src/commands.ts
packages/openclaw-plugin/src/config.ts
packages/openclaw-plugin/src/event-router.ts
packages/openclaw-plugin/src/index.ts
packages/openclaw-plugin/src/mcp-client.ts
packages/openclaw-plugin/src/sse-listener.ts
packages/openclaw-plugin/src/tools/admin-tools.ts
packages/openclaw-plugin/src/tools/common-tools.ts
packages/openclaw-plugin/src/tools/dev-tools.ts
packages/openclaw-plugin/src/tools/pm-tools.ts
packages/openclaw-plugin/tsconfig.json
```

