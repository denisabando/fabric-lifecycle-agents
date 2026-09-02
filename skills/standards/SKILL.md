---
name: standards
description: "The firm's standards for Fabric / Power BI engagement work, in one place: modelling (MOD-*), DAX (DAX-*), report (RPT-*) rules, and the single list of places where those rules override Microsoft's vendored skills. Loaded by the domain orchestrators (semantic-model, report); load directly when asked what the firm standard is, or why the agent departed from Microsoft guidance."
---

# Standards

One folder for everything the firm says. Domain orchestrators load the part they need; nothing here
is Microsoft's and nothing here is client-specific.

| File | Rule ids | Load when |
| --- | --- | --- |
| `modeling.md` | `MOD-00` … `MOD-30` | creating or changing model structure, naming, storage mode, security |
| `dax.md` | `DAX-01` … `DAX-24` | writing, reviewing or optimising DAX |
| `report.md` | `RPT-00` … `RPT-08` | any PBIR report work |
| `overrides.md` | — | **the one list of where we depart from Microsoft**; read before overriding anything, and on every upstream sync |
| `rls-patterns.md` | — | implementing row-level security |
| `report-review-checklist.md` | — | reviewing a report |
| `report-theme.json` | — | theming a report (RPT-04) |

Precedence, everywhere:

```
client override (clients/<code>/overrides.md)  >  these standards  >  Microsoft skill (vendor/)  >  agent's own judgement
```

Rule-id conventions: a prefix per domain (`MOD`, `DAX`, `RPT`; a future ingestion domain would add
its own, e.g. `ING`), `-00` is always "the diffable path — no live edits" for that domain, and a
rule that contradicts Microsoft must also appear in `overrides.md`. Machine-checkable rules are
mirrored in `rules/` (naming.yaml, bpa-rules.json) and cite the same ids.
