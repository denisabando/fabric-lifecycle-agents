# First run — Windows + test tenant

Follow in order. Each step proves one thing; stop and note the failure in `OPEN-QUESTIONS.txt` when
something breaks — that is the point of the first run.

## 0. Before you push (Mac)

- `.gitattributes` is in place (`* text=auto`) so Windows does not rewrite line endings.
- `clients/acme-demo/engagement.yaml`: fill `tenant` and the `dev` workspace name.
- Repo is **private** on GitHub.

## 1. Windows prerequisites

| Need | Why | Check |
| --- | --- | --- |
| Git for Windows | clone, submodule, commits | `git --version` |
| Node.js 20+ | Claude Code's runtime; every hook and script here is Node | `node --version` |
| Claude Code + VS Code extension | the agent | `claude --version` |
| Power BI Desktop, PBIP preview features ON | open/verify TMDL and PBIR (Options → Preview features → *Power BI Project (.pbip) save option*, *Store semantic model using TMDL format*, *Store reports using enhanced metadata format (PBIR)*) | open a `.pbip` |
| Azure CLI | Fabric REST via `az rest` (Microsoft's skill) | `az --version` |
| Tabular Editor 2 (free) — optional | BPA step in the post-edit hook; otherwise "skipped" | `TabularEditor.exe` on PATH |
| GitHub CLI (`gh`), then `gh auth login` | `/pr` opens pull requests | `gh auth status` |
| `npm i -g @microsoft/powerbi-report-author` — optional | PBIR validate in the post-edit hook | `powerbi-report-author --version` |

No Python, no bash.

## 2. Clone and install

```powershell
git clone --recurse-submodules <repo-url> fabric-lifecycle-agents
cd fabric-lifecycle-agents
node scripts/doctor.js                 # one line per prerequisite: PASS / FAIL / warn, with the fix
```

`doctor.js` also runs the static evals. Repeat it after each install until every required item passes;
the table in step 1 is what it checks.

If `vendor/skills-for-fabric` is empty you cloned without `--recurse-submodules`: `git submodule update --init`.

In VS Code, open the folder, open Claude Code, then:

```text
/plugin marketplace add .
/plugin install fabric-lifecycle-agents@fabric-agents
```

Restart Claude Code once (registers the Power BI Modeling MCP server). Confirm with `/plugin` that
`fabric-lifecycle-agents` is listed and the `semantic-model`, `report`, `engagement-workflow` skills appear.

## 3. Sign in to the tenant

```powershell
az login --tenant <your-test-tenant>.onmicrosoft.com
```

Your user must be **Admin** on the Fabric workspace. Service principals are a later step (OPEN-QUESTIONS).

## 4. Local loop — proves the plugin without touching Fabric

1. Open `clients\acme-demo\models\Sales.pbip` in Power BI Desktop. It should load the model and the report.
   If Desktop complains, the TMDL or PBIR is wrong — note exactly what it says.
2. In Claude Code: `where are we on acme-demo` → the engagement-workflow skill should answer with phases.
3. `add a "# Units" measure to the acme-demo Sales model` → expect: TMDL edit in `_Measures.tmdl` (not MCP),
   post-edit lint output, a decision record under `clients/acme-demo/decisions/semantic-model/`, lines in
   `clients/acme-demo/audit/<today>.jsonl` including a `Usage` line. If the agent tries the MCP first, the
   `Blocked` line should appear in the audit log.
4. `/review clients/acme-demo/models/Sales.SemanticModel` → a review report in `reviews/` with `model_commit`.
5. `node scripts/usage-report.js clients/acme-demo --by skill` → cost of the above.

Anything that does not behave as listed: write it in `OPEN-QUESTIONS.txt` with the exact message.

## 5. Fabric loop — proves deployment via git integration

1. In the Fabric workspace: *Workspace settings → Git integration* → GitHub → this repo, branch `main`,
   git folder `clients/acme-demo/models`. Connect and sync.
2. Expect the `.platform` files with placeholder logical ids (`00000000-…`) to be rejected. If so:
   delete both `.platform` files, commit, push, sync again; Fabric will generate real ids — commit those back.
3. The `Sales` model and `Sales Performance` report should appear in the workspace. Refresh the model.
   The report binds to the model by path inside the git folder, so no `byConnection` change is needed here.
4. Back in Claude Code: change a measure description, commit, push. In the workspace: *Update from git* →
   refresh → open the report. That is the diffable path end to end.
5. Try `deploy the Sales model to prod` → must be refused (no passing review for this commit / no token).

## 6. Report loop

1. `/report build "Sales Performance" for acme-demo` on a small change (e.g. add a card for `[# Baskets]`).
2. Expect PBIR JSON edits only, `check-report-bindings.js` output from the hook, `powerbi-report-author validate`
   if installed, a decision record under `decisions/report/`.
3. `/review "clients/acme-demo/models/Sales Performance.Report"`.

## 7. Git workflow loop — proves branches, PRs and the trail

Set up once on GitHub: branches `dev`, `test`, `main`; branch protection on all three (require a PR,
require 1 approval). Point the Fabric workspace's git integration at **`dev`**, folder
`clients/acme-demo/models`.

1. In Claude Code, on `main`: `add a "# Units" measure to the acme-demo Sales model` → the agent must
   create a `feature/…` branch first (or the hook blocks the commit — check `audit/` for the `Blocked` line).
2. `/pr` → expect: trailers on the commit, branch pushed, a PR into `dev` with the template filled, decision
   record and review linked. Approve and merge it on GitHub yourself.
3. Workspace → *Update from git* → the measure appears. Refresh.
4. **The reverse direction.** In the Fabric service, open the Sales model, rename any measure's description,
   and use the workspace's *Source control → Commit*. Pull `dev` locally.
5. `node scripts/check-trail.js clients/acme-demo --since main` → the workspace commit is listed as
   UNATTRIBUTED (no trailers, no decision record). `/review clients/acme-demo/models/Sales.SemanticModel`
   should surface the same finding.
6. Try `git push origin main` through the agent → blocked. Open a PR `dev → main` on GitHub instead; that is
   the prod deployment path.

## 8. Not in scope for the first run

Real client repo layout, service principal auth, `byConnection` rebinding, deployment pipelines,
Copilot readiness (needs a larger SKU than F2), data-read enforcement. All in `OPEN-QUESTIONS.txt`.
