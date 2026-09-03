#!/usr/bin/env python3
"""Lightweight TMDL naming linter driven by skills/standards/naming.yaml.
Usage: lint-tmdl.py <file.tmdl> <naming.yaml>   (exit 1 on findings; prints one line per finding)
Deliberately dependency-free: parses the handful of TMDL constructs we care about with regexes.
"""
import re, sys, pathlib

def load_yaml_min(p):
    # minimal reader for the flat-ish naming.yaml (no external deps in hooks)
    out, section = {}, None
    for line in pathlib.Path(p).read_text().splitlines():
        if not line.strip() or line.lstrip().startswith("#"): continue
        if not line.startswith(" "):
            section = line.split(":")[0].strip(); out[section] = {}; continue
        k, _, v = line.strip().partition(":")
        v = v.strip()
        if v.startswith("["): v = [x.strip() for x in v.strip("[]").split(",") if x.strip()]
        elif v in ("true", "false"): v = v == "true"
        else: v = v.strip('"')
        out[section][k.strip()] = v
    return out

def main(path, rules_path):
    rules = load_yaml_min(rules_path)
    txt = pathlib.Path(path).read_text(encoding="utf-8")
    findings = []
    tbl = re.search(r"^table\s+(?:'([^']+)'|(\S+))", txt, re.M)
    table = (tbl.group(1) or tbl.group(2)) if tbl else None
    fp = rules["tables"].get("forbidden_prefixes", [])
    if table and any(table.lower().startswith(p.lower()) for p in fp):
        findings.append(f"{path}: table '{table}' has a technical prefix (Microsoft naming-conventions; naming.yaml tables.forbidden_prefixes)")
    if table and table != rules["tables"]["measures_table"]:
        for m in re.finditer(r"^\s+measure\s+(?:'([^']+)'|([^=\s]+))\s*=", txt, re.M):
            findings.append(f"{path}: measure '{m.group(1) or m.group(2)}' defined on '{table}' — MOD-03: measures belong in {rules['tables']['measures_table']}")
    described = {(m.group(1) or m.group(2)) for m in re.finditer(r"///[^\n]*\n\s+measure\s+(?:'([^']+)'|([^=\s]+))\s*=", txt)}
    for m in re.finditer(r"^\s+measure\s+(?:'([^']+)'|([^=\s]+))\s*=.*?(?=^\s+(?:measure|column|partition|hierarchy|///)\b|^\s+///|\Z)", txt, re.M | re.S):
        name, body = (m.group(1) or m.group(2)), m.group(0)
        if rules["measures"].get("require_description") and "description:" not in body and name not in described:
            findings.append(f"{path}: measure '{name}' has no description (DAX-04)")
        if rules["measures"].get("require_format_string") and "formatString" not in body:
            findings.append(f"{path}: measure '{name}' has no formatString (DAX-04)")
    for c in re.finditer(r"^\s+column\s+(?:'([^']+)'|(\S+)).*?(?=^\s+(?:measure|column|partition|hierarchy)\b|\Z)", txt, re.M | re.S):
        name, body = (c.group(1) or c.group(2)), c.group(0)
        if name.endswith(rules["columns"]["key_suffix"]) and rules["columns"].get("keys_hidden") and "isHidden" not in body:
            findings.append(f"{path}: key column '{name}' is not hidden (Microsoft modeling-guidelines: hide key columns)")
        if any(name.lower().startswith(p.lower()) for p in rules["columns"].get("forbidden_prefixes", [])):
            findings.append(f"{path}: column '{name}' has a forbidden source prefix")
    for f in findings: print("[lint] " + f)
    if not findings: print(f"[lint] {path}: clean")
    return 1 if findings else 0

if __name__ == "__main__":
    sys.exit(main(sys.argv[1], sys.argv[2]))
