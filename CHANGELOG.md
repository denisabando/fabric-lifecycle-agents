# Changelog

## [0.1.0] - 2026-09-02
### Added
- **MS-00** rule zero: TMDL/PBIP is the only authoring path, no live edits; Modeling MCP is read-only.
  Overrides Microsoft's Tier 1 (logged in `rules/precedence.md`); enforced by `hooks/pre-tool-use.sh`.
- Initial sample repo: orchestrator skill, firm standards, engagement workflow, review/deploy skills,
  subagents, hooks, commands, rules, evals scaffold, upstream sync workflow.
- Vendored `microsoft/skills-for-fabric` as a pinned submodule.
