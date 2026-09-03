#!/usr/bin/env bash
# Stop hook: narrative trail check. If this turn changed model/report files in the client folder but
# no decision record was added or updated, ask the agent to write one before finishing.
# Exit 2 + stderr = Claude Code feeds the message back and the agent continues; stop_hook_active
# guards against looping.
set -uo pipefail
INPUT="$(cat)"
ACTIVE="$(printf '%s' "$INPUT" | python3 -c 'import sys,json; print(str(json.load(sys.stdin).get("stop_hook_active", False)).lower())' 2>/dev/null || echo false)"
[ "$ACTIVE" = "true" ] && exit 0
HERE="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(bash "$HERE/../scripts/client-root.sh" 2>/dev/null || true)"
[ -z "$ROOT" ] && exit 0
cd "$ROOT" || exit 0
CHANGED="$(git status --porcelain -- models 2>/dev/null | wc -l | tr -d ' ')"
DECISION="$(git status --porcelain -- decisions 2>/dev/null | wc -l | tr -d ' ')"
if [ "$CHANGED" -gt 0 ] && [ "$DECISION" -eq 0 ]; then
  echo "Decision record missing: this turn changed $CHANGED file(s) under models/ but nothing under decisions/. Write decisions/$(date +%Y-%m-%d)-<slug>.md from skills/engagement-workflow/templates/decision.md (the §6 output block is its body), then finish." >&2
  exit 2
fi
exit 0
