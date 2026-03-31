# 源码地图总入口（_LEARN/99_codebase）

目标：你可以把 Chorus 的任意概念快速定位到“应该看哪个文件/目录”。

## 1) 仓库顶层结构（推荐从这里认路）

| 路径 | 作用 |
|---|---|
| `src/` | 主应用代码（Next.js App Router + services + MCP） |
| `prisma/` | Prisma schema 与 migrations（PostgreSQL） |
| `docs/` | 官方文档（PRD/Architecture/MCP tools/Design notes） |
| `packages/chorus-cdk/` | AWS CDK 部署（ECS/ALB/Aurora/Redis） |
| `packages/openclaw-plugin/` | OpenClaw 插件（注意 pnpm workspace 默认排除该包） |
| `messages/` | 文案/国际化资源（与 `src/i18n/**` 配合） |
| `public/` | 静态资源（图标等） |
| `scripts/` | 脚本（安装/辅助） |

顶层关键文件（你会经常点开）：

- `README.md` / `README.zh.md`：产品定位与功能总览
- `docs/ARCHITECTURE.md`：技术架构
- `docs/PRD_Chorus.zh.md`：PRD（含方法论与价值）
- `package.json`：脚本与依赖（Next 15 / React 19 / Prisma 7）
- `docker-compose.yml`：本地一键启动 DB/Redis

## 2) 分册索引

- `src/`：[`src/README.md`](./src/README.md)
- `prisma/`：[`prisma/README.md`](./prisma/README.md)
- `packages/`：[`packages/README.md`](./packages/README.md)
- `docs/`：[`docs/README.md`](./docs/README.md)
- `messages/`：[`messages/README.md`](./messages/README.md)
- `scripts/`：[`scripts/README.md`](./scripts/README.md)
- `public/`：[`public/README.md`](./public/README.md)
