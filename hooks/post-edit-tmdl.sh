#!/usr/bin/env bash
# PostToolUse: after any .tmdl edit, lint naming and (if available) run BPA. Non-blocking, reports back.
set -uo pipefail
INPUT="$(cat)"
FILE="$(printf '%s' "$INPUT" | python3 -c 'import sys,json; print(json.load(sys.stdin).get("tool_input",{}).get("file_path",""))')"
case "$FILE" in
  *.tmdl) ;;
  *.Report/*.json)
    ROOT="${CLAUDE_PLUGIN_ROOT:-$(cd "$(dirname "$0")/.." && pwd)}"
    REP="${FILE%%.Report/*}.Report"; CLIENT_DIR="$(dirname "$(dirname "$REP")")"
    CONTRACT="$(ls "$CLIENT_DIR"/contracts/*.model-contract.yaml 2>/dev/null | head -n1)"
    [ -n "$CONTRACT" ] && python3 "$ROOT/scripts/check-report-contract.py" "$REP" "$CONTRACT" || echo "[fsm] no model contract found for $REP (RP-01)"
    command -v powerbi-report-author >/dev/null 2>&1 && powerbi-report-author validate "$REP" | tail -n 10 || echo "[fsm] PBIR validate skipped (powerbi-report-author not on PATH)"
    exit 0 ;;
  *) exit 0 ;;
esac
ROOT="${CLAUDE_PLUGIN_ROOT:-$(cd "$(dirname "$0")/.." && pwd)}"
python3 "$ROOT/scripts/lint-tmdl.py" "$FILE" "$ROOT/rules/naming.yaml" || true
DEF_DIR="$(dirname "$FILE")"; while [ "$(basename "$DEF_DIR")" != "definition" ] && [ "$DEF_DIR" != "/" ]; do DEF_DIR="$(dirname "$DEF_DIR")"; done
if command -v TabularEditor.exe >/dev/null 2>&1 && [ "$DEF_DIR" != "/" ]; then
  TabularEditor.exe "$DEF_DIR" -A "$ROOT/rules/bpa-rules.json" -V 2>&1 | tail -n 20
else
  echo "[fsm] BPA skipped (Tabular Editor CLI not on PATH). Reviewer will run it."
fi
exit 0
