# 用户旅程（User Journeys）

这份文档从“用起来是什么感觉”出发，把 Chorus 的核心体验拆成几个端到端旅程，并在每一步标出“你在哪个页面/接口看到它”。

## Journey A: 从一个 Idea 到可执行的 Tasks（AI-DLC 主线）

1. 人类创建 Idea
   - UI：项目内 `Ideas` 页面（`/projects/{projectUuid}/ideas`）
   - 数据：`Idea`（`title/content/attachments/status=open`）
2. 认领 Idea（进入 elaborating）
   - UI：Idea 详情页可指派/认领
   - 规则：Idea 状态机（见 `IDEA_STATUS_TRANSITIONS`）
3. PM Agent 启动 Elaboration（结构化问答）
   - UI：elaboration panel（`src/components/elaboration-panel.tsx`）
   - 数据：`ElaborationRound` + `ElaborationQuestion`，并把 `Idea.elaborationStatus` 置为 `pending_answers`
4. 人类回答问题，PM Agent 校验并可能追问
   - 状态：`pending_answers → answered → validated/needs_followup`
5. PM Agent 生成 Proposal（容器：文档草稿 + 任务草稿 + DAG）
   - UI：`/projects/{projectUuid}/proposals/new` 与 Proposal Editor
   - 数据：`Proposal.documentDrafts` / `Proposal.taskDrafts`（JSON）
6. 人类审批 Proposal（approved）
   - 结果：物化 `Document` / `Task`（且 Task DAG 从 draft UUID 映射为真实任务 UUID）
7. Developer Agent 执行 Tasks，提交验证，最终 done
   - UI：`/projects/{projectUuid}/tasks`（Kanban/DAG/List）
   - 数据：`Task` 状态迁移与 `AcceptanceCriterion` 逐条通过

## Journey B: 我作为开发者如何“并行”工作（Session + Checkin）

1. Developer Agent 创建 Session（或复用旧 Session）
   - MCP：`chorus_create_session` / `chorus_reopen_session`
2. 开始处理某个 Task 时 checkin
   - MCP：`chorus_session_checkin_task`
   - 效果：UI 看板显示 worker badge/计数，活动流可追踪
3. 空闲时发 heartbeat，结束时 close session
   - MCP：`chorus_session_heartbeat` / `chorus_close_session`

## Journey C: 我如何快速找到任何信息（Cmd+K 全局搜索）

1. 打开 Global Search（Cmd+K）
2. 选择 scope（Global / Group / Project）
3. 按实体类型切换 Tab（Task/Idea/Proposal/Document/Project/Group）
4. 点击结果跳转到目标页面

对应实现：

- UI：`src/components/global-search.tsx`
- 后端：`src/services/search.service.ts` + `/api/search`

