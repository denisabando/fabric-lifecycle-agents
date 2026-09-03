#!/usr/bin/env bash
# Token + cost trail. Registered on Stop. Reads the session transcript Claude Code names in the Stop
# payload (transcript_path), sums per-message `usage` by model, subtracts what was already counted
# for this session (state in <client-root>/audit/state/<session>.json), prices the delta with
# hooks/pricing.yaml, and appends ONE "Usage" line to <client-root>/audit/<date>.jsonl.
#   - numbers only; no message content is read into the log
#   - subagent transcripts are separate files and are NOT included (see OPEN-QUESTIONS)
#   - cost is an estimate; the line carries pricing_checked so a stale table is visible
set -uo pipefail
INPUT="$(cat)"
HERE="$(cd "$(dirname "$0")" && pwd)"
AUDIT_INPUT="$INPUT" python3 - "$HERE" <<'PY'
import sys, json, os, re, datetime, subprocess
here = sys.argv[1]
try: d = json.loads(os.environ.get("AUDIT_INPUT", "") or "{}")
except Exception: d = {}
tp = d.get("transcript_path", ""); session = d.get("session_id", "")
if not tp or not os.path.isfile(tp): sys.exit(0)

root = subprocess.run(["bash", os.path.join(here, "..", "scripts", "client-root.sh")], capture_output=True, text=True).stdout.strip()
if not root: root = os.path.join(os.environ.get("CLAUDE_PROJECT_DIR", os.getcwd()), "audit-unassigned")

# --- pricing.yaml (flat enough to parse without a YAML lib)
pricing, default, checked = {}, None, ""
for line in open(os.path.join(here, "pricing.yaml"), encoding="utf-8"):
    m = re.match(r"\s*checked:\s*(\S+)", line)
    if m: checked = m.group(1)
    m = re.match(r"\s*([\w.\-]+):\s*\{\s*input:\s*([\d.]+),\s*output:\s*([\d.]+),\s*cache_write:\s*([\d.]+),\s*cache_read:\s*([\d.]+)\s*\}", line)
    if m:
        row = dict(input=float(m.group(2)), output=float(m.group(3)), cache_write=float(m.group(4)), cache_read=float(m.group(5)))
        if m.group(1) == "default": default = row
        else: pricing[m.group(1)] = row

# --- sum transcript usage by model, deduplicating streamed chunks by message id
totals, seen = {}, {}
with open(tp, encoding="utf-8", errors="replace") as f:
    for line in f:
        try: e = json.loads(line)
        except Exception: continue
        msg = e.get("message") if isinstance(e.get("message"), dict) else None
        if not msg or e.get("type") != "assistant": continue
        u = msg.get("usage") or {}
        if not u: continue
        mid = msg.get("id") or e.get("uuid") or str(len(seen))
        seen[mid] = (msg.get("model", "unknown"), u)   # last chunk for a message id wins
for model, u in seen.values():
    t = totals.setdefault(model, dict(input=0, output=0, cache_write=0, cache_read=0))
    t["input"] += int(u.get("input_tokens", 0) or 0); t["output"] += int(u.get("output_tokens", 0) or 0)
    t["cache_write"] += int(u.get("cache_creation_input_tokens", 0) or 0); t["cache_read"] += int(u.get("cache_read_input_tokens", 0) or 0)

def price(model):
    for k, v in pricing.items():
        if model.startswith(k): return v, k
    return default, "default"
def cost(t, p): return sum(t[k] * p[k] / 1e6 for k in ("input", "output", "cache_write", "cache_read"))

state_dir = os.path.join(root, "audit", "state"); os.makedirs(state_dir, exist_ok=True)
sp = os.path.join(state_dir, (session or "unknown") + ".json")
prev = json.load(open(sp)) if os.path.isfile(sp) else {}
turn, turn_cost, cum_cost, priced_as = {}, 0.0, 0.0, set()
for model, t in totals.items():
    p, key = price(model); priced_as.add(key)
    pt = prev.get(model, dict(input=0, output=0, cache_write=0, cache_read=0))
    delta = {k: t[k] - pt.get(k, 0) for k in t}
    if any(delta.values()): turn[model] = delta
    turn_cost += cost(delta, p); cum_cost += cost(t, p)
json.dump(totals, open(sp, "w"))
if not turn: sys.exit(0)   # nothing new this turn

rec = {"ts": datetime.datetime.now(datetime.timezone.utc).isoformat(timespec="seconds"), "event": "Usage", "session": session,
       "turn_tokens": turn, "turn_cost_usd": round(turn_cost, 4),
       "session_tokens": totals, "session_cost_usd": round(cum_cost, 4),
       "pricing_checked": checked, "priced_as": sorted(priced_as), "note": "estimate; main session only, subagents excluded"}
os.makedirs(os.path.join(root, "audit"), exist_ok=True)
with open(os.path.join(root, "audit", datetime.date.today().isoformat() + ".jsonl"), "a", encoding="utf-8") as f:
    f.write(json.dumps(rec) + "\n")
PY
exit 0
