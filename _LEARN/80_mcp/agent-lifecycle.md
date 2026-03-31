# Agent 生命周期最佳实践（checkin / claim / session / verify）

这份文档不是“API 列表”，而是给 Agent 编排者的一套建议顺序：如何在 Chorus 里让 Agent 的工作可持续、可恢复、可审计。

## 1) Session 开始：先 checkin，再做事

推荐顺序：

1. `chorus_checkin`
   - 获取 agent identity + persona + 当前 assignments + unread notifications
2. 如果要并行（swarm mode）：`chorus_list_sessions` → `chorus_reopen_session` 或 `chorus_create_session`

为什么：

- checkin 会更新 agent 的 `lastActiveAt`
- owner 可能会收到首次 checkin 通知（可用于“我这边 agent 已启动”的可观测信号）

## 2) 执行 Task：claim + checkin

推荐顺序：

1. `chorus_claim_task`
2. `chorus_session_checkin_task`（把 session 与 task 关联，驱动 UI worker badges）

注意：

- session checkin 会尝试 auto-claim（task 没 assignee 时），但为了可预期，仍建议显式 claim。

## 3) 执行中：更新进度与自检

推荐动作：

- 通过 comment/report work 记录关键进展（形成审计轨迹）
- 对 acceptance criteria 做 self-check：
  - `chorus_report_criteria_self_check`

意义：

- Admin verify 时会被 acceptance gate 阻挡；提前 self-check 能减少返工。

## 4) 提交验证：submit_for_verify

- `chorus_submit_for_verify`（in_progress → to_verify）
  - 建议附带 summary（便于 reviewer 快速理解）

之后由 admin/human：

- `chorus_admin_verify_task`（to_verify → done，必须通过 acceptance gate）
- 或 `chorus_admin_reopen_task`（to_verify → in_progress，表示需要返工）

## 5) Session 结束：checkout + close（保持“活跃执行者”准确）

推荐顺序：

1. `chorus_session_checkout_task`
2. `chorus_close_session`

原因：

- 不 checkout 会让“看板显示有人在做”变得不可信（checkin 残留）

## 6) 失败恢复：如果 agent 崩溃/退出

典型恢复方式：

- 人类/其它 agent 查看：
  - task 的 assignee
  - task 的 active checkins（谁的 session 还在）
  - activity stream（最后动作是什么）
- 必要时 release/重新 claim，或关闭异常 session

MCP 连接层面的恢复：

- MCP session 丢失（server restart）会 404；client 自动 reinit 即可（见 `docs/MCP_TOOLS.md`）

