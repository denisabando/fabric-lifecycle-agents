#!/usr/bin/env bash
# Resolve the CLIENT ROOT — the folder that holds engagement.yaml — for the current action.
# This is the single seam for moving client content into its own repo: set FLA_CLIENT_ROOT and
# every hook, script and log follows it. Nothing else in the plugin hardcodes clients/<code>.
#
#   usage: client-root.sh [path-being-touched]
#   order: $FLA_CLIENT_ROOT  >  nearest engagement.yaml above the path  >  the single non-template
#          folder under $CLAUDE_PROJECT_DIR/clients  >  (empty — caller decides)
set -uo pipefail
if [ -n "${FLA_CLIENT_ROOT:-}" ] && [ -f "$FLA_CLIENT_ROOT/engagement.yaml" ]; then
  printf '%s\n' "$FLA_CLIENT_ROOT"; exit 0
fi
p="${1:-}"
if [ -n "$p" ]; then
  d="$(cd "$(dirname "$p")" 2>/dev/null && pwd || true)"
  while [ -n "$d" ] && [ "$d" != "/" ]; do
    [ -f "$d/engagement.yaml" ] && { printf '%s\n' "$d"; exit 0; }
    d="$(dirname "$d")"
  done
fi
root="${CLAUDE_PROJECT_DIR:-$(pwd)}"
cands=()
for c in "$root"/clients/*/engagement.yaml; do
  [ -f "$c" ] || continue
  case "$c" in */_template/*) continue;; esac
  cands+=("$(dirname "$c")")
done
[ "${#cands[@]}" -eq 1 ] && { printf '%s\n' "${cands[0]}"; exit 0; }
exit 1
