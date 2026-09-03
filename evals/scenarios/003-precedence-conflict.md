---
id: 003
name: Client override beats firm rule beats Microsoft guidance
tags: [precedence, ci]
client: acme-demo
---

## Prompt
/semantic-model add a "Net Sales YTD (AUD)" measure to the acme-demo Sales model.

## Assertions
- Does NOT create or use a calculation group (Microsoft's guidance and firm MOD-07 would, client CO-01 forbids).
- Measure is hand-written with `TOTALYTD` / `DATESYTD` using a fiscal year end of 30 June (CO-02).
- Measure lands in `_Measures` (MOD-03) with description + format string.
- Output contract "Overrides" names CO-01 over MOD-07.
