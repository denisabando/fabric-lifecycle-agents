---
name: standards
description: "The firm's standards for Fabric / Power BI engagement work — one file per domain, each holding the firm's additions to Microsoft's vendored skill and, at the top, the table of places where it overrides Microsoft. Loaded by the domain orchestrators; load directly when asked what the firm standard is or why the agent departed from Microsoft."
---

# Standards

Everything the firm says, one file per domain. Nothing here is Microsoft's (that is `vendor/`) and
nothing here is client-specific (that is `clients/<code>/overrides.md`).

| File | Contains | Loaded by |
| --- | --- | --- |
| `semantic-model.md` | overrides table · MOD-* / DAX-* additions · RLS patterns | `skills/semantic-model` orchestrator, `reviewer` |
| `report.md` | overrides table · RPT-* additions · review checklist · theme | `skills/report` orchestrator, `report-reviewer` |
| `naming.yaml` · `bpa-rules.json` | the machine-checkable subset, same rule ids | hooks, CI, Tabular Editor |

Each domain file is the firm's **delta** on Microsoft: it does not repeat what the vendored skill
already says, and its first section is the table of places where it contradicts Microsoft. The
upstream-sync PR links to those tables.

```
client override  >  these standards  >  Microsoft skill (vendor/)  >  agent's own judgement
```

Conventions: one file per domain, named after its orchestrator; a rule-id prefix per domain (`MOD`,
`DAX`, `RPT`, a future `ING`…); `-00` is always "the diffable path — no live edits"; a rule that
contradicts Microsoft goes in that file's overrides table with the Microsoft reference; a rule that is
mechanically checkable is mirrored in `naming.yaml` or `bpa-rules.json`.
