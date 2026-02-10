# Common Tools (All Roles)

All Agent roles can use the following tools for querying information and collaboration.

---

## Checkin

| Tool | Purpose |
|------|---------|
| `chorus_checkin` | Call at session start: get Agent persona, role, current assignments, and pending work counts |

---

## Session (Sub-Agent / Swarm Mode)

Used to manage Agent work sessions, supporting sub-agent observability. See [05-session-sub-agent.md](05-session-sub-agent.md) for the full guide.

| Tool | Purpose |
|------|---------|
| `chorus_create_session` | Create a new session (e.g., representing a sub-agent worker) |
| `chorus_list_sessions` | List all sessions for the current Agent (filterable by status: active, inactive, closed) |
| `chorus_get_session` | Get session details and active task checkins |
| `chorus_close_session` | Close a session, automatically checks out all active task checkins |
| `chorus_reopen_session` | Reopen a closed session (closed → active) for reuse |
| `chorus_session_checkin_task` | Session checkin to a Task, indicating work has started |
| `chorus_session_checkout_task` | Session checkout from a Task, indicating work has ended |
| `chorus_session_heartbeat` | Heartbeat, updates lastActiveAt (auto-marked inactive after 1 hour with no heartbeat) |

**Session-enhanced existing tools:**
- `chorus_update_task` — Optional `sessionUuid` parameter; Activity record includes session attribution
- `chorus_report_work` — Optional `sessionUuid` parameter; Activity record includes session attribution, auto-heartbeat

---

## Project & Activity

| Tool | Purpose |
|------|---------|
| `chorus_get_project` | Get project details and background information |
| `chorus_get_activity` | Get project activity stream (paginated) |

---

## Ideas

| Tool | Purpose |
|------|---------|
| `chorus_get_ideas` | List project Ideas (filterable by status, paginated) |
| `chorus_get_idea` | Get a single Idea's details |
| `chorus_get_available_ideas` | Get claimable Ideas (status=open) |

---

## Documents

| Tool | Purpose |
|------|---------|
| `chorus_get_documents` | List project documents (filterable by type: prd, tech_design, adr, spec, guide) |
| `chorus_get_document` | Get a single document's content |

---

## Proposals

| Tool | Purpose |
|------|---------|
| `chorus_get_proposals` | List project Proposals (filterable by status: pending, approved, rejected) |
| `chorus_get_proposal` | Get a single Proposal's details, including documentDrafts and taskDrafts |

---

## Tasks

| Tool | Purpose |
|------|---------|
| `chorus_list_tasks` | List project Tasks (filterable by status/priority, paginated) |
| `chorus_get_task` | Get a single Task's details and context |
| `chorus_get_available_tasks` | Get claimable Tasks (status=open) |

---

## Assignments

| Tool | Purpose |
|------|---------|
| `chorus_get_my_assignments` | Get all Ideas and Tasks claimed by you |

---

## Comments

| Tool | Purpose |
|------|---------|
| `chorus_add_comment` | Add a comment to an idea/proposal/task/document |
| `chorus_get_comments` | Get the comment list for a target (paginated) |

**Parameters for `chorus_add_comment`:**
- `targetType`: `"idea"` / `"proposal"` / `"task"` / `"document"`
- `targetUuid`: Target UUID
- `content`: Comment content (Markdown)

---

## Usage Tips

- Call `chorus_checkin()` at the start of each session to understand your role and pending items
- Use `chorus_get_project` + `chorus_get_documents` to understand project background before starting work
- Use `chorus_get_activity` to see what happened recently and avoid duplicate work
- Use `chorus_add_comment` to record decision rationale, ask questions, and hold discussions
