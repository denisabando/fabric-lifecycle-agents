#!/usr/bin/env bash
# PreToolUse guardrails. Reads the tool call JSON from stdin.
# Exit 2 = block the tool call and feed stderr back to the model.
set -euo pipefail
INPUT="$(cat)"
TOOL="$(printf '%s' "$INPUT" | python3 -c 'import sys,json; print(json.load(sys.stdin).get("tool_name",""))')"
ARGS="$(printf '%s' "$INPUT" | python3 -c 'import sys,json; print(json.dumps(json.load(sys.stdin).get("tool_input",{})))')"

# 0. MOD-00 — no live edits: Modeling MCP is read-only; writes go to TMDL files
if printf '%s' "$TOOL" | grep -Eq '^mcp__powerbi-modeling-mcp__' && \
   ! printf '%s' "$TOOL" | grep -Eiq '(list|get|read|query|validate|analy|export|serialize|describe|connect|status|info)'; then
  echo "BLOCKED (MOD-00): '$TOOL' would write to a live model. Edit the TMDL files in the PBIP definition folder and commit instead; MCP is read-only on engagements." >&2
  exit 2
fi

# 0b. RPT-00 — reports are PBIR in git: never write .pbix, never commit localSettings
if printf '%s' "$ARGS" | grep -Eiq '"(file_path|path)"\s*:\s*"[^"]*\.(pbix|pbit)"|\.pbi/localSettings\.json'; then
  echo "BLOCKED (RPT-00): reports are authored as PBIR files in git; .pbix/.pbit and localSettings.json are never written or committed." >&2
  exit 2
fi

# 1. vendor/ is read-only
if printf '%s' "$ARGS" | grep -Eq '"(file_path|path)"\s*:\s*"[^"]*vendor/'; then
  echo "BLOCKED: vendor/ is Microsoft's skill, pinned and read-only. Put firm changes in skills/standards and log overrides in skills/standards/overrides.md." >&2
  exit 2
fi
if [ "$TOOL" = "Bash" ] && printf '%s' "$ARGS" | grep -Eq '(>|>>|sed -i|tee|rm |mv |cp )[^"]*vendor/'; then
  echo "BLOCKED: shell write into vendor/ (read-only submodule)." >&2
  exit 2
fi

# 2. prod deployments need a confirmation token in the command/args
if printf '%s' "$ARGS" | grep -Eiq 'updateDefinition|deploymentPipelines/.*/deploy|--target[ =]prod|prod_workspace'; then
  if ! printf '%s' "$ARGS" | grep -Eq "DEPLOY-PROD-[a-z0-9-]+-$(date +%Y%m%d)"; then
    echo "BLOCKED: this looks like a production deployment. Ask the consultant to re-issue the request including today's token DEPLOY-PROD-<client>-$(date +%Y%m%d) after reading the review report." >&2
    exit 2
  fi
fi

exit 0
