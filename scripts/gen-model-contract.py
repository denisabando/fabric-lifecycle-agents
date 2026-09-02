#!/usr/bin/env python3
"""Generate a model contract (YAML) from a PBIP semantic model's TMDL.
Usage: gen-model-contract.py <Model>.SemanticModel <out.yaml> [--status draft|approved]
The contract is the ONLY interface the report domain may bind to (RP-01)."""
import re, sys, pathlib, datetime

src = pathlib.Path(sys.argv[1]); out = pathlib.Path(sys.argv[2])
status = "approved" if "--status" in sys.argv and sys.argv[sys.argv.index("--status")+1] == "approved" else "draft"
tables = []
for f in sorted((src / "definition" / "tables").glob("*.tmdl")):
    txt = f.read_text(encoding="utf-8")
    m = re.search(r"^table\s+(?:'([^']+)'|(\S+))", txt, re.M); name = m.group(1) or m.group(2)
    hidden_tbl = False
    for ln in txt.splitlines()[txt.splitlines().index(next(l for l in txt.splitlines() if l.startswith("table ")))+1:]:
        if re.match(r"\t(column|measure|partition|hierarchy)\b", ln): break
        if ln.strip() == "isHidden" and ln.startswith("\t") and not ln.startswith("\t\t"): hidden_tbl = True
    ttype = (re.search(r"annotation fsm_table_type = (\w+)", txt) or [None, "unknown"])[1]
    cols, meas = [], []
    for c in re.finditer(r"^\tcolumn\s+(?:'([^']+)'|(\S+))(.*?)(?=^\t(?:column|measure|partition|hierarchy)\b|\Z)", txt, re.M | re.S):
        cname, body = (c.group(1) or c.group(2)), c.group(3)
        if "isHidden" in body: continue
        dt = (re.search(r"dataType:\s*(\w+)", body) or [None, "string"])[1]
        cols.append((cname, dt))
    for mm in re.finditer(r"(?:///\s*(?P<desc>[^\n]*)\n)?^\tmeasure\s+(?:'(?P<n1>[^']+)'|(?P<n2>[^=\s]+))\s*=(?P<body>.*?)(?=^\t(?:column|measure|partition|hierarchy|///)|\Z)", txt, re.M | re.S):
        mname = mm.group("n1") or mm.group("n2")
        fmt = (re.search(r"formatString:\s*([^\n]+)", mm.group("body")) or [None, ""])[1].strip()
        meas.append((mname, (mm.group("desc") or "").strip(), fmt))
    tables.append((name, ttype, hidden_tbl, cols, meas))
roles = [p.stem for p in sorted((src / "definition" / "roles").glob("*.tmdl"))] if (src / "definition" / "roles").exists() else []

lines = [f"# Model contract — generated from {src.name} by scripts/gen-model-contract.py. Do not hand-edit; regenerate.",
         f"model: {src.name.replace('.SemanticModel','')}", f"status: {status}", f"generated: {datetime.date.today().isoformat()}",
         "version: 1", "tables:"]
for name, ttype, hidden, cols, meas in tables:
    lines.append(f"  - name: \"{name}\"\n    type: {ttype}\n    hidden: {str(hidden).lower()}")
    if cols:
        lines.append("    columns:")
        for cn, dt in cols: lines.append(f"      - {{ name: \"{cn}\", dataType: {dt} }}")
    if meas:
        lines.append("    measures:")
        for mn, d, fmt in meas: lines.append(f"      - {{ name: \"{mn}\", format: \"{fmt}\", description: \"{d}\" }}")
lines.append("roles:")
for r in roles: lines.append(f"  - \"{r}\"")
out.parent.mkdir(parents=True, exist_ok=True); out.write_text("\n".join(lines) + "\n", encoding="utf-8")
print(f"wrote {out} ({len(tables)} tables, {sum(len(t[4]) for t in tables)} measures, status={status})")
