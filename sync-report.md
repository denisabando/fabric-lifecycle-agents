pinned:   714ea2f9431179344ecd9bc673a9881a773c9f47
upstream: 74f3262c1c3fcc6d2346daaf479af88b946a3c6b
UP_TO_DATE=false

## Changed files in watched paths
CHANGELOG.md                                       | 17 ++++++++++++
 common/SQLDW-CONSUMPTION-CORE.md                   |  6 ++--
 .../powerbi-authoring/.claude-plugin/plugin.json   |  2 +-
 .../powerbi-authoring/.github/plugin/plugin.json   |  2 +-
 .../skills/semantic-model-authoring/SKILL.md       | 16 +++--------
 .../references/semantic-model-ai-readiness.md      | 32 ++++++++++++++--------
 .../references/tmdl-guidelines.md                  |  1 -
 7 files changed, 47 insertions(+), 29 deletions(-)

## New CHANGELOG entries
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
index 1b2efb1..9958029 100644
--- a/plugins/powerbi-authoring/skills/semantic-model-authoring/SKILL.md
+++ b/plugins/powerbi-authoring/skills/semantic-model-authoring/SKILL.md
@@ -128,21 +128,13 @@ Steps:
 
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
 
@@ -204,7 +196,7 @@ Steps:
 
 1. **Confirm scope & gather context** - via `ask_user`, confirm consumption mode (reports only / conversational BI / both) and model stability per the *When to Apply* section. Collect business context (process, key metrics, common natural-language questions, vocabulary). Do not invent.
 2. **Connect & inventory** - per [Connecting to a Semantic Model](#connecting-to-a-semantic-model). Capture model contents and the source location (PBIP / Fabric workspace / Desktop-only).
-3. **Evaluate & route** - walk the [Readiness Checklist](./references/semantic-model-ai-readiness.md#readiness-checklist) in order; for each gap, classify the fix per [Editing Capability](./references/semantic-model-ai-readiness.md#editing-capability) (agent-editable TOM metadata vs AI-specific artifacts the user configures in the Power BI "Prep data for AI" UI).
+3. **Evaluate & route** - walk the [Readiness Checklist](./references/semantic-model-ai-readiness.md#readiness-checklist) in order; for each gap, classify the fix per [Supported Editing Routes](./references/semantic-model-ai-readiness.md#supported-editing-routes) (agent-editable TOM metadata vs AI-specific artifacts the user configures in the Power BI "Prep data for AI" UI).
 4. **Present findings** grouped by severity, each tagged with routing (agent-applicable vs user-action-required). Wait for approval.
 5. **Apply approved changes** - apply TOM metadata fixes via [Modify an Existing Model](#workflow-modify-an-existing-model); for AI instructions, AI Data Schema, and Verified Answers, instruct the user to configure them in the Power BI "Prep data for AI" UI and, only if the user agrees, offer suggestions per the readiness reference; Desktop-only PBIX -> instruct user.
 6. **Save, validate, recommend live testing** - per [Saving Changes to a Semantic Model](#saving-changes-to-a-semantic-model) and [Validation Checklist](#validation-checklist); advise the user to test representative natural-language prompts in Copilot or the Data Agent and iterate.
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
index aa9a94d..b622d07 100644
--- a/plugins/powerbi-authoring/skills/semantic-model-authoring/references/tmdl-guidelines.md
+++ b/plugins/powerbi-authoring/skills/semantic-model-authoring/references/tmdl-guidelines.md
@@ -314,7 +314,6 @@ cultureInfo fr-FR
 - `translations` -> `model Model` -> table/column/measure nesting
 - Use `caption:` for display name, `description:` for tooltips
 - In `model.tmdl`, add `ref cultureInfo <locale>` for each culture
-- Do **not** include `linguisticMetadata` - it is auto-managed
 
 ---
BUMPED submodule to 74f3262c1c3fcc6d2346daaf479af88b946a3c6b (commit it in the parent repo)
