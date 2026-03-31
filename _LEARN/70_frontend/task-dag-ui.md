# Task DAG 可视化（@xyflow/react + dagre）

Task DAG 是 Chorus 里“规划执行顺序与并行”的核心能力之一。它由三层组成：

1. 数据模型：`TaskDependency`（taskUuid dependsOnUuid）
2. 后端 API：返回 nodes/edges 用于可视化
3. 前端视图：ReactFlow 渲染 + dagre 自动布局 + 交互式加边

## 1) 数据与后端接口

### 1.1 数据结构

- `TaskDependency(taskUuid, dependsOnUuid)`
  - 语义：taskUuid 依赖 dependsOnUuid（必须先完成 dependsOn）

### 1.2 获取 DAG 数据

两条路径（API 与 Server Action）本质都调用同一个 service：

- REST：`GET /api/projects/{projectUuid}/tasks/dependencies`
  - route：`src/app/api/projects/[uuid]/tasks/dependencies/route.ts`
- Server Action：`getProjectDependenciesAction(projectUuid)`
  - `src/app/(dashboard)/projects/[uuid]/tasks/actions.ts`

service：

- `src/services/task.service.ts`：`getProjectTaskDependencies(companyUuid, projectUuid)`
  - 返回：
    - nodes: `{ uuid, title, status, priority, proposalUuid }`
    - edges: `{ from: taskUuid, to: dependsOnUuid }`

## 2) 前端渲染与布局

入口：

- `src/app/(dashboard)/projects/[uuid]/tasks/dag-view.tsx`

关键实现点：

- ReactFlow nodes：
  - `id = task.uuid`
  - `data = { title, status, priority, proposalUuid }`
- ReactFlow edges：
  - 后端边是 `task -> dependsOn`
  - 可视化箭头需要反向表达“依赖 → 被依赖”：
    - `source = dependsOnUuid (to)`
    - `target = taskUuid (from)`
- dagre 自动布局：
  - rankdir `TB`（从上到下）
  - nodesep/ranksep 控制间距

## 3) 交互：拖线加依赖（并做 cycle detection）

前端：

- `onConnect(connection)` 触发 `addTaskDependencyAction(taskUuid, dependsOnUuid)`
  - `src/app/(dashboard)/projects/[uuid]/tasks/[taskUuid]/dependency-actions.ts`

后端：

- `task.service.ts`：`addTaskDependency(companyUuid, taskUuid, dependsOnUuid)`
  - 校验：
    - 不能自依赖
    - 两任务必须同一 project
    - cycle detection（DFS：`wouldCreateCycle`）

交互策略：

- 添加成功后重新 loadDag，保证布局正确
- 添加失败会在 DAG 顶部显示错误提示（`tasks.failedToAddDep`）

## 4) 与 ProposalFilter 的联动

当 URL 中带 `?proposalUuids=a,b,c` 时，DAG view 会：

- 过滤 nodes：只保留 proposalUuid 在集合内的任务
- 过滤 edges：只保留两端都可见的边

这让你能在一个项目内只看某个 proposal 产生的任务子图。

