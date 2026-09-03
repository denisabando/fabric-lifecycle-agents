# Evals

Two kinds:

1. **Static** (run everywhere, including CI): `scripts/lint-tmdl.js` over `evals/fixtures/**` and
   `clients/acme-demo/models/**`. `fixtures/bad-model` must FAIL; the demo model must PASS.
2. **Scenario** (agent-in-the-loop): each `scenarios/*.md` is a prompt plus assertions the
   resulting TMDL / report must satisfy. `run.js` executes them with the Claude Agent SDK or
   `claude -p` (headless) against the combined agent (vendored MS skill + firm overlay).
   Scenarios tagged `local-only` need the Power BI Modeling MCP (Desktop running) and are skipped
   in CI.

Add a scenario whenever an upstream sync breaks something, so it stays caught.
