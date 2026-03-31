# 本地开发与运行（pnpm / Docker / Prisma）

> 这份文档面向“在本机把 Chorus 跑起来并能开发”的最短路径。更详细的 Docker 镜像说明可参考 `docs/DOCKER.md`。

## 1) 前置依赖

- Node.js（仓库使用 `node:22` 作为 Docker base）
- pnpm（见根目录 `package.json`: `pnpm@9.15.0`）
- PostgreSQL + Redis（可用 docker compose 一键起）

## 2) 一键起 DB + Redis（推荐）

```bash
pnpm docker:db
```

等价于：

```bash
docker compose up -d db redis
```

默认端口：

- Postgres：host `5433` → container `5432`（见 `docker-compose.yml`）
- Redis：`6379`

## 3) 配置环境变量

参考 `.env.example` 与 `docs/DOCKER.md`。

最小集合（本地）：

- `DATABASE_URL=postgresql://chorus:chorus@localhost:5433/chorus`
- `REDIS_URL=redis://default:chorus-redis@localhost:6379`
- `NEXTAUTH_SECRET=...`

如果想用“默认账号密码登录”（无需 OIDC）：

- `DEFAULT_USER=admin@example.com`
- `DEFAULT_PASSWORD=your-password`

## 4) 初始化数据库（migrate）

```bash
pnpm db:migrate:dev
pnpm db:generate
```

或者用 `db:push`（不建议在严肃环境替代 migrate）。

## 5) 启动开发服务器

```bash
pnpm dev
```

默认使用 `next dev --turbopack`。如果遇到兼容问题可用：

```bash
pnpm dev:webpack
```

## 6) 运行测试

```bash
pnpm test
pnpm test:watch
pnpm test:coverage
```

## 7) 常见问题

- 页面实时刷新不工作：检查 Redis 是否启用（多实例时更重要）；单机开发不启用 Redis 也能本地 emit，但跨实例不会同步。
- 登录 401：检查 `NEXTAUTH_SECRET` 是否设置；default auth 需 `DEFAULT_USER/DEFAULT_PASSWORD`。

