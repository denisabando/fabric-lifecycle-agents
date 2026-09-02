---
client: acme-demo
report: Sales Performance
status: approved
approved_by: J. Client (Acme BI Lead)
approved_on: 2026-09-02
model_commit: <sha of the passing Sales review>
---

# Report spec — Sales Performance

(On a real engagement this is Microsoft's `_brief/report-spec.md` produced by `powerbi-report-planning`;
kept beside the client artefacts here so the demo is self-contained.)

## Audience
Regional managers and the Acme BI lead. Weekly check-in, mobile-unfriendly is acceptable.

## Pages
| Page | Archetype (RP-05) | Questions answered |
| Sales Overview | Overview | Net sales this FY vs PY by month; which stores drive it; basket size |

## Visuals (all bound to visible objects at the pinned model commit, RP-01)
| Visual | Type | Fields |
| cardNetSales | card | [Net Sales (AUD)] |
| colNetSalesByMonth | clustered column | Date[Fiscal Month]; [Net Sales (AUD)], [Net Sales PY (AUD)] |
| tblStore | table | Store[Region], Store[Store]; [Net Sales (AUD)], [Net Sales YoY %], [Avg Basket (AUD)] |
| slicerFY | slicer | Date[Fiscal Year] |

## Design brief
Firm theme (RP-04). Glossary titles (RP-08). No report measures (RP-02) — "Units #" requested by
the client is logged in `Sales.model-change-requests.md` for the model team.
