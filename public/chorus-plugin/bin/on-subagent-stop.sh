#!/usr/bin/env bash
# on-subagent-stop.sh — SubagentStop hook
# Triggered when a sub-agent (teammate) exits.
# Plan D: Auto-checkout from all checked-in tasks, then close the Chorus session.
# Cleans up state and session files.
#
# Output: JSON with systemMessage (user) + additionalContext (Claude)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
API="${SCRIPT_DIR}/chorus-api.sh"

# Check environment
if [ -z "${CHORUS_URL:-}" ] || [ -z "${CHORUS_API_KEY:-}" ]; then
  exit 0
fi

# Read event JSON from stdin
EVENT=""
if [ ! -t 0 ]; then
  EVENT=$(cat)
fi

if [ -z "$EVENT" ]; then
  exit 0
fi

# Extract agent ID from event
# Note: SubagentStop only provides agent_id and agent_type — NOT the name.
# We look up the name from state (stored by SubagentStart).
AGENT_ID=$(echo "$EVENT" | jq -r '.agent_id // .agentId // empty' 2>/dev/null) || true

if [ -z "$AGENT_ID" ]; then
  exit 0
fi

# Lookup session UUID and agent name from state
SESSION_UUID=$("$API" state-get "session_${AGENT_ID}" 2>/dev/null) || true
AGENT_NAME=$("$API" state-get "name_for_agent_${AGENT_ID}" 2>/dev/null) || true

if [ -z "$SESSION_UUID" ]; then
  exit 0
fi

# === Plan D: Auto-checkout from all checked-in tasks ===
CHECKOUT_COUNT=0
SESSION_DETAIL=$("$API" mcp-tool "chorus_get_session" "$(printf '{"sessionUuid":"%s"}' "$SESSION_UUID")" 2>/dev/null) || true

if [ -n "$SESSION_DETAIL" ]; then
  TASK_UUIDS=$(echo "$SESSION_DETAIL" | jq -r '
    .checkins[]? | select(.checkoutAt == null) | .taskUuid // empty
  ' 2>/dev/null) || true

  if [ -z "$TASK_UUIDS" ]; then
    TASK_UUIDS=$(echo "$SESSION_DETAIL" | jq -r '
      .sessionTaskCheckins[]? | select(.checkoutAt == null) | .taskUuid // empty
    ' 2>/dev/null) || true
  fi

  for TASK_UUID in $TASK_UUIDS; do
    if [ -n "$TASK_UUID" ]; then
      "$API" mcp-tool "chorus_session_checkout_task" \
        "$(printf '{"sessionUuid":"%s","taskUuid":"%s"}' "$SESSION_UUID" "$TASK_UUID")" \
        >/dev/null 2>&1 || true
      CHECKOUT_COUNT=$((CHECKOUT_COUNT + 1))
    fi
  done
fi

# Close the Chorus session via MCP
CLOSE_OK=true
"$API" mcp-tool "chorus_close_session" "$(printf '{"sessionUuid":"%s"}' "$SESSION_UUID")" >/dev/null 2>&1 || CLOSE_OK=false

# Clean up state
"$API" state-delete "session_${AGENT_ID}" 2>/dev/null || true
"$API" state-delete "agent_for_session_${SESSION_UUID}" 2>/dev/null || true
"$API" state-delete "name_for_agent_${AGENT_ID}" 2>/dev/null || true
if [ -n "$AGENT_NAME" ]; then
  "$API" state-delete "session_${AGENT_NAME}" 2>/dev/null || true
fi

# Clean up session file
SESSIONS_DIR="${CLAUDE_PROJECT_DIR:-.}/.chorus/sessions"
if [ -n "$AGENT_NAME" ] && [ -f "${SESSIONS_DIR}/${AGENT_NAME}.json" ]; then
  rm -f "${SESSIONS_DIR}/${AGENT_NAME}.json"
fi

# === Output ===
DISPLAY_NAME="${AGENT_NAME:-${AGENT_ID:0:8}}"
if [ "$CLOSE_OK" = true ]; then
  USER_MSG="Chorus session closed: '${DISPLAY_NAME}'"
  if [ "$CHECKOUT_COUNT" -gt 0 ]; then
    USER_MSG="${USER_MSG} (auto-checkout ${CHECKOUT_COUNT} task(s))"
  fi
  "$API" hook-output "$USER_MSG" \
    "Chorus session ${SESSION_UUID} for sub-agent '${DISPLAY_NAME}' closed. ${CHECKOUT_COUNT} task(s) auto-checked-out. State and session file cleaned up."
else
  "$API" hook-output \
    "Chorus: failed to close session for '${DISPLAY_NAME}'" \
    "WARNING: Failed to close Chorus session ${SESSION_UUID} for sub-agent '${DISPLAY_NAME}'. State cleaned up locally."
fi
