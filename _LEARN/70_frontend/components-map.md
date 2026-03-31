# UI 组件地图（src/components）

`src/components/**` 大致分两类：

1. 业务组件（domain components）：围绕 Chorus 的实体与协作体验
2. UI 基础组件（shadcn/ui）：位于 `src/components/ui/**`

## 1) 业务组件分组

### 1.1 Search（信息查找）

- `global-search.tsx`：Cmd+K 全局搜索（scope + type filter + keyboard nav）
- `proposal-filter.tsx`：Tasks/DAG 视图中的 proposalUuids 过滤器

### 1.2 协作与通知（Collaboration）

- `notification-bell.tsx`：右上角铃铛入口
- `notification-popup.tsx`：通知列表弹层（Tabs: all/unread + mark all read）
- `notification-preferences-form.tsx`：通知偏好设置（对应 `NotificationPreference`）
- `assign-modal.tsx`：指派/认领弹窗（Idea/Task）

### 1.3 需求澄清（Elaboration）

- `elaboration-panel.tsx`：elaboration rounds/questions 展示与答题交互

### 1.4 文本与内容（Markdown / Mention）

- `markdown-content.tsx`：渲染 Markdown（轻封装）
- `mention-editor.tsx`：Tiptap editor + mention suggestion + marker 转换
- `mention-renderer.tsx`：把 marker 渲染为 UI mention（展示）

### 1.5 Pixel Workspace（实时状态视觉化）

- `pixel-canvas.tsx` / `pixel-canvas-widget.tsx`：像素画布与嵌入小组件（展示 agents 状态）

### 1.6 Project/Group 管理

- `create-project-dialog.tsx`
- `create-project-group-dialog.tsx`
- `manage-project-group-dialog.tsx`
- `move-project-confirm-dialog.tsx`

## 2) `src/components/ui/**`（shadcn/ui）

这一层是 UI 基础设施：Button/Card/Dialog/Tabs/Select/Sheet 等。它们一般不包含业务语义，更多是样式与可复用交互。

阅读建议：

- 先把业务组件读通，再回来看 `ui/**`（除非你在改样式/交互细节）。

