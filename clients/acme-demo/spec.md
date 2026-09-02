---
client: acme-demo
model: Sales
status: approved
approved_by: J. Client (Acme BI Lead)
approved_on: 2026-09-01
storage_mode: Import
storage_mode_rationale: 40M rows fits Import comfortably; daily refresh is sufficient; Direct Lake deferred until the Lakehouse is gold-certified.
---

# Model spec — Sales

## Tables
| Table | Type | Grain | Source object | Notes |
| Sales | fact | receipt line | sales.fact_sales_line | MS-01 |
| Store | dim | store | sales.dim_store | region attribute for RLS |
| Product | dim | product (SCD2) | sales.dim_product | |
| Date | dim | day | generated | FY Jul–Jun (CO-02) |
| _Measures | measures | — | — | MS-03 |

## Relationships
| From (many) | To (one) | Direction |
| Sales[StoreKey] | Store[StoreKey] | single |
| Sales[ProductKey] | Product[ProductKey] | single |
| Sales[DateKey] | Date[DateKey] | single |

## Measures
| Name | Description | Intent | Format |
| Net Sales (AUD) | Sales net of GST and returns | SUM of NetAmount | #,0 |
| Baskets # | Number of distinct receipts | DISTINCTCOUNT ReceiptId | #,0 |
| Avg Basket (AUD) | Net sales per basket | Net Sales / Baskets | #,0.00 |
| Net Sales PY (AUD) | Net sales same period prior year | SAMEPERIODLASTYEAR (hand-written, CO-01) | #,0 |
| Net Sales YoY % | Growth vs prior year | DIVIDE(delta, PY) | 0.0% |

## Calculation groups
- disabled per client override CO-01

## Security
| Role | Scope | Test users |
| RLS - Region | Store[Region] = user's region via Security User Region | rm.north@acme-demo.example.com |

## Glossary terms for synonyms
Net Sales, Store, Trading Day, Basket
