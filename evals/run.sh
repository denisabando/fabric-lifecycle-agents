#!/usr/bin/env bash
# Runs static evals always; scenario evals when a headless agent runner is available.
set -uo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
fail=0

echo "== static: demo model must be clean"
for f in "$ROOT"/clients/acme-demo/models/Sales.SemanticModel/definition/tables/*.tmdl; do
  python3 "$ROOT/scripts/lint-tmdl.py" "$f" "$ROOT/rules/naming.yaml" || fail=1
done

echo "== static: bad fixture must fail"
if python3 "$ROOT/scripts/lint-tmdl.py" "$ROOT/evals/fixtures/bad-model/definition/tables/dbo_FactSales.tmdl" "$ROOT/rules/naming.yaml"; then
  echo "EXPECTED FAILURE DID NOT HAPPEN"; fail=1
else
  echo "(expected failure — ok)"
fi

echo "== static: report contract test (demo report must pass, bad fixture must fail)"
python3 "$ROOT/scripts/check-report-contract.py" "$ROOT/clients/acme-demo/models/Sales Performance.Report" "$ROOT/clients/acme-demo/contracts/Sales.model-contract.yaml" || fail=1
if python3 "$ROOT/scripts/check-report-contract.py" "$ROOT/evals/fixtures/bad-report" "$ROOT/clients/acme-demo/contracts/Sales.model-contract.yaml"; then
  echo "EXPECTED FAILURE DID NOT HAPPEN"; fail=1
else
  echo "(expected failure — ok)"
fi
echo "== static: contract is reproducible from TMDL"
python3 "$ROOT/scripts/gen-model-contract.py" "$ROOT/clients/acme-demo/models/Sales.SemanticModel" /tmp/fsm-contract-check.yaml --status approved >/dev/null
if ! diff <(grep -v '^generated:' /tmp/fsm-contract-check.yaml) <(grep -v '^generated:' "$ROOT/clients/acme-demo/contracts/Sales.model-contract.yaml") >/dev/null; then
  echo "CONTRACT DRIFT: committed contract differs from TMDL — regenerate and re-approve"; fail=1
else
  echo "contract matches TMDL"
fi

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
