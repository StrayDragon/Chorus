# `prisma/` 索引（Schema + Migrations）

入口文件：

- `prisma/schema.prisma`
  - generator output：`src/generated/prisma`
  - datasource：PostgreSQL（`relationMode = "prisma"`）

## 1) 迁移列表（按时间）

> 说明：这里只列出文件索引与“从名字推断的主题”。要看具体 DDL 请打开对应 `migration.sql`。

```text
prisma/migrations/20260204102157_init/migration.sql
prisma/migrations/20260205084425_add_relation_mode_indexes/migration.sql
prisma/migrations/20260205090016_add_claim_fields/migration.sql
prisma/migrations/20260206073200_uuid_based_architecture/migration.sql
prisma/migrations/20260207030254_activity_generic_target/migration.sql
prisma/migrations/20260210070127_add_task_dependency/migration.sql
prisma/migrations/20260210094608_add_agent_sessions/migration.sql
prisma/migrations/20260219051531_add_notification_models/migration.sql
prisma/migrations/20260224054753_add_idea_elaboration_fields/migration.sql
prisma/migrations/20260224055445_elaboration_rounds_tables/migration.sql
prisma/migrations/20260224060318_add_elaboration_notification_prefs/migration.sql
prisma/migrations/20260225090729_add_project_group/migration.sql
prisma/migrations/20260226031645_add_mention_model/migration.sql
prisma/migrations/20260311035011_add_acceptance_criterion_table/migration.sql
prisma/migrations/migration_lock.toml
```

## 2) 读 schema 时建议关注的设计点

- UUID-first：对外统一 UUID（每个表 `uuid` unique）
- Multi-tenant：几乎所有表都有 `companyUuid`
- 多态关联：assignee/recipient/author/actor/createdBy 等字段多用 (type, uuid)
- Task DAG：`TaskDependency`
- Session/Checkin：`AgentSession` + `SessionTaskCheckin`
- Notification + Preference：支持偏好开关与 unread 统计
- AcceptanceCriterion：结构化验收条目（并发友好）

学习版数据模型图：

- `_LEARN/40_architecture/data-model.md`

