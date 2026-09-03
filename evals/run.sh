#!/usr/bin/env bash
# Runs static evals always; scenario evals when a headless agent runner is available.
set -uo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
fail=0

echo "== static: demo model must be clean"
for f in "$ROOT"/clients/acme-demo/models/Sales.SemanticModel/definition/tables/*.tmdl; do
  python3 "$ROOT/scripts/lint-tmdl.py" "$f" "$ROOT/skills/semantic-model/naming.yaml" || fail=1
done

echo "== static: bad fixture must fail"
if python3 "$ROOT/scripts/lint-tmdl.py" "$ROOT/evals/fixtures/bad-model/definition/tables/dbo_FactSales.tmdl" "$ROOT/skills/semantic-model/naming.yaml"; then
  echo "EXPECTED FAILURE DID NOT HAPPEN"; fail=1
else
  echo "(expected failure — ok)"
fi

echo "== static: report binding test (demo report must pass, bad fixture must fail)"
MODEL="$ROOT/clients/acme-demo/models/Sales.SemanticModel"
python3 "$ROOT/scripts/check-report-bindings.py" "$ROOT/clients/acme-demo/models/Sales Performance.Report" "$MODEL" || fail=1
if python3 "$ROOT/scripts/check-report-bindings.py" "$ROOT/evals/fixtures/bad-report" "$MODEL"; then
  echo "EXPECTED FAILURE DID NOT HAPPEN"; fail=1
else
  echo "(expected failure — ok)"
fi
if git -C "$ROOT" rev-parse HEAD >/dev/null 2>&1; then
  echo "== static: same check pinned to HEAD (exercises the --at path)"
  python3 "$ROOT/scripts/check-report-bindings.py" "$ROOT/clients/acme-demo/models/Sales Performance.Report" "$MODEL" --at "$(git -C "$ROOT" rev-parse HEAD)" || fail=1
fi

echo "== static: audit hook smoke test (writes to a temp client root, not the demo)"
TMPC="$(mktemp -d)"; cp "$ROOT/clients/acme-demo/engagement.yaml" "$TMPC/"
echo '{"session_id":"t","tool_name":"Edit","tool_input":{"file_path":"'"$TMPC"'/models/x.tmdl"}}' | FLA_CLIENT_ROOT="$TMPC" bash "$ROOT/hooks/audit.sh" PreToolUse
echo '{"session_id":"t","tool_name":"Read","tool_input":{"file_path":"'"$TMPC"'/models/x.tmdl"}}' | FLA_CLIENT_ROOT="$TMPC" bash "$ROOT/hooks/audit.sh" PreToolUse
echo '{"session_id":"t","tool_name":"Write","tool_input":{"file_path":"'"$TMPC"'/audit/2020-01-01.jsonl"}}' | FLA_CLIENT_ROOT="$TMPC" bash "$ROOT/hooks/pre-tool-use.sh" 2>/dev/null && { echo "audit dir was writable — FAIL"; fail=1; }
N="$(cat "$TMPC"/audit/*.jsonl | wc -l | tr -d ' ')"
[ "$N" = "2" ] && echo "audit: 2 lines (Edit logged, Read skipped, audit write blocked+logged)" || { echo "audit: expected 2 lines, got $N"; fail=1; }
rm -rf "$TMPC"

echo "== scenarios"
if command -v claude >/dev/null 2>&1 && [ -n "${ANTHROPIC_API_KEY:-}" ]; then
  mkdir -p "$ROOT/evals/out"
  for s in "$ROOT"/evals/scenarios/*.md; do
    grep -q 'local-only' "$s" && { echo "skip (local-only): $(basename "$s")"; continue; }
    prompt="$(awk '/^## Prompt/{f=1;next}/^## Assertions/{f=0}f' "$s")"
    echo "--- $(basename "$s")"
    claude -p "$prompt" --plugin-dir "$ROOT" > "$ROOT/evals/out/$(basename "$s" .md).log" 2>&1 || fail=1
    # assertion checking is scenario-specific; wire your grader here (e.g. a second claude -p call
    # that reads the log + assertions and returns PASS/FAIL).
  done
else
  echo "scenario runner not available (needs 'claude' CLI + ANTHROPIC_API_KEY) — skipped"
fi
exit $fail
