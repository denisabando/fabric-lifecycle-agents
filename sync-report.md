pinned:   714ea2f9431179344ecd9bc673a9881a773c9f47
upstream: bc42aaf734771bf752c1d7082dd91e5a6ca72b9f
UP_TO_DATE=false

## Changed files in watched paths
CHANGELOG.md                                       |  102 ++
 common/SQLDW-CONSUMPTION-CORE.md                   |    6 +-
 .../powerbi-authoring/.claude-plugin/plugin.json   |    8 +-
 .../powerbi-authoring/.github/plugin/plugin.json   |    7 +-
 .../skills/powerbi-report-authoring/SKILL.md       |  411 ------
 .../powerbi-report-authoring/references/card.md    |  509 -------
 .../references/cartesian.md                        | 1497 --------------------
 .../references/conditional-formatting.md           |  640 ---------
 .../powerbi-report-authoring/references/map.md     |   96 --
 .../references/powerbi-desktop.md                  |  176 ---
 .../references/powerbi-report-author-cli.md        |   42 -
 .../skills/powerbi-report-cli/SKILL.md             |  261 ++++
 .../references/authoring-part-02.md                |  207 +++
 .../references/authoring-part-03.md                |  248 ++++
 .../references/authoring-part-04.md                |   66 +
 .../powerbi-report-cli/references/authoring.md     |  283 ++++
 .../references/authoring/authoring-workflows.md}   |   83 +-
 .../references/authoring/bookmark.md               |  478 +++++++
 .../references/authoring/button-part-02.md         |  349 +++++
 .../references/authoring/button-part-03.md         |  136 ++
 .../references/authoring/button.md                 |  295 ++++
 .../references/authoring/card-part-02.md           |  331 +++++
 .../references/authoring/card-part-03.md           |  246 ++++
 .../references/authoring/card.md                   |  130 ++
 .../references/authoring/cartesian-part-02.md      |  478 +++++++
 .../references/authoring/cartesian-part-03.md      |  326 +++++
 .../references/authoring/cartesian-part-04.md      |  398 ++++++
 .../references/authoring/cartesian.md              |  471 ++++++
 .../references/authoring}/color-strategy.md        |    6 +-
 .../authoring/conditional-formatting-part-02.md    |  292 ++++
 .../authoring/conditional-formatting-part-03.md    |  289 ++++
 .../authoring/conditional-formatting-part-04.md    |  375 +++++
 .../authoring/conditional-formatting-part-05.md    |  375 +++++
 .../authoring/conditional-formatting-part-06.md    |  306 ++++
 .../authoring/conditional-formatting-part-07.md    |  384 +++++
 .../references/authoring/conditional-formatting.md |  242 ++++
 .../references/authoring/custom-visuals.md         |  292 ++++
 .../references/authoring}/expressions.md           |  158 ++-
 .../references/authoring/field-parameters.md       |  112 ++
 .../references/authoring}/filter-pane.md           |   10 +-
 .../references/authoring}/filters.md               |   18 +-
 .../references/authoring}/formatting-overview.md   |   54 +-
 .../references/authoring/formatting-part-02.md     |   55 +
 .../references/authoring}/formatting.md            |  105 +-
 .../references/authoring}/image.md                 |    6 +-
 .../powerbi-report-cli/references/authoring/kpi.md |   59 +
 .../powerbi-report-cli/references/authoring/map.md |  311 ++++
 .../references/authoring/model-binding.md          |  165 +++
 .../references/authoring}/page-formatting.md       |   28 +-
 .../references/authoring/powerbi-desktop.md        |   52 +
 .../authoring/powerbi-report-author-cli-part-02.md |   69 +
 .../authoring/powerbi-report-author-cli.md         |  236 +++
 .../references/authoring/preview-part-02.md        |  338 +++++
 .../references/authoring/preview-part-03.md        |   66 +
 .../references/authoring/preview-part-04.md        |   47 +
 .../references/authoring/preview.md                |  299 ++++
 .../references/authoring/re-theming-part-02.md}    |  142 +-
 .../references/authoring/re-theming-part-03.md     |   93 ++
 .../references/authoring/re-theming.md             |   26 +
 .../references/authoring}/screenshot-review.md     |   17 +-
 .../references/authoring}/shape.md                 |   34 +-
 .../references/authoring/slicers-part-02.md        |  443 ++++++
 .../references/authoring}/slicers.md               |  295 +---
 .../references/authoring}/table.md                 |  110 +-
 .../references/authoring}/textbox.md               |    7 +
 .../references/authoring/theming-part-02.md        |  159 +++
 .../references/authoring}/theming.md               |  161 +--
 .../references/authoring}/version-control.md       |   33 +-
 .../references/design.md}                          |  119 +-
 .../references/design}/accessibility.md            |   26 +-
 .../references/design}/anti-patterns.md            |   23 +-
 .../references/design}/archetype-composition.md    |    0
 .../design}/archetypes/analytical-canvas.md        |   34 +-
 .../archetypes/comparative-benchmark-part-02.md    |  144 ++
 .../design}/archetypes/comparative-benchmark.md    |  166 +--
 .../design}/archetypes/executive-summary.md        |   30 +-
 .../design}/archetypes/narrative-story.md          |   32 +-
 .../design}/archetypes/operational-monitor.md      |   29 +-
 .../references/design}/assets/base.json            |    0
 .../references/design}/brownfield.md               |   22 +-
 .../references/design}/chart-selection.md          |   17 +-
 .../references/design}/color.md                    |   27 +-
 .../references/design/design-brief-part-02.md}     |  211 +--
 .../references/design/design-brief.md              |  209 +++
 .../references/design}/interactivity.md            |   44 +-
 .../references/design}/layout.md                   |   21 +-
 .../references/design}/pre-flight-checklist.md     |   26 +-
 .../references/design}/signatures.md               |   25 +
 .../references/design}/tone-catalog.md             |   18 +
 .../references/design}/typography.md               |   19 +-
 .../references/design/visual-cookbook-part-02.md   |  219 +++
 .../references/design}/visual-cookbook.md          |  245 +---
 .../references/management-part-02.md               |  425 ++++++
 .../references/management-part-03.md               |   77 +
 .../references/management-part-04.md               |  243 ++++
 .../powerbi-report-cli/references/management.md    |  178 +++
 .../references/planning-part-02.md                 |  280 ++++
 .../powerbi-report-cli/references/planning.md      |  452 ++++++
 .../skills/powerbi-report-management/SKILL.md      |  540 -------
 .../skills/powerbi-report-planning/SKILL.md        |  580 --------
 .../skills/semantic-model-authoring/SKILL.md       |   37 +-
 .../references/field-parameters.md                 |  171 +++
 .../references/semantic-model-ai-readiness.md      |   32 +-
 .../references/tmdl-guidelines.md                  |   64 +-
 104 files changed, 13469 insertions(+), 5865 deletions(-)

