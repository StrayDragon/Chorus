# `src/components/` 文件级索引

这里是 Chorus 的“业务 UI 组件库”，包含全局搜索、通知、@mention 编辑器、elaboration 面板、像素工作室等。

> 相关学习版文档：`_LEARN/70_frontend/components-map.md`

## 1) 业务组件（顶层）

| 文件 | 作用（摘要） |
|---|---|
| `AgentCreateForm.tsx` | 创建 Agent 的表单（onboarding/设置中使用） |
| `animated-empty-state.tsx` | 空状态动效组件 |
| `assign-modal.tsx` | 指派/认领弹窗（Idea/Task 通用） |
| `create-project-dialog.tsx` | 创建项目弹窗 |
| `create-project-group-dialog.tsx` | 创建项目组弹窗 |
| `manage-project-group-dialog.tsx` | 管理项目组弹窗 |
| `move-project-confirm-dialog.tsx` | 移动项目到组的确认弹窗 |
| `elaboration-panel.tsx` | 需求澄清面板（rounds/questions/answers） |
| `global-search.tsx` | Cmd+K 全局搜索（scope + types + keyboard nav） |
| `markdown-content.tsx` | Markdown 渲染封装（轻量） |
| `mention-editor.tsx` | Tiptap mention editor（marker ↔ JSON 转换） |
| `mention-renderer.tsx` | mention marker 的展示渲染 |
| `notification-bell.tsx` | 通知铃铛入口 |
| `notification-popup.tsx` | 通知列表弹层（all/unread + mark read） |
| `notification-preferences-form.tsx` | 通知偏好设置表单 |
| `page-transition.tsx` | 页面切换动效包装 |
| `pixel-canvas.tsx` | 像素画布主实现（实时状态视觉化） |
| `pixel-canvas-widget.tsx` | 嵌入式像素组件（layout 中使用） |
| `proposal-filter.tsx` | 任务视图的 proposalUuids 过滤器（URL search params） |
| `stagger-list.tsx` | 列表 stagger 动效 |

完整文件列表：

```text
src/components/AgentCreateForm.tsx
src/components/animated-empty-state.tsx
src/components/assign-modal.tsx
src/components/create-project-dialog.tsx
src/components/create-project-group-dialog.tsx
src/components/elaboration-panel.tsx
src/components/global-search.tsx
src/components/manage-project-group-dialog.tsx
src/components/markdown-content.tsx
src/components/mention-editor.tsx
src/components/mention-renderer.tsx
src/components/move-project-confirm-dialog.tsx
src/components/notification-bell.tsx
src/components/notification-popup.tsx
src/components/notification-preferences-form.tsx
src/components/page-transition.tsx
src/components/pixel-canvas-widget.tsx
src/components/pixel-canvas.tsx
src/components/proposal-filter.tsx
src/components/stagger-list.tsx
```

测试文件列表：

```text
src/components/__tests__/proposal-filter.test.ts
```

## 2) `src/components/ui/`（shadcn/ui 基础组件）

完整文件列表：

```text
src/components/ui/alert-dialog.tsx
src/components/ui/avatar.tsx
src/components/ui/badge.tsx
src/components/ui/button.tsx
src/components/ui/card.tsx
src/components/ui/checkbox.tsx
src/components/ui/collapsible.tsx
src/components/ui/command.tsx
src/components/ui/dialog.tsx
src/components/ui/input.tsx
src/components/ui/label.tsx
src/components/ui/popover.tsx
src/components/ui/progress.tsx
src/components/ui/radio-group.tsx
src/components/ui/scroll-area.tsx
src/components/ui/select.tsx
src/components/ui/separator.tsx
src/components/ui/sheet.tsx
src/components/ui/skeleton.tsx
src/components/ui/switch.tsx
src/components/ui/table.tsx
src/components/ui/tabs.tsx
src/components/ui/textarea.tsx
src/components/ui/tooltip.tsx
```
