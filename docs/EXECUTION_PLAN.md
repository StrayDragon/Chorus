# Chorus 执行计划

## 总览

基于 PRD v0.12，分 6 个里程碑完成 MVP 开发。

---

## M0: 项目骨架 (Week 1)

### 目标
搭建完整的项目基础设施，确保开发环境可用。

### 任务清单

#### M0.1 项目初始化 ✅
- [x] 创建 Next.js 15 项目 (App Router)
- [x] 配置 TypeScript
- [x] 配置 ESLint + Prettier
- [x] 配置路径别名 (@/)

#### M0.2 数据库层 ✅
- [x] 安装 Prisma 5.22.0
- [x] 创建 schema.prisma（完整数据模型：11 个表）
- [x] 配置 PostgreSQL 连接
- [x] 生成 Prisma Client
- [x] 运行初始迁移

#### M0.3 容器化 ✅
- [x] 创建 Dockerfile（多阶段构建）
- [x] 创建 docker-compose.yml
- [x] 配置环境变量 (.env.example)
- [x] 修复 OpenSSL 兼容性问题

#### M0.4 UI 基础 ✅
- [x] 安装 Tailwind CSS v4
- [x] 安装 shadcn/ui 依赖
- [x] 创建 Button、Card 组件
- [x] 创建 Chorus 欢迎页面

#### M0.5 验证 ✅
- [x] docker-compose up 启动成功
- [x] 访问 http://localhost:3000 显示首页
- [x] Prisma migrate 成功
- [x] 数据库连接正常（/api/health 返回 ok）

### 交付物
- 可运行的 Next.js 项目
- 完整的 Prisma Schema
- Docker Compose 一键启动

---

## M1: 后端 API (Week 2)

### 目标
实现所有核心实体的 CRUD API。

### 任务清单

#### M1.1 基础设施
- [ ] 创建 API 响应格式标准
- [ ] 创建错误处理中间件
- [ ] 创建 Prisma client 单例

#### M1.2 认证 API
- [ ] OIDC 配置和回调
- [ ] API Key 验证中间件
- [ ] 获取当前用户/Agent

#### M1.3 Projects API
- [ ] GET /api/projects - 项目列表
- [ ] POST /api/projects - 创建项目
- [ ] GET /api/projects/[id] - 项目详情
- [ ] PATCH /api/projects/[id] - 更新项目
- [ ] DELETE /api/projects/[id] - 删除项目

#### M1.4 Ideas API
- [ ] GET /api/projects/[id]/ideas - Ideas 列表
- [ ] POST /api/projects/[id]/ideas - 创建 Idea
- [ ] GET /api/projects/[id]/ideas/[ideaId] - Idea 详情
- [ ] PATCH /api/projects/[id]/ideas/[ideaId] - 更新 Idea
- [ ] DELETE /api/projects/[id]/ideas/[ideaId] - 删除 Idea

#### M1.5 Documents API
- [ ] GET /api/projects/[id]/documents - Documents 列表
- [ ] POST /api/projects/[id]/documents - 创建 Document
- [ ] GET /api/projects/[id]/documents/[docId] - Document 详情
- [ ] PATCH /api/projects/[id]/documents/[docId] - 更新 Document
- [ ] DELETE /api/projects/[id]/documents/[docId] - 删除 Document

#### M1.6 Tasks API
- [ ] GET /api/projects/[id]/tasks - Tasks 列表
- [ ] POST /api/projects/[id]/tasks - 创建 Task
- [ ] GET /api/projects/[id]/tasks/[taskId] - Task 详情
- [ ] PATCH /api/projects/[id]/tasks/[taskId] - 更新 Task（状态、分配）
- [ ] DELETE /api/projects/[id]/tasks/[taskId] - 删除 Task

#### M1.7 Proposals API
- [ ] GET /api/projects/[id]/proposals - Proposals 列表
- [ ] POST /api/projects/[id]/proposals - 创建 Proposal（PM 专属）
- [ ] GET /api/projects/[id]/proposals/[propId] - Proposal 详情
- [ ] PATCH /api/projects/[id]/proposals/[propId] - 审批 Proposal（Human 专属）

#### M1.8 Comments API
- [ ] GET /api/comments?targetType=&targetId= - 获取评论
- [ ] POST /api/comments - 添加评论

#### M1.9 Activity API
- [ ] GET /api/projects/[id]/activity - 项目活动流
- [ ] POST /api/activity - 记录活动（内部）

#### M1.10 Agents API
- [ ] GET /api/agents - Agent 列表
- [ ] POST /api/agents - 创建 Agent（Human 专属）
- [ ] GET /api/agents/[id] - Agent 详情
- [ ] PATCH /api/agents/[id] - 更新 Agent
- [ ] DELETE /api/agents/[id] - 删除 Agent

#### M1.11 API Keys API
- [ ] GET /api/api-keys - API Key 列表
- [ ] POST /api/api-keys - 创建 API Key（Human 专属）
- [ ] DELETE /api/api-keys/[id] - 撤销 API Key

### 交付物
- 完整的 REST API
- API 文档（OpenAPI）
- 单元测试

---

## M2: MCP Server (Week 3)

