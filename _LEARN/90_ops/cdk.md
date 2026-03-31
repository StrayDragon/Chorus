# AWS CDK 部署（packages/chorus-cdk）

Chorus 提供一个 CDK 工程（`packages/chorus-cdk`），用于一键部署到 AWS（ECS + ALB + Aurora Serverless v2 + ElastiCache Serverless Redis）。

> 这是学习版概览。实际部署参数以 CDK 代码与 `cdk.json` 为准。

## 1) 组成结构

- `lib/network.ts`
  - VPC（2 AZ，public + private with egress）
  - S3 Gateway Endpoint
  - SG：service 与 db
- `lib/database.ts`
  - Aurora Serverless v2 Postgres（17.6）
  - Secrets Manager：
    - DB credential（自动生成 user/password）
    - App config（SUPER_ADMIN_EMAIL / SUPER_ADMIN_PASSWORD_HASH / NEXTAUTH_SECRET）
- `lib/cache.ts`
  - ElastiCache Serverless Redis 7
  - RBAC：创建 `chorus` 用户并生成 password secret
  - UserGroup：包含 AWS 内置 `default` 用户 + `chorus` 用户
- `lib/service.ts`
  - ECS Fargate service
  - ALB（HTTPS 443 + ACM cert）
  - 自定义域名（条件规则）
  - DockerImageAsset：从仓库根目录构建（排除 packages/node_modules/.git/.next 等）
  - 注入环境变量与 secrets（DB/Redis/super-admin/nextauth）
- `lib/chorus-stack.ts`
  - 组装 Network + Database + Cache + Service

## 2) 关键配置参数（ChorusStackProps）

见 `packages/chorus-cdk/lib/chorus-stack.ts`：

- `acmCertificateArn`
- `customDomain`（空字符串则仅用 ALB DNS）
- `superAdminEmail`
- `superAdminPasswordHash`
- `nextAuthSecret`

## 3) 运行命令

根目录 scripts 已封装：

```bash
pnpm cdk:build
pnpm cdk:synth
pnpm cdk:deploy
pnpm cdk:diff
pnpm cdk:destroy
```

## 4) 与 Realtime 的关系（Redis）

CDK 里 Redis 以 Secrets 注入：

- app 侧用 `REDIS_HOST/REDIS_PORT/REDIS_USERNAME/REDIS_PASSWORD`
- `src/lib/redis.ts` 会拼成 `rediss://...`（TLS）

Realtime 跨实例依赖 Redis pub/sub（见 `src/lib/event-bus.ts`）。

