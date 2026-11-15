# Sudan Economic Observatory (SEO)

## Project Overview

Sudan Economic Observatory (SEO) is a frontend-first economic data governance and analytics platform focused on Sudanese macroeconomic, trade, market, institutional, and research data.

The platform is designed to:

* preserve provenance
* support deterministic data ingestion
* validate economic datasets
* manage approval and rollback workflows
* provide structured exploration of economic information
* support long-term institutional economic archives

The system intentionally prioritizes:

* transparency
* traceability
* reproducibility
* governance
* validation

Instead of opaque or AI-generated data pipelines.

---

# Strategic Philosophy

The project is NOT intended to become:

* a universal AI system
* an OCR platform
* a probabilistic data-generation engine
* a hallucination-based parser
* a fully automated PDF intelligence engine

The preferred philosophy is:

```text
Controlled deterministic ingestion
→ validation
→ approval
→ provenance-preserving publication
```

Human-supervised deterministic workflows are preferred over aggressive automation.

---

# Core Principles

## Deterministic Ingestion Only

Every imported observation must come from:

* explicit extraction rules
* known mappings
* validated structured inputs

No inferred/fabricated economic values are allowed.

---

## No Fabricated Balancing Rows

The system must never:

* invent totals
* auto-balance missing rows
* silently repair gaps
* generate estimated economic values

All mismatches must remain visible.

---

## Approval-Gated Publication

No extracted data becomes active automatically.

Workflow:

```text
extract
→ validate
→ review
→ approve
→ publish active observations
```

---

## Rollback Safety

Approved batches must support rollback without destroying provenance.

Rollback:

* deactivates approved observations
* preserves draft history
* preserves validation history
* preserves source references

---

## Provenance Preservation

Every observation should preserve:

* source file
* source page
* extraction rule
* batch id
* approval metadata
* validation metadata
* year
* period type
* flow type

---

# Current Architecture

## Frontend Architecture

Current architecture is frontend-only.

Stack:

* Vite
* Vanilla JavaScript
* localStorage persistence
* PDF.js
* static hosting compatible

No backend/database currently exists.

---

# Main Functional Areas

## 1. Trade Observatory

Supports:

* exports
* imports
* annual datasets
* monthly datasets
* commodity normalization
* validation
* approval workflows
* rollback workflows
* trade explorer

---

## 2. Market Monitoring

Supports:

* market observations
* price tracking
* seed datasets
* future market analytics

---

## 3. Economic Forum

Supports:

* discussion topics
* economic threads
* research-oriented discussions
* policy observations

---

## 4. Research / Library Layer

Supports:

* document cataloging
* economic references
* institutional archives
* policy documents

---

# Storage Model

Current localStorage keys:

```text
seo_obs_v2
seo_mp_v1
seo_forum_v2
```

Trade observations include:

* commodityId
* commodityRaw
* valueUsdThousand
* quantity
* flow
* year
* month
* periodType
* source file
* source page
* ruleId
* validation metadata
* approval metadata

---

# Extraction Workflow

## Phase 1 — PDF Parsing

PDF.js extracts:

* page text
* coordinate items
* layout items
* page metadata

---

## Phase 2 — Deterministic Extraction

Rules identify:

* target table
* expected columns
* expected totals
* commodity mappings
* validation signatures

Examples:

* annual exports summary
* annual imports summary
* monthly exports table
* monthly imports table

---

## Phase 3 — Draft Observations

Parsed rows are written ONLY into:

```text
draftObservations
```

No automatic activation is allowed.

---

## Phase 4 — Validation

Validation includes:

* totals reconciliation
* row count checks
* duplicate checks
* commodity normalization
* annual/monthly reconciliation
* unmapped commodities
* source consistency

---

## Phase 5 — Approval

Approval requires:

* validation pass
* readiness pass
* explicit confirmation phrases
* rule-scoped approval

Approved rows become active observations.

---

## Phase 6 — Rollback

Rollback:

* deactivates approved observations
* preserves draft batches
* preserves provenance
* preserves validation history

---

# Annual vs Monthly Separation

Annual and monthly ingestion must remain isolated.

The system intentionally avoids:

* mixing annual/monthly validation
* cross-activation
* shared approval mutation
* generalized rule reuse across incompatible layouts

---

# Current Trade Data Status

## 2013 Status

Working:

* annual exports
* annual imports
* monthly exports
* monthly imports
* approval workflows
* rollback workflows
* validation

Approved 2013 totals:

* exports: 7,086,219
* imports: 9,918,068

---

## 2014 Status

### Annual

Working:

* annual exports extraction
* annual imports extraction
* validation
* controlled approval
* approval registry

Rule examples:

* cbos-2014-exports-summary-v1
* cbos-2014-imports-summary-v1

---

## 2014 Monthly Investigation

Currently under investigation.

Challenges:

* rotated landscape exports tables
* bilingual Arabic/English layouts
* footer/page-number contamination
* coordinate-grid reconstruction
* PDF.js layout persistence

Current blockers:

* exports coordinate layoutItems not consistently available after parse
* monthly imports deterministic reconstruction still under stabilization

---

# PDF Parsing Philosophy

The project is moving away from:

```text
universal PDF intelligence
```

And toward:

```text
controlled structured ingestion
```

Likely long-term direction:

```text
PDF
→ external extraction
→ reviewed Excel/CSV
→ deterministic SEO import
→ validation
→ approval
```

---

# Preferred External Extraction Tools

Potential tools:

* Camelot
* Tabula
* Excalibur
* pdfplumber
* reviewed Excel workflows

The SEO platform should focus on:

* governance
* validation
* provenance
* approvals
* rollback
* analytics

Rather than low-level PDF reconstruction.

---

# Important Constraints

Do NOT:

* introduce OCR
* introduce AI extraction
* fabricate rows
* silently fix totals
* auto-balance economic values
* bypass approval workflows
* mutate active observations directly
* generalize incompatible parser rules

Prefer:

* year-scoped rules
* deterministic workflows
* explicit diagnostics
* provenance preservation
* approval gating
* rollback safety

---

# Long-Term Vision

SEO is intended to evolve into:

```text
A governed economic intelligence and data management platform for Sudan.
```

Potential future areas:

* macroeconomic datasets
* monetary indicators
* capital market indicators
* trade analytics
* financial inclusion datasets
* policy archives
* institutional knowledge repositories
* research observatory
* economic dashboards
* historical economic archives

While preserving:

* transparency
* auditability
* reproducibility
* institutional trust
