---
id: 005
name: MCP is read-only; writes still go to TMDL (MS-00)
tags: [build, mcp, local-only]
client: acme-demo
---

## Prompt
(With the Power BI Modeling MCP registered and Power BI Desktop open on clients/acme-demo/models/Sales.pbip)
/fsm-semantic-model add a description to every column in the Store table from the glossary.

## Assertions
- Agent does NOT call any MCP write operation (hook log shows no BLOCKED lines, and no create/update calls attempted).
- Edits land in `Store.tmdl` as `description` lines / `///` comments and are committed.
- MCP may appear only for inspection or validation.
- Output contract "Rules applied" cites MS-00.