## New CHANGELOG entries
## [Unreleased]

## [0.3.19] - 2026-10-01

### Changed
- **`synapse-migration`** -- Dedicated SQL Pool-to-Lakehouse migrations can now optionally repoint exact dependent Azure Data Factory and Synapse procedure callers after their generated Fabric notebooks are ready, while preserving explicit approval and no-automatic-execution safeguards.
- **`powerbi-report-cli`** -- mandatory validation screenshots now use a
  temporary per-run directory under the local application-data location when no
  validation location is supplied. Explicit save/export/keep destinations are
  retained, while project or synchronized locations receive an exposure warning.
- **`powerbi-report-cli`** -- multi-turn publish workflows reduce repeated
  workspace, item, file, and semantic-model discovery while preserving binding
  validation. Definition downloads retain the required `?format=PBIR` query,
  and publish flows resolve the supplied workspace name before asking how to
  handle the semantic model.
- **`powerbi-report-cli`** -- locked-spec planning now reuses a complete schema
  and page plan supplied in the request instead of redundantly inspecting an
  unrelated local report project.
- **`powerbi-report-cli`** -- greenfield build-and-publish requests now stop at
  the locked-spec approval barrier until the user approves in a later reply.

### Fixed
- **`synapse-migration`** -- generated Fabric notebooks are now rejected before publication when their parameter handling could accept missing required values, mis-handle SQL NULL, or alter source behavior.
- **`synapse-migration`** -- Dedicated Pool discovery now handles incomplete DACPAC scripting safely, schema deployment is resumable without altering incompatible existing targets, notebook publication validates persisted definitions, and approved special-character columns are supported in new Delta tables.
- **`synapse-migration`** -- Dedicated Pool procedures containing dynamic SQL, cursors, or control-flow loops now remain in manual review instead of being treated as automatic conversion candidates.
- **`synapse-migration`** -- Dedicated Pool migrations now provide clearer progress and resumable recovery for large conversions while preserving detailed audit evidence.
- **`powerbi-report-cli`** -- corrected split-reference navigation so report
  authoring, formatting, preview, theming, and management guidance resolves to
  the physical continuation file that contains each referenced section.

## [0.3.18] - 2026-09-24

### Added
- **`skills/powerbi-report-cli`** -- added detailed guidance for same-report
  drillthrough, bookmarks, buttons and actions, custom visuals, field parameters,
  KPI visuals, semantic-model binding, and Desktop or service preview workflows.
- **`project-osmos`** — run complex, long-running Fabric and OneLake data-engineering outcomes from local agents with safe intake, continuation, and task lifecycle guidance; Fabric portal Copilot explains current availability and how to install the Skills for Fabric marketplace in GitHub Copilot CLI.

### Changed
- **`powerbi-report-cli`** -- strengthened planning, design, authoring, validation, screenshot review, and Fabric publishing guidance, including safer preview routing and pre-publish model-binding checks
- **`powerbi-report-cli`** -- routes normal Desktop work through
  `powerbi-report-author preview` and adds model-aware reload guidance with the
  required semantic-model processing, DAX verification, and rendered review.
- **`synapse-migration`** now migrates dedicated SQL pools in Synapse workspaces or standalone deployments to Fabric Lakehouse as schema and code artifacts without source rows, or to Fabric Warehouse with compatibility assessment, security migration, validation, and optional separately approved data movement.

### Fixed
- **`powerbi-report-cli`** -- fixed broken reference anchors and made the
  planning contract continuation mandatory before producing an approved report
  specification; split-guide navigation now names the continuation file instead
  of linking to headings that are not present in the current document.

## [0.3.17] - 2026-09-17

### Added
- **`skills/semantic-model-authoring`** -- adds guidance for creating, editing, reordering, renaming, and deleting Power BI field parameters through the modeling MCP or TMDL.
- **`powerbi-report-cli`** -- one Power BI report skill covering the whole report item. It picks the right mode from your request: planning for requirements, scope and the approval gate; design for tone, page archetype, chart choice, layout, colour, typography and accessibility; authoring for local PBIR/PBIP page, visual, filter, slicer, theme and formatting edits plus PBIR validation and Power BI Desktop verification; and management for publishing, rebinding and updating report items in Fabric.

### Changed
- **`powerbi-authoring` bundle** -- now ships the single `powerbi-report-cli` skill in place of the four separate Power BI report skills. Existing report prompts keep working and you no longer need to pick a skill per phase; ask for the report outcome you want and the skill selects the mode.
- **FabricIQ MCP server** -- the endpoint moved from `https://api.fabric.microsoft.com/v1/mcp/fabricaihub/integrations/m365` to `https://fabriciq.svc.cloud.microsoft/v1/mcp/fabriciq`, and the required routing header changed from `X-VARIANTS: Fabric.Routing.PowerBIDataExploration` to `X-VARIANTS: Fabric.Routing.FabricIQ.V1`. Your existing token keeps working: the new endpoint accepts both the Power BI audience (`https://analysis.windows.net/powerbi/api`) and the Fabric audience (`https://api.fabric.microsoft.com`), so nothing needs re-minting. The bundled configuration is already updated; if you registered FabricIQ by hand in your own MCP client config, re-register it with the new URL and header — the MCP setup instructions have the updated commands.
- **FabricIQ skill and agent** -- the `ResolveReportIdFromUrl(url)` tool is replaced by `ResolveFabricItem(fabricItemId=<guid-or-url>)` on the new endpoint. It accepts a bare item GUID (preferred) as well as a supported Fabric or Power BI artifact URL, and returns the canonical `fabricItemId`, `itemType`, `workspaceId` when known, plus optional next-step instructions. The other FabricIQ tools (`DiscoverArtifacts`, `GetReportMetadata`, `GetSemanticModelSchema`, `ValueSearch`, `ExecuteQuery`) are unchanged, so the rest of the documented workflow is unaffected.
- **APM packaging** -- installing the collection, or the FabricIQ skill on its own, now registers the new endpoint and routing header.

