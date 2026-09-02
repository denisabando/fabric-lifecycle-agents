---
description: Scaffold a new client engagement folder from clients/_template
argument-hint: <client-code>
---

Create `clients/$ARGUMENTS/` by copying `clients/_template/` (engagement.yaml, overrides.md,
glossary.md, and empty `models/`, `reviews/`, `deployments/`, `handover/` folders).
Then open `engagement.yaml` and fill in what the consultant tells you: client name, fiscal year
start month, environments (workspace names — IDs are resolved later via the Microsoft skill),
deployment method, storage mode default, whether calc groups are allowed, `allow_data_reads`.
Remind the consultant that real client folders are git-ignored and should live in the client's
repo or a private per-client repo (see README → Client isolation).
Finish by loading `fsm-engagement-workflow` and starting Discovery.
