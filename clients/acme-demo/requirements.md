---
client: acme-demo
status: complete
owner: Denis
updated: 2026-09-01
---

# Requirements — Acme Retail semantic model

## Business questions
1. Net sales by store, region and month, vs prior year
2. Average basket value by store
3. Top products by net sales

## Consumers
- Reports: Sales Performance (Power BI)
- Copilot / Data Agents: yes

## Facts and grain
| Fact | Grain | Source | Volume | History |
| Sales | one row per receipt line | Lakehouse `sales.fact_sales_line` | ~40M rows | 3 years |

## Dimensions
| Dimension | Source | SCD | Notes |
| Store | `sales.dim_store` | 1 | region attribute |
| Product | `sales.dim_product` | 2 | |
| Date | generated | — | FY starts July |

## Security
- Row-level scope: region managers see their region

## Constraints
- Client team maintains in Power BI Desktop only (no Tabular Editor) → no calc groups