### Removed
- **`powerbi-report-authoring`**, **`powerbi-report-design`**, **`powerbi-report-management`** and **`powerbi-report-planning`** -- replaced by the matching modes of `powerbi-report-cli`. This is a **rename as well as a merge**: the four skills carried no access-method suffix and the merged skill adds the `-cli` discriminator, so if you pin any of those four skills by name, switch to `powerbi-report-cli`.

### Fixed
- **FabricIQ lost automatic Azure CLI sign-in in Claude Code** — the bundled plugin attaches a native Azure CLI `headersHelper` to its remote MCP servers by matching the Fabric API host. Because FabricIQ now answers on its own service host, it no longer matched and was shipped as the only remote server in the bundle with no way to authenticate, so its tools failed to connect after install. Host detection now covers the FabricIQ endpoint as well, and all three bundled remote MCP servers again sign in from your existing `az login` with no extra prompt.
- **Claude Desktop registration was broken for every MCP server, not just FabricIQ** -- the provided registration scripts wrote a bridge entry invoking `@anthropic/mcp-proxy`, which is not a published npm package, so the generated configuration could never start. They now write a pinned `mcp-remote` entry and forward the routing header and bearer token through its `--header` flag, which is what FabricIQ needs to authenticate.
- **The registration scripts no longer write a Claude credential that cannot work** -- when asked for API-key authentication they produced `Authorization: api-key <key>`, which is not a real authentication scheme, and when asked for bearer authentication without a token they wrote the literal text `${FABRIC_MCP_TOKEN}` as the credential, because Claude passes those values through unchanged instead of substituting them. Both cases now skip the header and tell you exactly what to re-run, so a broken sign-in surfaces immediately instead of as a confusing connection failure later.
- **Manual VS Code setup instructions** -- the example used the legacy `github.copilot.chat.mcpServers` setting and omitted the routing header and token, so following it produced a server that connected and then failed on every call. It now shows the current `mcp.json` `servers` shape with a `headers` object and a prompted, password-masked token input.

## [0.3.16] - 2026-09-10

### Added
- Added a root `apm.yml` plus a generated `skills/<name>/apm.yml` for every skill, so a user can install a single skill with `apm install microsoft/skills-for-fabric --skill <name>` instead of a whole plugin bundle.
- Documented the APM bootstrap and the single-skill install flow, including the scope difference between Copilot CLI (`-g`, `~/.copilot/mcp-config.json`) and VS Code (project scope, `.vscode/mcp.json`).

### Changed
- Corrected the MCP setup reference in `sqldw-cli` to link the `mcp-setup/README.md` file rather than the directory, so the link resolves for a single installed skill.

### Fixed
- The `fabric-skills` plugin reuses Azure CLI sign-in for remote MCP connections in local Claude Code. Added matching Codex configuration and guidance for older registrations, without copying access tokens or registering another OAuth application.
- Improved plugin installation compatibility with older Claude Code versions.

## [0.3.15] - 2026-09-04


### Added
- **`skills/sqldw-cli`** -- added a read-only Capacity Metrics workflow that discovers the installed metrics model, adapts to timestamped or fixed-window schema variants, identifies costly Warehouse and Lakehouse SQL endpoint items, and analyzes every Query Insights request overlapping the Capacity Metrics spike range. Results keep fixed-window capacity health separate from broader item history, disclose timeframe and 30-day Query Insights limits, and treat SQL statement candidates as best-effort correlation because Capacity Metrics Operation Id and Query Insights `distributed_statement_id` are different identifiers.
- **`onelake-catalog-govern-cli`** -- audits and safely remediates Microsoft Fabric OneLake catalog governance across domains, workspaces, capacities, protection, and curation, with separate permission-aware modes for tenant admins and data owners.

### Changed
- **`skills/sqldw-cli`** -- expanded composite diagnostics for failed and canceled requests, SQL pool pressure, resource concentration, Lakehouse table health, performance regressions, optimization targets, and user/application activity. Custom SQL pool guidance now uses recurring historical contention and stable application classifiers rather than converting Capacity Metrics CU seconds or Query Insights CPU milliseconds into pool percentages.
- **`skills/sqldw-cli`** -- made operations follow-ups user-facing: results now turn evidence into concrete actions on the investigated workload, SQL item, capacity, or correlation report, while retaining timezone, retention, lag, and confidence caveats as limitations rather than skill-development suggestions.

### Fixed
- **`skills/sqldw-cli`** -- corrected pressure intervals to use the complete pool-state event stream and exact pool matching, included canceled requests in non-success analysis, limited Lakehouse health checks to Lakehouse SQL analytics endpoints, and stopped recommending result-set caching while the feature is unavailable.
- **`skills/sqldw-cli`** -- retained command-less and legitimate Query Insights-referencing requests in historical custom-pool profiles, excluding only agent-labeled diagnostics, and widened duration and CPU aggregation to `bigint`.
- **`semantic-model-authoring`** -- preserves existing Prep data for AI configuration during unrelated semantic model edits and uses the Power BI modeling MCP for read-only metadata discovery when available.
- `synapse-migration` now handles Dedicated SQL Pool DACPAC and zipped SQL-project schema and code migrations more reliably, validates generated Spark SQL, safely resumes interrupted operations, and isolates concurrent migrations across multiple datamarts.


## Guidance-level diff (semantic-model-authoring)
diff --git a/plugins/powerbi-authoring/skills/semantic-model-authoring/SKILL.md b/plugins/powerbi-authoring/skills/semantic-model-authoring/SKILL.md
index 1b2efb1..0acf19b 100644
--- a/plugins/powerbi-authoring/skills/semantic-model-authoring/SKILL.md
+++ b/plugins/powerbi-authoring/skills/semantic-model-authoring/SKILL.md
@@ -1,6 +1,6 @@
 ---
 name: semantic-model-authoring
