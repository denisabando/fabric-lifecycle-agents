#!/usr/bin/env python3
"""Aggregate token/cost Usage events from <client-root>/audit/*.jsonl.
Usage: usage-report.py <client-root> [--by session|day|model|skill]   (default: session)
  --by skill joins sessions to decisions/<skill>/*.md via the `session:` frontmatter line, giving
  cost per task and per domain — the number a stress test or a billing review wants."""
import sys, json, glob, os, re, collections
root = sys.argv[1]; by = sys.argv[sys.argv.index("--by") + 1] if "--by" in sys.argv else "session"
events = []
for f in sorted(glob.glob(os.path.join(root, "audit", "*.jsonl"))):
    day = os.path.basename(f)[:-6]
    for line in open(f, encoding="utf-8"):
        try: e = json.loads(line)
        except Exception: continue
        e["_day"] = day; events.append(e)
usage = [e for e in events if e.get("event") == "Usage"]
if not usage: print("no Usage events"); sys.exit(0)

# session -> skill(s) via decision records
sess_skill = collections.defaultdict(set)
for f in glob.glob(os.path.join(root, "decisions", "*", "*.md")):
    skill = os.path.basename(os.path.dirname(f))
    for line in open(f, encoding="utf-8"):
        m = re.match(r"session:\s*(\S+)", line)
        if m: sess_skill[m.group(1)].add(skill); break

agg = collections.defaultdict(lambda: dict(turns=0, input=0, output=0, cache_write=0, cache_read=0, cost=0.0))
for e in usage:
    keys = {"session": [e.get("session", "")], "day": [e["_day"]],
            "model": list(e.get("turn_tokens", {}).keys()) or ["?"],
            "skill": sorted(sess_skill.get(e.get("session", ""), {"(no decision record)"}))}[by]
    for k in keys:
        a = agg[k]; a["turns"] += 1; a["cost"] += e.get("turn_cost_usd", 0.0)
        for model, t in e.get("turn_tokens", {}).items():
            if by == "model" and model != k: continue
            for kk in ("input", "output", "cache_write", "cache_read"): a[kk] += t.get(kk, 0)
w = max(len(str(k)) for k in agg) + 2
print(f"{by:<{w}}{'turns':>6}{'input':>10}{'output':>9}{'cache_w':>9}{'cache_r':>10}{'cost $':>9}")
tot = dict(turns=0, input=0, output=0, cache_write=0, cache_read=0, cost=0.0)
for k, a in sorted(agg.items()):
    print(f"{str(k):<{w}}{a['turns']:>6}{a['input']:>10}{a['output']:>9}{a['cache_write']:>9}{a['cache_read']:>10}{a['cost']:>9.2f}")
    for kk in tot: tot[kk] += a[kk]
print(f"{'TOTAL':<{w}}{tot['turns']:>6}{tot['input']:>10}{tot['output']:>9}{tot['cache_write']:>9}{tot['cache_read']:>10}{tot['cost']:>9.2f}")
chk = sorted({e.get("pricing_checked", "?") for e in usage}); print(f"\npricing table checked: {', '.join(chk)}  (estimates; subagent turns not included)")
