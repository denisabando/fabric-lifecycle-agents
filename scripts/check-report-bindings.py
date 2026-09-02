#!/usr/bin/env python3
"""RPT-01 boundary test: every Column/Measure reference in a PBIR report must resolve to a VISIBLE
object in the semantic model's TMDL — at the reviewed commit when one is given.

Usage: check-report-bindings.py <Report>.Report <Model>.SemanticModel [--at <git-sha>]
  --at  read the model's TMDL from that commit (git show) instead of the working tree.
        Pass the `model_commit` from the latest passing model review.
Exit 1 on findings."""
import sys, json, pathlib, re, subprocess

args = sys.argv[1:]
rep = pathlib.Path(args[0]); model = pathlib.Path(args[1])
at = args[args.index("--at") + 1] if "--at" in args else None

def tmdl_files():
    tables = model / "definition" / "tables"
    if not at:
        return [(f.name, f.read_text(encoding="utf-8")) for f in sorted(tables.glob("*.tmdl"))]
    top = subprocess.run(["git", "rev-parse", "--show-toplevel"], capture_output=True, text=True, check=True).stdout.strip()
    rel = str(tables.resolve().relative_to(top))
    names = subprocess.run(["git", "ls-tree", "--name-only", at, rel + "/"], capture_output=True, text=True, check=True).stdout.split()
    return [(n.rsplit("/", 1)[-1], subprocess.run(["git", "show", f"{at}:{n}"], capture_output=True, text=True, check=True).stdout) for n in names if n.endswith(".tmdl")]

cols, meas = set(), set()
for _, txt in tmdl_files():
    m = re.search(r"^table\s+(?:'([^']+)'|(\S+))", txt, re.M); table = m.group(1) or m.group(2)
    head = txt.split("\n\tcolumn", 1)[0].split("\n\tmeasure", 1)[0]
    table_hidden = re.search(r"^\tisHidden\s*$", head, re.M) is not None
    for c in re.finditer(r"^\tcolumn\s+(?:'([^']+)'|(\S+))(.*?)(?=^\t(?:column|measure|partition|hierarchy)\b|\Z)", txt, re.M | re.S):
        if "isHidden" not in c.group(3) and not table_hidden: cols.add((table, c.group(1) or c.group(2)))
    for mm in re.finditer(r"^\tmeasure\s+(?:'([^']+)'|([^=\s]+))\s*=(.*?)(?=^\t(?:column|measure|partition|hierarchy)\b|^\t///|\Z)", txt, re.M | re.S):
        if "isHidden" not in mm.group(3): meas.add((table, mm.group(1) or mm.group(2)))

findings, refs = [], 0
def walk(o, where):
    global refs
    if isinstance(o, dict):
        for key, allowed in (("Column", cols), ("Measure", meas)):
            if key in o and isinstance(o[key], dict) and "Property" in o[key]:
                ent = o[key].get("Expression", {}).get("SourceRef", {}).get("Entity", "?"); prop = o[key]["Property"]; refs += 1
                if (ent, prop) not in allowed:
                    findings.append(f"{where}: {key.lower()} '{ent}'[{prop}] is not a visible object in the model{' at ' + at[:7] if at else ''} (RPT-01)")
        for v in o.values(): walk(v, where)
    elif isinstance(o, list):
        for v in o: walk(v, where)

for f in sorted(rep.rglob("*.json")):
    if f.name in ("version.json", "report.json", "pages.json"): continue
    try: data = json.loads(f.read_text(encoding="utf-8"))
    except Exception as e: findings.append(f"{f}: invalid JSON ({e})"); continue
    walk(data, str(f.relative_to(rep)))
    if f.name == "visual.json" and ("measures" in data.get("visual", {}) or "reportMeasures" in data):
        findings.append(f"{f.relative_to(rep)}: report-level measure defined (RPT-02)")
for x in findings: print("[bindings] " + x)
print(f"[bindings] {rep.name} vs {model.name}{' @ ' + at[:7] if at else ' (working tree)'}: {refs} references, {len(findings)} findings")
sys.exit(1 if findings else 0)
