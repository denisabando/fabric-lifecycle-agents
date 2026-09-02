---
name: fsm-deployment
description: "Promoting a semantic model between engagement environments (dev → test → prod) via Fabric deployment pipelines, workspace git integration, or REST updateDefinition, with the firm's approval gates and deployment record. Load when asked to deploy, publish, promote or release a model. Mechanics come from Microsoft's Deploy to Fabric workflow; gates come from here."
---

# Deployment

## Preconditions (hard)
1. A review report for the **current commit** exists with `result: pass`.
2. Target environment is listed in `engagement.yaml: environments`.
3. For any environment tagged `prod: true`, the human has supplied the confirmation token
   printed by `hooks/pre-tool-use.sh` (`DEPLOY-PROD-<client>-<yyyymmdd>`).

## Mechanism (from engagement.yaml: `deployment.method`)
| method | How |
| ------ | --- |
| `git_integration` | merge to the env branch; Fabric workspace syncs. Follow MS `git-integration-operations-cli` skill if vendored bundle includes it, else REST. |
| `deployment_pipeline` | Fabric deployment pipeline stage promote via REST (MS skill: deployment pipelines). |
| `rest_updateDefinition` | `updateDefinition` with the TMDL payload — MS skill *Deploy to Fabric* workflow. |

Always send the telemetry header Microsoft's skill mandates on Fabric API calls.

## After deploy
- Trigger refresh per MS *Refresh Semantic Model* workflow if `engagement.yaml: refresh_after_deploy`.
- Write `clients/<code>/deployments/<Model>-<env>-<yyyymmdd>.md`: commit sha, env, method,
  who confirmed, refresh result.
- Never change data source credentials from the agent; instruct the human.