### 目标
实现 MCP HTTP 端点，让 Claude Code 可以调用 Chorus API。

### 任务清单

#### M2.1 MCP 基础
- [ ] 安装 @modelcontextprotocol/sdk
- [ ] 创建 MCP Server 实例
- [ ] 配置 HTTP Streamable Transport
- [ ] 创建 /api/mcp 端点

#### M2.2 公开工具（All）
- [ ] chorus_get_project
- [ ] chorus_query_knowledge
- [ ] chorus_get_ideas
- [ ] chorus_get_documents
- [ ] chorus_get_document
- [ ] chorus_get_proposals
- [ ] chorus_get_task
- [ ] chorus_list_tasks
- [ ] chorus_get_activity
- [ ] chorus_add_comment
- [ ] chorus_checkin

#### M2.3 PM 专属工具
- [ ] chorus_pm_create_proposal

#### M2.4 Developer 专属工具
- [ ] chorus_update_task
- [ ] chorus_submit_for_verify
- [ ] chorus_report_work

#### M2.5 权限验证
- [ ] API Key 解析
- [ ] 角色验证（PM/Developer）
- [ ] 权限检查中间件

### 交付物
- 可用的 MCP Server
- Claude Code 配置示例
- 工具测试脚本

---

## M3: Web UI (Week 4)

### 目标
实现核心页面的 Web 界面。

### 任务清单

#### M3.1 布局和导航
- [ ] 全局布局（侧边栏 + 主内容）
- [ ] 项目切换器
- [ ] 用户菜单

#### M3.2 Dashboard
- [ ] 跨项目统计卡片
- [ ] 最近活动
- [ ] 快捷入口

#### M3.3 Projects
- [ ] 项目列表页
- [ ] 项目创建表单
- [ ] Project Overview 页

#### M3.4 Knowledge
- [ ] 统一搜索界面
- [ ] 搜索结果展示

#### M3.5 Documents
- [ ] Documents 列表页
- [ ] Document 详情/预览页
- [ ] Document 编辑（Markdown）

#### M3.6 Proposals
- [ ] Proposals 列表页
- [ ] Proposal 详情页
- [ ] 审批界面（批准/拒绝/修改）

#### M3.7 Tasks (Kanban)
- [ ] 四列看板（Todo/In Progress/To Verify/Done）
- [ ] 拖拽移动
- [ ] 任务卡片
- [ ] 任务详情侧边栏
- [ ] 验证按钮（To Verify → Done）

#### M3.8 Activity
- [ ] 活动流列表
- [ ] 活动筛选

#### M3.9 Agents
- [ ] Agent 列表页
- [ ] Agent 创建表单
- [ ] 角色标签展示

#### M3.10 Settings
- [ ] API Key 列表
- [ ] 创建 API Key 模态框
- [ ] 角色选择（多选）
- [ ] Key 复制/撤销

### 交付物
- 完整的 Web UI
- 响应式设计
- 组件库

---

## M4: Skill 文件 (Week 5)

### 目标
编写 Agent 使用平台的指导文件。

### 任务清单

#### M4.1 PM Agent Skill
- [ ] skill/pm/SKILL.md - API 使用说明
- [ ] skill/pm/HEARTBEAT.md - 定期检查清单
- [ ] 提议创建最佳实践

#### M4.2 Developer Agent Skill
- [ ] skill/developer/SKILL.md - API 使用说明
- [ ] skill/developer/HEARTBEAT.md - 定期检查清单
- [ ] 任务执行最佳实践

#### M4.3 CLAUDE.md 模板
- [ ] 项目级配置模板
- [ ] 心跳触发说明

### 交付物
- 完整的 Skill 文件
- CLAUDE.md 模板
- 使用文档

---

## M5: 联调测试 (Week 6)

### 目标
端到端验证，确保所有功能可用。

### 任务清单

#### M5.1 集成测试
- [ ] API 集成测试
- [ ] MCP 工具测试
- [ ] 权限测试

#### M5.2 端到端测试
- [ ] PM Agent 工作流测试
- [ ] Developer Agent 工作流测试
- [ ] Human 审批工作流测试

#### M5.3 Demo 准备
- [ ] 演示数据种子
- [ ] 演示脚本
- [ ] 录屏/截图

#### M5.4 文档完善
- [ ] README 更新
- [ ] 部署文档
- [ ] API 文档

### 交付物
- 通过所有测试
- Demo 演示
- 完整文档

---

## 依赖关系

```
M0 (项目骨架)
 ↓
M1 (后端 API) ←─────────────┐
 ↓                          │
M2 (MCP Server) ───────────→│
 ↓                          │
M3 (Web UI) ←───────────────┘
 ↓
M4 (Skill 文件)
 ↓
M5 (联调测试)
```

---

## 风险和缓解

| 风险 | 概率 | 缓解 |
|-----|------|------|
| Prisma schema 变更频繁 | 高 | 先完成数据模型设计评审 |
| MCP SDK 不熟悉 | 中 | 提前研究文档和示例 |
| UI 工作量大 | 高 | 使用 shadcn/ui 加速 |
| 认证复杂度 | 中 | MVP 先用简化方案 |

