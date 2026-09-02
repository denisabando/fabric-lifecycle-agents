#!/usr/bin/env bash
# Fetch upstream microsoft/skills-for-fabric, compare with the pinned submodule SHA,
# and print a review-ready summary. Used by /sync-upstream and .github/workflows/upstream-sync.yml
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SUB="$ROOT/vendor/skills-for-fabric"
WATCH="plugins/powerbi-authoring common CHANGELOG.md"

cd "$SUB"
OLD="$(git rev-parse HEAD)"
git fetch -q origin main
NEW="$(git rev-parse origin/main)"
echo "pinned:   $OLD"
echo "upstream: $NEW"
if [ "$OLD" = "$NEW" ]; then echo "UP_TO_DATE=true"; exit 0; fi
echo "UP_TO_DATE=false"
echo
echo "## Changed files in watched paths"
git diff --stat "$OLD" "$NEW" -- $WATCH || true
echo
echo "## New CHANGELOG entries"
git diff "$OLD" "$NEW" -- CHANGELOG.md | grep -E '^\+' | grep -vE '^\+\+\+' | sed 's/^+//' || true
echo
echo "## Guidance-level diff (semantic-model-authoring)"
git diff "$OLD" "$NEW" -- plugins/powerbi-authoring/skills/semantic-model-authoring | head -n 400 || true
if [ "${BUMP:-false}" = "true" ]; then
  git checkout -q "$NEW"
  echo "BUMPED submodule to $NEW (commit it in the parent repo)"
fi
