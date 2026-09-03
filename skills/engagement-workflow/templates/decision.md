---
date: <yyyy-mm-dd>
session: <claude session id — from the audit log>
domain: semantic-model | report        # also the subfolder this file lives in: decisions/<domain>/
phase: <discovery|spec|build|review|deploy|handover>
commit: <sha of the commit that carries the change, once made>
consultant: <who asked>
---

# <short title — what was asked>

## Request
<the consultant's request, one or two lines, verbatim where it matters>

## What changed
<files / objects, e.g. `_Measures.tmdl`: added [Net Sales YTD (AUD)]>

## Why it was done this way
<the reasoning: which rules shaped it and how they interacted>
- Rules applied: <MOD-* / DAX-* / RPT-* / CO-* ids>
- Microsoft guidance overridden: <rule id + §3 row, or "none">
- Microsoft guidance followed that a reader might question: <optional>

## Questions asked and answers received
| Question | Answer | From |
| -------- | ------ | ---- |

## Interventions
<hooks that blocked something and what was done instead; anything the consultant corrected mid-task; "none" if none>

## Next gate
<what must happen before the next phase>
