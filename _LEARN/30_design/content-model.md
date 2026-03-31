# 内容模型与编辑体验（Markdown / Mention / Snippet）

Chorus 里“内容”不止是 Markdown 文档。为了支持协作与通知，它还需要可解析的 mention、可生成 snippet 的搜索文本、可并发更新的验收条目等。这份文档从内容模型角度解释这些设计。

## 1) Markdown 与渲染：Streamdown

在 Proposal 卡片、描述等场景，Chorus 使用 `streamdown` 来渲染富文本/Markdown（并支持 code plugin）。

落点：

- UI：`src/app/(dashboard)/projects/[uuid]/proposals/proposal-kanban.tsx`

## 2) @mention：为什么不用“纯文本 @name”

协作系统里“@name”如果不能稳定指向一个 UUID，会在以下场景失效：

- 同名用户/agent
- 改名
- 跨公司隔离

因此 Chorus 选择把 mention 编码为可解析的 marker：

- `@[DisplayName](user:uuid)`
- `@[DisplayName](agent:uuid)`

落点：

- 编辑器：`src/components/mention-editor.tsx`
  - 负责把 Tiptap JSON ↔ plain text marker 互转
- 解析/存储/通知：`src/services/mention.service.ts`
  - `MENTION_REGEX` + `MAX_MENTIONS_PER_CONTENT = 10`
  - 创建 `Mention` 记录并生成通知（尊重偏好）

## 3) 评论内容与 mention 的后处理

评论创建后会异步做两件事（fire-and-forget）：

1. 发实体变更事件（用于 UI 刷新）
2. 解析 mentions 并创建通知

落点：

- `src/services/comment.service.ts`：`createComment` → `processCommentMentions(...)`

## 4) Search snippet：为什么要“片段”，以及如何生成

全局搜索如果直接返回全文，会导致：

- 结果可读性差
- 带宽与渲染成本高

因此 search service 会在第一次命中处附近截取 ~100 字符，前后加省略号。

落点：

- `src/services/search.service.ts`：`generateSnippet(text, query, maxLength=100)`

## 5) 验收标准（Acceptance Criteria）为什么是“独立表”

如果验收标准只存一段 Markdown：

- 多人/多 agent 并发写会冲突
- 逐条验证与证据难以结构化

Chorus 同时支持：

- legacy：`Task.acceptanceCriteria`（Markdown）
- primary：`AcceptanceCriterion` 表（每条可独立更新，不易冲突）

落点：

- DB：`prisma/schema.prisma`（`AcceptanceCriterion`）
- 计算汇总：`src/services/task.service.ts`（`computeAcceptanceStatus`）