-description: "Manages Power BI semantic models, including tables, columns, measures, relationships, DAX authoring and tuning, Import, DirectQuery and Direct Lake designs, sources, connections, permissions, refresh, and deployment. Load this skill before acting on a semantic model, unless it is part of publishing a PBIP project, which powerbi-report-management owns. For natural-language data questions use fabriciq; for visuals use powerbi-report-authoring."
+description: "Manages Power BI semantic models, including tables, columns, measures, relationships, field parameters, DAX, Import, DirectQuery and Direct Lake designs, sources, connections, permissions, refresh, and deployment. Load this skill before acting on a semantic model, unless it is part of publishing a PBIP project, which powerbi-report-cli owns. For natural-language data questions use fabriciq; for visuals use powerbi-report-cli."
 ---
 
 > **Telemetry — MANDATORY.** Every `api.fabric.microsoft.com` call must carry
@@ -24,6 +24,7 @@ Use this decision tree to route to the correct workflow based on user intent:
 | Inspect or discover model metadata (tables, columns, measures, relationships)   | [Discover Semantic Model Metadata](#workflow-discover-semantic-model-metadata)      |
 | Add/edit semantic model objects (e.g. measures, tables, columns, relationships) | [Modify an Existing Model](#workflow-modify-an-existing-model)                       |
 | Write or refactor DAX code                                                      | [Modify an Existing Model](#workflow-modify-an-existing-model)                       |
+| Create/edit a field parameter                                                   | [Author a Field Parameter](#workflow-author-a-field-parameter)                       |
 | Improve DAX query or measure performance                                        | [Optimize DAX Performance](#workflow-optimize-dax-performance)                       |
 | Analyze semantic model against best practices                                   | [Analyze Best Practices](#workflow-analyze-best-practices)                           |
 | Prepare a semantic model for AI consumption (Copilot / Data Agents)             | [Semantic Model AI Readiness](#workflow-semantic-model-ai-readiness)                 |
@@ -45,6 +46,7 @@ Load these references on demand when a workflow step requires them. Do not load
 | TMDL Editing                     | [tmdl-guidelines.md](./references/tmdl-guidelines.md)                              | Before generating or editing any TMDL file                                                  |
 | PBIP Projects                    | [pbip.md](./references/pbip.md)                                                    | When working with PBIP folders                                                              |
 | DAX Language                     | [dax-guidelines.md](./references/dax-guidelines.md)                                | When writing or reviewing any DAX code                                                      |
+| Field Parameters                 | [field-parameters.md](./references/field-parameters.md)                            | When creating/editing a field-parameter table (metric selector, dynamic view)   |
 | Metadata Discovery (DAX INFO functions) | [metadata-discovery.md](./references/metadata-discovery.md)                 | When discovering model metadata via DAX INFO functions (see [Workflow: Discover Semantic Model Metadata](#workflow-discover-semantic-model-metadata)) |
 | DAX Performance Decision Guide   | [dax-perf-decision-guide.md](./references/dax-perf-decision-guide.md)              | Start here when optimizing DAX                                                             |
 | DAX Performance Pattern Catalog  | [dax-perf-patterns.md](./references/dax-perf-patterns.md)                          | Load on demand after the decision guide identifies candidate patterns                       |
@@ -128,21 +130,13 @@ Steps:
 
 **When this applies:** User asks to inspect, list, or discover the model's structure - tables, columns, measures, relationships, hierarchies, partitions, roles, or storage internals. Also used internally by other workflows ([Modify](#workflow-modify-an-existing-model), [Analyze Best Practices](#workflow-analyze-best-practices), [AI Readiness](#workflow-semantic-model-ai-readiness)) to inventory the model before editing.
 
-> **Scope:** This workflow covers **metadata** discovery only. To answer natural-language/data questions against the model, use the `FabricIQ` skill instead.
-
 Pick a discovery method (highest priority first):
 
 1. **`powerbi-modeling-mcp` TOM inspection (List / Get)** - the default when `powerbi-modeling-mcp` is registered and connected to the target model **with Write access**. It returns the structured object model directly and stays in sync with pending edits, so it is preferred while authoring.
 
-2. **DAX `INFO` functions** - query the model's `INFO.VIEW.*` / `INFO.*` metadata rowsets. **MANDATORY: before writing or running ANY `INFO`-function DAX, you MUST load [metadata-discovery.md](./references/metadata-discovery.md) first**. Do NOT compose `INFO` queries from memory; load the reference and use its patterns. **Prioritize this method when any of the following is true:**
-   - **You lack Write permission** on the model. `powerbi-modeling-mcp` operations require Write access; with Read or Build access, use `INFO` functions.
-   - **`powerbi-modeling-mcp` is not registered or not available** in the current environment.
- 
-   Execute the `INFO`-function DAX through one of these tools (highest priority first):
-   - **FabricIQ `ExecuteQuery`** - requires only **Read** permission on the model. Load the `FabricIQ` skill for artifact discovery (`DiscoverArtifacts`) and execution mechanics.
-   - **`powerbi-modeling-mcp` `dax_query_operations`** - requires **Write** permission. Use this when the modeling MCP is already connected with Write access.
-
-> **Do NOT use FabricIQ `GetSemanticModelSchema` for authoring metadata discovery** - it is a data-consumption tool that can return stale metadata and miss recent edits. Even when FabricIQ is available, always use the `INFO` functions (via `ExecuteQuery`); they query the live model.
+2. **DAX `INFO.VIEW` functions** - query the model's `INFO.VIEW.*` metadata rowsets. **MANDATORY: before writing or running ANY `INFO`-function DAX, you MUST load [metadata-discovery.md](./references/metadata-discovery.md) first**. Do NOT compose `INFO` queries from memory; load the reference and use its patterns. **Prioritize this method when any of the following is true:**
+   - **You lack Write permission** on the model. `powerbi-modeling-mcp` List / Get operations require Write; with **Build** access, use `INFO.VIEW` functions executed via the `dax_query_operations` tool.
+   - **`powerbi-modeling-mcp` is not registered or not available**. Use Tier 2: export the model definition (`getDefinition`) and inspect the `.tmdl` files for schema metadata.
 
 Start narrow: run the scope-estimation and `INFO.VIEW.*` queries first, then project/filter to only the objects relevant to the task (see [metadata-discovery.md](./references/metadata-discovery.md)).
 
@@ -165,6 +159,23 @@ Steps:
 
 ---
 
+## Workflow: Author a Field Parameter
+
+**When this applies:** User asks to create, edit, reorder, rename, or delete a field parameter. This is a self-contained model-side calculated table; the matching report slicer and visual are separate report work and out of scope here.
+
+Load [field-parameters.md](./references/field-parameters.md) before starting and follow the workflow it defines.
+
+Steps:
+
+1. **Connect & discover** - per [Connecting to a Semantic Model](#connecting-to-a-semantic-model). Detect any existing field parameter (a column carrying `ParameterMetadata` `"kind": 2`) before creating a duplicate.
+2. **Route to the matching sub-workflow** in [field-parameters.md](./references/field-parameters.md):
+   - **Create** a new parameter -> [Workflow: Create a field parameter](./references/field-parameters.md#workflow-create-a-field-parameter) (`table_operations` `CreateFieldParameter` at Tier 1).
+   - **Edit** an existing parameter (add / remove / reorder / relabel fields) -> [Workflow: Edit a field parameter](./references/field-parameters.md#workflow-edit-a-field-parameter) (partition rewrite via `partition_operations`; there is **no** `UpdateFieldParameter` operation).
+   - **Rename or delete** -> [Workflow: Rename or delete a field parameter](./references/field-parameters.md#workflow-rename-or-delete-a-field-parameter).
+3. **Save & validate** - per [Saving Changes to a Semantic Model](#saving-changes-to-a-semantic-model) and [Validation Checklist](#validation-checklist). Confirm the three columns and `ParameterMetadata` `"kind": 2` are intact so Desktop recognizes the table as a field parameter.
+
+---
+
 ## Workflow: Optimize DAX Performance
 
 **When this applies:** User asks to improve DAX query performance, diagnose slow measures, or optimize calculations.
@@ -204,7 +215,7 @@ Steps:
 
 1. **Confirm scope & gather context** - via `ask_user`, confirm consumption mode (reports only / conversational BI / both) and model stability per the *When to Apply* section. Collect business context (process, key metrics, common natural-language questions, vocabulary). Do not invent.
 2. **Connect & inventory** - per [Connecting to a Semantic Model](#connecting-to-a-semantic-model). Capture model contents and the source location (PBIP / Fabric workspace / Desktop-only).
-3. **Evaluate & route** - walk the [Readiness Checklist](./references/semantic-model-ai-readiness.md#readiness-checklist) in order; for each gap, classify the fix per [Editing Capability](./references/semantic-model-ai-readiness.md#editing-capability) (agent-editable TOM metadata vs AI-specific artifacts the user configures in the Power BI "Prep data for AI" UI).
+3. **Evaluate & route** - walk the [Readiness Checklist](./references/semantic-model-ai-readiness.md#readiness-checklist) in order; for each gap, classify the fix per [Supported Editing Routes](./references/semantic-model-ai-readiness.md#supported-editing-routes) (agent-editable TOM metadata vs AI-specific artifacts the user configures in the Power BI "Prep data for AI" UI).
 4. **Present findings** grouped by severity, each tagged with routing (agent-applicable vs user-action-required). Wait for approval.
 5. **Apply approved changes** - apply TOM metadata fixes via [Modify an Existing Model](#workflow-modify-an-existing-model); for AI instructions, AI Data Schema, and Verified Answers, instruct the user to configure them in the Power BI "Prep data for AI" UI and, only if the user agrees, offer suggestions per the readiness reference; Desktop-only PBIX -> instruct user.
 6. **Save, validate, recommend live testing** - per [Saving Changes to a Semantic Model](#saving-changes-to-a-semantic-model) and [Validation Checklist](#validation-checklist); advise the user to test representative natural-language prompts in Copilot or the Data Agent and iterate.
diff --git a/plugins/powerbi-authoring/skills/semantic-model-authoring/references/field-parameters.md b/plugins/powerbi-authoring/skills/semantic-model-authoring/references/field-parameters.md
new file mode 100644
index 0000000..38e05b4
--- /dev/null
+++ b/plugins/powerbi-authoring/skills/semantic-model-authoring/references/field-parameters.md
@@ -0,0 +1,171 @@
+# Field Parameters Reference
+
+A **field parameter** is a dynamic field selector: one slicer lets a report user
+switch which column or measure a visual uses, so a single visual can provide
+many views ("view by Product / Region / Customer", a metric selector, a "dynamic
+view" chart). This reference covers the **model-side object** -- the
+field-parameter calculated table -- which can be created, edited, renamed, or
+deleted entirely from the model, independent of any report.
+
+> **Scope.** The field-parameter calculated table is the whole job here and is
+> fully self-contained model work. The matching report slicer and target visual
+> are separate report (PBIR) work and out of scope for this skill.
+
+## Contents
+
+- [TMDL authoring](#tmdl-authoring)
+- [Workflow: Create a field parameter](#workflow-create-a-field-parameter)
+- [Workflow: Edit a field parameter](#workflow-edit-a-field-parameter)
+- [Workflow: Rename or delete a field parameter](#workflow-rename-or-delete-a-field-parameter)
+- [Common scenarios](#common-scenarios)
+- [Must / Prefer / Avoid](#must--prefer--avoid)
+- [Troubleshooting](#troubleshooting)
+- [Examples](#examples)
+
+---
+
+## TMDL authoring
+
+When authoring or inspecting a field parameter as TMDL, load
+the **Field parameter calculated tables** section of `tmdl-guidelines.md`.
+That section is the single source of truth for the three-column table shape,
+metadata, tuple expression, and escaping rules.
+
+### Recognition
+
+A table **is** a field parameter iff one column carries
+`extendedProperty ParameterMetadata` whose JSON parses to `"kind": 2`. Read the
+TMDL (or query the model) to detect an existing parameter before creating a
+duplicate.
+
+## Workflow: Create a field parameter
+
+**When this applies:** User asks to create a metric selector / "view by" /
+dynamic-view table, or explicitly asks to create a field parameter, and no
+matching parameter exists yet.
+
+Steps:
+
+1. **Recognize & scope** - confirm the request is for a field-parameter table. Build the table here; the matching report slicer and visual, if any, are separate report work.
+2. **Discover** - per [Recognition](#recognition), list existing tables and check for a field parameter that already fits (a column with `ParameterMetadata` `"kind": 2`). If one fits, switch to [Edit a field parameter](#workflow-edit-a-field-parameter) instead of creating a duplicate.
+3. **Gather fields** - collect the ordered list of columns/measures and their slicer labels. If the fields are ambiguous, STOP and use `ask_user`.
+4. **Build** per the skill's **Tool Selection Priority**:
+   - **Tier 1 (MCP, preferred)** - use the `CreateFieldParameter` operation of `table_operations`. Follow the tool definition for the current request shape.
+   - **Tier 2 (no MCP)** - hand-author the field parameter TMDL. Load `tmdl-guidelines.md` and, for PBIP, `pbip.md`; for a Fabric workspace source, round-trip via `getDefinition` -> edit -> `updateDefinition` as described in `semantic-model-rest-api.md`.
+5. **Save & validate** - per the skill's **Saving Changes** and **Validation Checklist**. Confirm the visible label column, the hidden `Fields`/`Order` columns, and `ParameterMetadata` are all present. The visible label column is what a slicer binds to.
+
+---
+
+## Workflow: Edit a field parameter
+
+**When this applies:** User asks to add, remove, reorder, or relabel the fields
+an existing field parameter exposes.
+
+> **No dedicated update operation.** The current MCP has **no**
+> `UpdateFieldParameter`. The field set lives entirely in the calculated
+> partition's tuple expression, so an edit is a **partition rewrite** — the three
+> columns, visibility, sort-by, group-by, and `ParameterMetadata` are independent
+> of the field set and must stay intact.
+
+Steps:
+
+1. **Locate the parameter** - per [Recognition](#recognition), find the table whose column carries `ParameterMetadata` `"kind": 2`. If the named table is not a field parameter, STOP and report it.
+2. **Compute the full new set** - edits are **full replacement**, not merge: build the complete new ordered field list (omitting a field removes it). Re-derive `order` values zero-based and dense from the new field order.
+3. **Rewrite the partition** per the skill's **Tool Selection Priority**:
+   - **Tier 1 (MCP, preferred)** - use the `Update` operation of `partition_operations` to replace the calculated partition expression with the complete new tuple set. Follow the tool definition for the current request shape.
+   - **Tier 2 (no MCP)** - rewrite the partition `source` in the field parameter TMDL; leave the three columns and `ParameterMetadata` untouched.
+4. **Save & validate** - per the skill's **Saving Changes** and **Validation Checklist**. Confirm the columns and `ParameterMetadata` are unchanged and the new tuples materialize.
+
+---
+
+## Workflow: Rename or delete a field parameter
+
+**When this applies:** User asks to rename a field-parameter table or its slicer
+label, or to delete a field parameter entirely.
+
+Steps:
+
+1. **Locate the parameter** - per [Recognition](#recognition).
+2. **Apply the change** (these do **not** touch the field set):
+   - **Rename the table** - `table_operations`, `Operation: "Rename"` (Tier 1), or rename the `table` in TMDL (Tier 2).
+   - **Rename the slicer label** - rename the visible label column with `column_operations` (Tier 1), or the visible `column` in TMDL (Tier 2).
+   - **Delete** - `table_operations`, `Operation: "Delete"` (Tier 1), or remove the table's TMDL file (Tier 2).
+3. **Save & validate** - per the skill's **Saving Changes** and **Validation Checklist**. Note that a rename changes the binding target, so any report slicer already bound to the old name will need to be repointed on the report side.
+
+---
+
+## Common scenarios
+
+| Scenario | Approach |
+| --- | --- |
+| Create a "view by Product / Region / Customer" selector | [Create a field parameter](#workflow-create-a-field-parameter): one parameter over the dimension columns. |
+| Create a metric selector (Sales / Profit / Margin) | [Create a field parameter](#workflow-create-a-field-parameter): one parameter over the measures. |
+| Add a field to an existing parameter | [Edit a field parameter](#workflow-edit-a-field-parameter): rewrite the partition with the **full** new ordered set. |
+| Reorder the slicer options | [Edit a field parameter](#workflow-edit-a-field-parameter): re-derive zero-based `order` from the new field order. |
+| Delete an obsolete field parameter | [Rename or delete a field parameter](#workflow-rename-or-delete-a-field-parameter): `table_operations` Delete (Tier 1) or remove the TMDL file (Tier 2). |
+
+---
+
+## Must / Prefer / Avoid
+
+### MUST
+
+- Keep the three-column `[Value1]`/`[Value2]`/`[Value3]` shape and the
+  `ParameterMetadata` `"kind": 2` extended property, or Desktop will not
+  recognize the table as a field parameter.
+- Use dense zero-based `order` values matching field order.
+- Escape labels, table names, and object names in the tuple DAX.
+- Treat edits as **full replacement** of the field set, not a merge.
+
+### PREFER
+
+- Tier 1 `table_operations` `CreateFieldParameter` over hand-editing TMDL when
+  creating -- it generates the shape, metadata, and escaping for you.
+- To edit an existing parameter, rewrite the calculated partition source with
+  `partition_operations` (supply the complete new `{ ... }` set) over
+  hand-diffing individual tuples, and preserve the columns and
+  `ParameterMetadata`.
+
+### AVOID
+
+- Editing only the partition DAX while leaving `ParameterMetadata`, sort-by, or
+  group-by out of sync (Tier 2 hand-edits).
+- Silently building a static `SWITCH`-based table when a field parameter was
+  requested.
+
+---
+
+## Troubleshooting
+
+| Symptom | Likely cause / fix |
+| --- | --- |
+| Desktop shows the table but not as a field parameter | The `ParameterMetadata` `"kind": 2` extended property is missing or malformed on the `Fields` column. Re-create via Tier 1 or restore the extended property. |
+| Slicer options appear in the wrong order | `order` values are not dense/zero-based, or `sortByColumn` on the label/fields columns is not pointing at the `Order` column. |
+| A tuple fails to parse / DAX error | A label, table, or object name was not escaped. Apply the field parameter TMDL escaping rules in `tmdl-guidelines.md`. |
+| Edit dropped fields that should stay | Edits are full replacement — the new `Expression` must list **every** field to keep, not just the added one. |
+| `UpdateFieldParameter` not recognized | There is no such operation. Edit via `partition_operations` (Tier 1) or TMDL (Tier 2) as in [Edit a field parameter](#workflow-edit-a-field-parameter). |
+| Report slicer broke after rename | A rename changes the binding target; the slicer must be repointed to the new name on the report side. |
+
+---
+
+## Examples
+
+### Create a field parameter (Tier 1, MCP)
+
+Prompt: *"Create a field parameter 'Slice by' that switches between Product Name
+and Revenue."*
+
+Use the `CreateFieldParameter` operation of `table_operations` and describe the
+ordered fields and display labels through the current tool schema.
+
+### Reorder / add / remove fields (Tier 1, MCP)
+
+Prompt: *"Add Category first, then keep Product Name and Revenue."* There is no
+`UpdateFieldParameter` operation -- use the `Update` operation of
+`partition_operations` to rewrite the calculated partition with the **complete**
+new ordered set. Omitted fields are removed and order is re-derived zero-based.
+Follow the current tool schema rather than constructing a cached payload.
+
+The three columns, sort-by, group-by, and `ParameterMetadata` are unaffected by
+the partition rewrite -- do not touch them. The visible `Slice by` column is the
+one a report slicer would bind to.
diff --git a/plugins/powerbi-authoring/skills/semantic-model-authoring/references/semantic-model-ai-readiness.md b/plugins/powerbi-authoring/skills/semantic-model-authoring/references/semantic-model-ai-readiness.md
index 5fa4dd1..9e896c2 100644
--- a/plugins/powerbi-authoring/skills/semantic-model-authoring/references/semantic-model-ai-readiness.md
+++ b/plugins/powerbi-authoring/skills/semantic-model-authoring/references/semantic-model-ai-readiness.md
@@ -19,19 +19,29 @@ Ask the user which consumption methods are planned before scoping the readiness
 - **Explicit over implicit** - Implicit measures, extension measures defined in reports, and hidden business logic are invisible to AI. If it must be reachable by natural language, it must live in the model as an explicit measure with metadata.
 - **Iterate from observation** - Write descriptions and AI instructions based on real user prompts and Copilot answers. Do not guess.
 
-## Editing Capability
+## Supported Editing Routes
 
-The agent's ability to *apply* a Copilot readiness item depends on whether the item lives in TOM model metadata (agent-editable) or is an AI-specific artifact that must be configured by the user in the Power BI "Prep data for AI" UI.
+Use the supported editing route for each readiness item. This is a product support policy, not a statement about what might be technically possible through internal or serialized model formats.
 
-| Semantic Model Objects                                                                                   | Editing path                                                                                                                                                                                                           |
-| -------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
-| **TOM metadata** - names, descriptions, relationships, measures, hidden flags, data types, summarization | **Edit via MCP or TMDL** (any source). The agent applies these changes directly.                                                                                                                                       |
-| **AI-specific artifacts** - AI instructions, AI Data Schema selection & synonyms, Verified Answers       | **Not editable by the agent.** Instruct the user to configure these in the Power BI "Prep data for AI" UI. The agent may *offer* suggestions only when appropriate - see sections [4](#4-ai-instructions), [5](#5-ai-data-schema), and [6](#6-verified-answers). |
+| Semantic Model Objects                                                                                   | Supported editing route                                                                                                                                                                                                                                                                    |
+| -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
+| **TOM metadata** - names, descriptions, relationships, measures, hidden flags, data types, summarization | **Agent-editable.** Apply approved changes through MCP or TMDL.                                                                                                                                                                                                                            |
+| **Prep data for AI artifacts** - AI instructions, AI Data Schema configuration & synonyms, Verified Answers | **User-configured.** The agent may assess the model and draft recommendations, but the user reviews and applies them through the Power BI "Prep data for AI" experience. Do not directly author or modify their persisted representation. See sections [4](#4-ai-instructions), [5](#5-ai-data-schema), and [6](#6-verified-answers). |
 
-When presenting findings to the user, tag each item with its routing so the user knows which fixes the agent can apply to the model metadata and which the user must configure in the "Prep data for AI" UI.
+> **Preservation requirement:** Existing Prep data for AI artifacts are user-authored model state. Preserve them unchanged during unrelated MCP, TMDL, deployment, or metadata operations. Do not remove, regenerate, normalize, or rewrite opaque or unrecognized metadata. If an editing workflow cannot guarantee preservation, stop before writing and route the change through supported Power BI tooling.
+
+When presenting findings, tag each item as **Agent-editable** or **User configuration - Prep data for AI** so the user knows which changes the agent can apply and which recommendations require user review and configuration.
 
 **Important:** When incapable of editing any metadata, refer the user to [copilot-prepare-data-ai](https://learn.microsoft.com/power-bi/create-reports/copilot-prepare-data-ai) documentation.
 
+## Prerequisites
+
+Before starting the readiness review:
+
+- Confirm that Copilot is enabled for the organization.
+- Confirm that Power BI Q&A is enabled for the semantic model. 
+- For a PBIP project, verify that `definition.pbism` has `settings.qnaEnabled` set to `true`.
+
 ## Readiness Checklist
 
 Use this checklist as the structure for any Copilot readiness review. Each section is ordered: do not skip ahead - if section 1 fails, fixing section 4 will not help.
@@ -95,7 +105,7 @@ Descriptions provide context that names alone cannot convey. Descriptions writte
 
 AI instructions are freeform text that Copilot reads automatically. They are one of the most impactful controls for conversational BI quality.
 
-> **Editing path:** Not editable by the agent - the user configures AI instructions in the Power BI "Prep data for AI" UI. After the model-metadata changes are applied, prompt the user to ask whether they want the agent to draft suggested AI instructions. See [Editing Capability](#editing-capability).
+> **Supported route:** The agent may analyze the model and draft suggested AI instructions for user review. The user applies approved instructions through the Power BI "Prep data for AI" experience. Do not directly edit their persisted representation, and preserve any existing instructions during unrelated model changes. See [Supported Editing Routes](#supported-editing-routes).
 
 **DO:**
 - Metric routing for ambiguous terms ("when users ask about margin, use `[Standard Margin]`").
@@ -122,7 +132,7 @@ AI instructions are freeform text that Copilot reads automatically. They are one
 
 The AI data schema controls which tables, columns, and measures are exposed to Copilot. It also defines synonyms for tables/columns/measures. Scoping this correctly prevents Copilot from getting confused by helper objects.
 
-> **Editing path:** Not editable by the agent - the user configures the AI Data Schema in the Power BI "Prep data for AI" UI. Prompt the user to ask whether they want suggestions, but only recommend an AI-schema visibility change when the desired AI visibility differs from the model's default visibility (e.g., a measure that should stay visible for reports and ad-hoc exploration but be excluded from AI agents). Do not mirror the report-model visibility as an AI-schema change. See [Editing Capability](#editing-capability).
+> **Supported route:** The agent may draft AI Data Schema recommendations for user review. The user applies approved configuration through the Power BI "Prep data for AI" experience. Only recommend an AI-schema visibility change when the desired AI visibility differs from the model's default visibility (e.g., a measure that should stay visible for reports and ad-hoc exploration but be excluded from AI agents). Do not mirror the report-model visibility as an AI-schema change. See [Supported Editing Routes](#supported-editing-routes).
 
 **DO:**
 - Include only tables, columns, and measures that a business user would meaningfully ask about.
@@ -135,9 +145,9 @@ The AI data schema controls which tables, columns, and measures are exposed to C
 
 ### 6. Verified Answers
 
-Verified Answers are pre-built report visuals that Copilot can return for specific questions. Detailed authoring of Verified Answers is out of scope for this skill (it requires report-layer work and live testing in Power BI), and the underlying TMDL/MCP surface does not expose Verified Answer content for editing.
+Verified Answers are pre-built report visuals that Copilot can return for specific questions. Detailed authoring of Verified Answers is out of scope for this skill because it requires report-layer work and live testing in Power BI.
 
-> **Editing path:** Don't edit verified answers automatically. Instead suggest good candidates for verified answers and ask the user to configure manually in the tool. See [copilot-prepare-data-ai](https://learn.microsoft.com/power-bi/create-reports/copilot-prepare-data-ai-verified-answers) documentation.
+> **Supported route:** Do not edit Verified Answers automatically. Suggest good candidates and ask the user to configure them through the Power BI "Prep data for AI" experience. See [copilot-prepare-data-ai](https://learn.microsoft.com/power-bi/create-reports/copilot-prepare-data-ai-verified-answers) documentation and [Supported Editing Routes](#supported-editing-routes).
 
 **DO:**
 - Inspect the model measures and, based on the measure names and descriptions, recommend the top five questions worth setting as Verified Answers.
diff --git a/plugins/powerbi-authoring/skills/semantic-model-authoring/references/tmdl-guidelines.md b/plugins/powerbi-authoring/skills/semantic-model-authoring/references/tmdl-guidelines.md
index aa9a94d..d622740 100644
--- a/plugins/powerbi-authoring/skills/semantic-model-authoring/references/tmdl-guidelines.md
+++ b/plugins/powerbi-authoring/skills/semantic-model-authoring/references/tmdl-guidelines.md
@@ -161,6 +161,69 @@ table Sales
 			expressionSource: DL_Lakehouse
 ```
 
+### Field parameter calculated tables
+
+A field parameter is a calculated table with one
+`(label, NAMEOF(reference), order)` tuple per selectable field. It has exactly
+three calculated columns bound to `[Value1]` (label), `[Value2]` (field), and
+`[Value3]` (order). Columns and measures can be mixed in one parameter.
+
+```tmdl
+table 'Slice by'
+
+	column 'Slice by Order'
+		dataType: int64
+		isHidden
+		formatString: 0
+		summarizeBy: sum
+		sourceColumn: [Value3]
+
+	column 'Slice by Fields'
+		dataType: string
+		isHidden
+		summarizeBy: none
+		sourceColumn: [Value2]
+		sortByColumn: 'Slice by Order'
+
+		extendedProperty ParameterMetadata = {"version":3,"kind":2}
+
+	column 'Slice by'
+		dataType: string
+		summarizeBy: none
+		sourceColumn: [Value1]
+		sortByColumn: 'Slice by Order'
+
+		relatedColumnDetails
+			groupByColumn: 'Slice by Fields'
+
+	partition 'Slice by' = calculated
+		mode: import
+		source =
+				{
+				    ("Product Name", NAMEOF('Product'[Product Name]), 0),
+				    ("Revenue", NAMEOF('Internet Sales'[Total Sales Amount]), 1)
+				}
+```
+
+Given a parameter named `<P>`, preserve this shape:
+
+| Column | Source | Visibility | Purpose |
+| --- | --- | --- | --- |
+| `<P>` | `[Value1]` | visible | Display label; sorted by the order column and grouped by the fields column |
+| `<P> Fields` | `[Value2]` | hidden | Carries `ParameterMetadata` with `"kind": 2`; sorted by the order column |
+| `<P> Order` | `[Value3]` | hidden | Dense zero-based order; `dataType: int64`, `summarizeBy: sum`, `formatString: 0` |
+
+For each tuple:
+
+- Keep `<order>` zero-based and dense, in field order.
+- Use `NAMEOF` for both columns and measures.
+- Escape `"` as `""` in label string literals.
+- Escape `'` as `''` in single-quoted table references.
BUMPED submodule to bc42aaf734771bf752c1d7082dd91e5a6ca72b9f (commit it in the parent repo)
