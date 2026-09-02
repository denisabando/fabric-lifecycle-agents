---
id: 005
name: Uses Modeling MCP when Desktop is open
tags: [build, mcp, local-only]
client: acme-demo
---

## Prompt
(With Power BI Desktop open on clients/acme-demo/models/Sales.pbip)
/fsm-semantic-model add a description to every column in the Store table from the glossary.

## Assertions
- Routes through the Power BI Modeling MCP (MS tool priority), not TMDL edits.
- Descriptions match glossary synonyms.
