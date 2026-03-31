# `src/app/` 文件级索引（App Router）

Chorus 使用 Next.js App Router。这里同时包含：

- 页面路由（dashboard/admin/login/onboarding）
- HTTP APIs（`src/app/api/**/route.ts`）
- 全局样式与根 layout

## 1) 根入口

| 文件 | 作用 |
|---|---|
| `src/app/layout.tsx` | Root layout（字体/metadata/LocaleProvider） |
| `src/app/page.tsx` | 根路径 `/`：检查 admin/user session 并重定向到 `/admin`/`/projects`/`/login` |
| `src/app/globals.css` | 全局样式 |
| `src/app/favicon.ico` | favicon |

## 2) Dashboard 区（主要工作区）

目录：`src/app/(dashboard)/`

特点：

- `layout.tsx` 是主壳（sidebar、search、notification、pixel widget、providers）
- 项目内页面路径都在 `/projects/{uuid}/...`

完整文件列表（含 server actions 与局部组件）：

```text
src/app/(dashboard)/layout.tsx
src/app/(dashboard)/project-groups/[uuid]/page.tsx
src/app/(dashboard)/projects/[uuid]/actions.ts
src/app/(dashboard)/projects/[uuid]/activity/page.tsx
src/app/(dashboard)/projects/[uuid]/dashboard/page.tsx
src/app/(dashboard)/projects/[uuid]/dashboard/project-settings-modal.tsx
src/app/(dashboard)/projects/[uuid]/documents/[documentUuid]/actions.ts
src/app/(dashboard)/projects/[uuid]/documents/[documentUuid]/document-actions.tsx
src/app/(dashboard)/projects/[uuid]/documents/[documentUuid]/document-content.tsx
src/app/(dashboard)/projects/[uuid]/documents/[documentUuid]/page.tsx
src/app/(dashboard)/projects/[uuid]/documents/actions.ts
src/app/(dashboard)/projects/[uuid]/documents/create-document-dialog.tsx
src/app/(dashboard)/projects/[uuid]/documents/page.tsx
src/app/(dashboard)/projects/[uuid]/ideas/[ideaUuid]/actions.ts
src/app/(dashboard)/projects/[uuid]/ideas/[ideaUuid]/activity-actions.ts
src/app/(dashboard)/projects/[uuid]/ideas/[ideaUuid]/comment-actions.ts
src/app/(dashboard)/projects/[uuid]/ideas/[ideaUuid]/elaboration-actions.ts
src/app/(dashboard)/projects/[uuid]/ideas/[ideaUuid]/page.tsx
src/app/(dashboard)/projects/[uuid]/ideas/actions.ts
src/app/(dashboard)/projects/[uuid]/ideas/assign-idea-modal.tsx
src/app/(dashboard)/projects/[uuid]/ideas/idea-create-form.tsx
src/app/(dashboard)/projects/[uuid]/ideas/idea-detail-panel.tsx
src/app/(dashboard)/projects/[uuid]/ideas/ideas-list.tsx
src/app/(dashboard)/projects/[uuid]/ideas/ideas-page-content.tsx
src/app/(dashboard)/projects/[uuid]/ideas/page.tsx
src/app/(dashboard)/projects/[uuid]/project-actions.tsx
src/app/(dashboard)/projects/[uuid]/proposals/[proposalUuid]/actions.ts
src/app/(dashboard)/projects/[uuid]/proposals/[proposalUuid]/comment-actions.ts
src/app/(dashboard)/projects/[uuid]/proposals/[proposalUuid]/page.tsx
src/app/(dashboard)/projects/[uuid]/proposals/[proposalUuid]/proposal-actions.tsx
src/app/(dashboard)/projects/[uuid]/proposals/[proposalUuid]/proposal-comments.tsx
src/app/(dashboard)/projects/[uuid]/proposals/[proposalUuid]/proposal-editor.tsx
src/app/(dashboard)/projects/[uuid]/proposals/[proposalUuid]/proposal-validation-checklist.tsx
src/app/(dashboard)/projects/[uuid]/proposals/[proposalUuid]/source-ideas-card.tsx
src/app/(dashboard)/projects/[uuid]/proposals/[proposalUuid]/task-draft-detail-panel.tsx
src/app/(dashboard)/projects/[uuid]/proposals/actions.ts
src/app/(dashboard)/projects/[uuid]/proposals/new/create-proposal-form.tsx
src/app/(dashboard)/projects/[uuid]/proposals/new/page.tsx
src/app/(dashboard)/projects/[uuid]/proposals/page.tsx
src/app/(dashboard)/projects/[uuid]/proposals/proposal-kanban.tsx
src/app/(dashboard)/projects/[uuid]/tasks/[taskUuid]/actions.ts
src/app/(dashboard)/projects/[uuid]/tasks/[taskUuid]/activity-actions.ts
src/app/(dashboard)/projects/[uuid]/tasks/[taskUuid]/comment-actions.ts
src/app/(dashboard)/projects/[uuid]/tasks/[taskUuid]/criteria-actions.ts
src/app/(dashboard)/projects/[uuid]/tasks/[taskUuid]/dependency-actions.ts
src/app/(dashboard)/projects/[uuid]/tasks/[taskUuid]/page.tsx
src/app/(dashboard)/projects/[uuid]/tasks/[taskUuid]/source-actions.ts
src/app/(dashboard)/projects/[uuid]/tasks/[taskUuid]/task-actions.tsx
src/app/(dashboard)/projects/[uuid]/tasks/[taskUuid]/task-status-progress.tsx
src/app/(dashboard)/projects/[uuid]/tasks/__tests__/dag-view-filtering.test.ts
src/app/(dashboard)/projects/[uuid]/tasks/__tests__/kanban-proposal-filter.test.ts
src/app/(dashboard)/projects/[uuid]/tasks/__tests__/task-view-toggle-proposal-filter.test.ts
src/app/(dashboard)/projects/[uuid]/tasks/actions.ts
src/app/(dashboard)/projects/[uuid]/tasks/assign-task-modal.tsx
src/app/(dashboard)/projects/[uuid]/tasks/dag-view.tsx
src/app/(dashboard)/projects/[uuid]/tasks/kanban-board.tsx
src/app/(dashboard)/projects/[uuid]/tasks/page.tsx
src/app/(dashboard)/projects/[uuid]/tasks/session-actions.ts
src/app/(dashboard)/projects/[uuid]/tasks/task-detail-panel.tsx
src/app/(dashboard)/projects/[uuid]/tasks/task-view-toggle.tsx
src/app/(dashboard)/projects/[uuid]/tasks/tasks-page-content.tsx
src/app/(dashboard)/projects/new/actions.ts
src/app/(dashboard)/projects/new/page.tsx
src/app/(dashboard)/projects/page.tsx
src/app/(dashboard)/settings/actions.ts
src/app/(dashboard)/settings/page.tsx
```

## 3) Admin / Login / Onboarding

Admin：

```text
src/app/admin/layout.tsx
src/app/admin/page.tsx
src/app/admin/companies/page.tsx
src/app/admin/companies/new/page.tsx
src/app/admin/companies/[uuid]/page.tsx
```

Login：

```text
src/app/login/page.tsx
src/app/login/callback/page.tsx
src/app/login/silent-refresh/page.tsx
src/app/login/admin/page.tsx
```

Onboarding：

```text
src/app/onboarding/page.tsx
src/app/onboarding/components/CodeBlock.tsx
src/app/onboarding/components/CompletionStep.tsx
src/app/onboarding/components/CopyKeyStep.tsx
src/app/onboarding/components/CreateAgentStep.tsx
src/app/onboarding/components/InstallGuideStep.tsx
src/app/onboarding/components/OnboardingWizard.tsx
src/app/onboarding/components/StepIndicator.tsx
src/app/onboarding/components/TestConnectionStep.tsx
src/app/onboarding/components/WelcomeStep.tsx
```

## 4) API 子册

见：[`api/README.md`](./api/README.md)

