#!/usr/bin/env python3
"""Contract test (RP-01): every Column/Measure reference in a PBIR report must exist in the model contract.
Usage: check-report-contract.py <Report>.Report <Model>.model-contract.yaml   (exit 1 on findings)"""
import sys, json, pathlib, re

rep = pathlib.Path(sys.argv[1]); contract = pathlib.Path(sys.argv[2]).read_text(encoding="utf-8")
if not re.search(r"^status:\s*approved", contract, re.M):
    print(f"[contract] {contract and sys.argv[2]}: status is not 'approved' — report work may not start (RP-01)"); sys.exit(1)
cols, meas, cur = set(), set(), None
for line in contract.splitlines():
    m = re.match(r'\s*- name: "([^"]+)"$', line)
    if m: cur = m.group(1); continue
    m = re.match(r'\s*- \{ name: "([^"]+)", dataType', line)
    if m and cur: cols.add((cur, m.group(1))); continue
    m = re.match(r'\s*- \{ name: "([^"]+)", format', line)
    if m and cur: meas.add((cur, m.group(1)))

findings, refs = [], 0
def walk(o, where):
    global refs
    if isinstance(o, dict):
        for key, kind in (("Column", cols), ("Measure", meas)):
            if key in o and isinstance(o[key], dict) and "Property" in o[key]:
                ent = o[key].get("Expression", {}).get("SourceRef", {}).get("Entity", "?"); prop = o[key]["Property"]; refs += 1
                if (ent, prop) not in kind:
                    findings.append(f"{where}: {key.lower()} '{ent}'[{prop}] is not in the approved model contract (RP-01)")
        for v in o.values(): walk(v, where)
    elif isinstance(o, list):
        for v in o: walk(v, where)

for f in sorted(rep.rglob("*.json")):
    if f.name in ("version.json", "report.json", "pages.json"): continue
    try: data = json.loads(f.read_text(encoding="utf-8"))
    except Exception as e: findings.append(f"{f}: invalid JSON ({e})"); continue
    walk(data, str(f.relative_to(rep)))
    if f.name == "visual.json":
        vis = data.get("visual", {})
        if "measures" in vis or "reportMeasures" in data:  # report-level measures
            findings.append(f"{f.relative_to(rep)}: report-level measure defined (RP-02)")
for x in findings: print("[contract] " + x)
print(f"[contract] {rep.name}: {refs} field references checked, {len(findings)} findings")
sys.exit(1 if findings else 0)
