#!/usr/bin/env bash
# Mechanical audit trail. Registered on UserPromptSubmit, PreToolUse, PostToolUse, SubagentStart,
# SubagentStop and Stop; also called by pre-tool-use.sh with event "Blocked".
# Appends ONE JSON line per event to <client-root>/.audit/YYYY-MM-DD.jsonl.
#   - metadata only: never file contents, never tool output bodies, never query results
#   - read-only tools (Read/Glob/Grep/LS) are skipped unless engagement.yaml sets audit.include_reads: true
#   - the agent cannot edit .audit/ (pre-tool-use.sh blocks it); the log is committed with the work
#   usage: audit.sh <EventName>   (event JSON on stdin, as Claude Code provides it)
set -uo pipefail
EVENT="${1:-unknown}"
INPUT="$(cat)"
HERE="$(cd "$(dirname "$0")" && pwd)"

AUDIT_INPUT="$INPUT" python3 - "$EVENT" "$HERE" <<'PY'
import sys, json, os, subprocess, datetime, hashlib, re
event, here = sys.argv[1], sys.argv[2]
try: d = json.loads(os.environ.get("AUDIT_INPUT", "") or "{}")
except Exception: d = {}
tool = d.get("tool_name", ""); ti = d.get("tool_input", {}) or {}
READ_ONLY = {"Read", "Glob", "Grep", "LS", "TodoWrite", "TodoRead", "WebFetch", "WebSearch"}

path = ti.get("file_path") or ti.get("path") or ti.get("notebook_path") or ""
root = subprocess.run(["bash", os.path.join(here, "..", "scripts", "client-root.sh"), path], capture_output=True, text=True).stdout.strip()
if not root:
    root = os.path.join(os.environ.get("CLAUDE_PROJECT_DIR", os.getcwd()), ".audit-unassigned")
cfg = {"include_reads": False}
try:
    for line in open(os.path.join(root, "engagement.yaml")):
        m = re.match(r"\s*include_reads:\s*(true|false)", line)
        if m: cfg["include_reads"] = m.group(1) == "true"
except Exception: pass

if event in ("PreToolUse", "PostToolUse") and tool in READ_ONLY and not cfg["include_reads"]:
    sys.exit(0)
def trunc(s, n=300):
    s = str(s or ""); return s if len(s) <= n else s[:n] + f"…(+{len(s)-n})"
rec = {"ts": datetime.datetime.now(datetime.timezone.utc).isoformat(timespec="seconds"),
       "event": event, "session": d.get("session_id", ""), "cwd": d.get("cwd", "")}
if event == "UserPromptSubmit":
    rec["prompt"] = trunc(d.get("prompt", ""), 500)
elif event in ("PreToolUse", "PostToolUse", "Blocked"):
    rec["tool"] = tool
    if path: rec["path"] = os.path.relpath(path, root) if os.path.isabs(path) and path.startswith(root) else path
    if "command" in ti: rec["command"] = trunc(ti["command"])
    if "pattern" in ti: rec["pattern"] = trunc(ti["pattern"], 120)
    if tool.startswith("mcp__"): rec["mcp_args"] = trunc(json.dumps({k: v for k, v in ti.items() if k not in ("expression", "content")}), 300)
    if event == "PostToolUse":
        # record a fingerprint of the written file, never its content
        if path and os.path.isfile(path):
            rec["sha256"] = hashlib.sha256(open(path, "rb").read()).hexdigest()[:16]
        resp = d.get("tool_response", "")
        rec["result"] = "error" if (isinstance(resp, dict) and resp.get("is_error")) or (isinstance(resp, str) and resp.lower().startswith("error")) else "ok"
    if event == "Blocked":
        rec["reason"] = trunc(d.get("reason", ""), 300)
elif event in ("SubagentStart", "SubagentStop"):
    rec["agent"] = d.get("agent_name") or d.get("subagent_type") or d.get("agent_type", "")
elif event == "Stop":
    rec["transcript"] = d.get("transcript_path", "")
    try:
        st = subprocess.run(["git", "status", "--porcelain", "--", root], capture_output=True, text=True, cwd=root).stdout.splitlines()
        rec["uncommitted_changes"] = len(st)
    except Exception: pass

os.makedirs(os.path.join(root, ".audit"), exist_ok=True)
fn = os.path.join(root, ".audit", datetime.date.today().isoformat() + ".jsonl")
with open(fn, "a", encoding="utf-8") as f: f.write(json.dumps(rec, ensure_ascii=False) + "\n")
PY
exit 0
