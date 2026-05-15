# Sudan Economic Observatory (SEO) — Full Implementation Strategy & Architecture Plan

---

## 1. System Architecture

### 1.1 High-Level Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                        SEO Platform                                  │
│                                                                      │
│  ┌──────────────┐   ┌─────────────────────────────────────────────┐ │
│  │   External   │   │               Core Platform                  │ │
│  │  Data Sources│   │                                              │ │
│  │              │   │  ┌─────────────┐   ┌──────────────────────┐ │ │
│  │ - UN Comtrade│──▶│  │  ETL Engine │──▶│  Unified Warehouse   │ │ │
│  │ - IMF        │   │  │  (Staged)   │   │  (PostgreSQL)        │ │ │
│  │ - World Bank │   │  └─────────────┘   └──────────┬───────────┘ │ │
│  │ - WITS       │   │                               │             │ │
│  └──────────────┘   │  ┌────────────────────────────▼───────────┐ │ │
│                      │  │         Query Engine / API Layer        │ │ │
│  ┌──────────────┐   │  │              (FastAPI)                  │ │ │
│  │  Production  │   │  └────────────────────────────┬───────────┘ │ │
│  │  Workbooks   │──▶│                               │             │ │
│  │              │   │  ┌────────────────────────────▼───────────┐ │ │
│  │ - CBOS_2022  │   │  │         Governance & Validation        │ │ │
│  │ - CBOS_2024  │   │  │              Engine                    │ │ │
│  │ - CBOS_2025  │   │  └────────────────────────────────────────┘ │ │
│  └──────────────┘   └─────────────────────────────────────────────┘ │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │                    Frontend (Next.js) — Future                   │ │
│  └─────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

### 1.2 Backend Structure

The backend is a single FastAPI application organized into layered, domain-modular packages. It is NOT a microservices architecture at this stage — unnecessary for the data volumes and team size — but it is designed so that domains can be extracted into services later without restructuring the warehouse or API contracts.

**Three architectural layers:**

**Layer 1 — Core Infrastructure**: Shared across all domains. Database connection management, base ORM models, migration engine, generic query builder, authentication/authorization stubs, audit logging, and configuration management.

**Layer 2 — Domain Modules**: Self-contained packages per economic domain (trade, inflation, exchange rates, etc.). Each domain owns its ETL pipeline, its domain-specific fact tables, its validation rules, and its API routes. Domains share the common dimension tables and the query engine.

**Layer 3 — Platform Services**: Cross-cutting services that orchestrate across domains. This includes the observation registry, the approval workflow service, the download/export service, and the scheduled ingestion coordinator.

### 1.3 Module Strategy

Each economic domain follows a strict internal contract:

```
domain/
  ingestion/     ← Excel/API readers, source-specific adapters
  staging/       ← Raw staging tables + normalization logic
  validation/    ← Domain-specific validation rules
  models/        ← SQLAlchemy ORM for domain fact tables
  api/           ← FastAPI routes, response schemas
  queries/       ← Domain query builders (extend generic engine)
```

Domains register themselves at startup. The platform discovers domain routes, dimension mappings, and validation profiles dynamically. This means adding a new domain (e.g., Market Pulse) requires no changes to the core platform — only a new domain package.

### 1.4 Shared Core vs Domain-Specific Components

| Component | Shared Core | Domain-Specific |
|---|---|---|
| Dimension tables (time, geography, commodity) | Yes | — |
| Observation fact table | Yes (generic) | Extended by domain |
| ETL pipeline orchestration | Yes (framework) | Adapters per source |
| Validation engine | Yes (framework) | Rules per domain |
| Query engine | Yes | Query profiles per domain |
| API routing | Yes (base patterns) | Route handlers per domain |
| Approval workflow | Yes | Configurable per domain |
| Audit trail | Yes | — |
| Source/provenance registry | Yes | — |

---

## 2. Canonical Observation Model Strategy

### 2.1 Core Design Philosophy

The observation is the atomic unit of the warehouse. Everything in SEO is an observation: a value of some measure, at some point in time, across some set of dimensions, from some source, with some validation state.

This is the same philosophy used by SDMX (Statistical Data and Metadata eXchange), which underpins IMF, World Bank, Eurostat, and UN data portals. SEO adopts this philosophy at the application level without requiring SDMX compliance at this stage.

### 2.2 Observation Model

```
Observation = {
  measure:         what is being measured (exports_value, imports_value, cpi_index, ...)
  time_dimension:  when (year, quarter, month — resolved to a canonical period key)
  subject:         who/what the observation is about (Sudan as reporter)
  dimensions:      the full set of classifying axes
  value:           the numeric value
  unit:            USD, SDG, tons, index_points, ...
  source:          which dataset/workbook this came from
  status:          draft | validated | approved | superseded | rejected
  provenance:      full lineage metadata
}
```

### 2.3 Dimension Architecture

Dimensions are shared across domains. The key insight is that dimensions like geography, time, and commodity classification are fundamentally domain-independent — Sudan is Sudan whether you're looking at trade, inflation geography, or banking branch locations.

**Core shared dimensions:**

- **dim_time**: Canonical time periods — supports annual, quarterly, monthly simultaneously. Each row represents a discrete period with attributes for year, quarter number, month number, ISO period code (2024-Q1, 2024-04), fiscal year alignment, and period type discriminator.

- **dim_geography**: A hierarchical geography table. Supports country (ISO 3166), region (Arab world, Sub-Saharan Africa, etc.), trading bloc (COMESA, Arab League, etc.), and Sudan-internal states. One table with a self-referencing parent_id for hierarchy traversal.

- **dim_commodity**: Hierarchical commodity classification. Supports HS2, HS4, HS6 simultaneously via a nested hierarchy. Also supports Sudan-specific CBOS commodity groupings as an alternative classification dimension, linked via a crosswalk table.

- **dim_flow**: Trade flow direction — exports, imports, re-exports, re-imports.

- **dim_source**: Dataset provenance — CBOS_2022, CBOS_2024, UN Comtrade, IMF DOTS, etc.

- **dim_unit**: Unit of measurement — USD (millions), SDG, metric tons, etc.

**Domain-specific dimension extensions:**

Domains can define additional dimensions that attach to their fact tables. For example, the Banking domain may add `dim_bank_type` or `dim_instrument`. These are registered in a dimension registry and do not pollute shared dimension tables.

### 2.4 Extensibility Strategy

Rather than creating a single hyper-generic EAV (Entity-Attribute-Value) observation table — which would be a performance and maintainability disaster — SEO uses **typed observation tables per domain**, all sharing the same structural contract and dimension keys.

A `trade_observations` fact table and an `inflation_observations` fact table both reference `dim_time`, `dim_geography`, and `dim_source`. They carry domain-specific columns that make sense only for their domain. A metadata layer (the observation registry) describes what each observation table contains, enabling cross-domain discovery.

---

## 3. PostgreSQL Warehouse Design

### 3.1 Schema Organization

Use PostgreSQL schemas (namespaces) to separate concerns:

```
seo_core      ← shared dimensions, source registry, governance tables
seo_staging   ← raw ingestion staging tables (temporary, pre-validation)
seo_trade     ← Foreign Trade domain: fact tables, aggregations
seo_inflation ← Inflation domain (future)
seo_fx        ← Exchange Rates domain (future)
seo_banking   ← Banking & Finance domain (future)
seo_pubfin    ← Public Finance domain (future)
seo_mirror    ← Mirror Trade / Counterparty domain (future)
```

This schema separation provides:
- Clear ownership boundaries
- Permission management per domain
- Logical isolation without physical separation
- Easy reasoning about what belongs where

### 3.2 Core Shared Tables (`seo_core` schema)

**`seo_core.dim_time`**
```
period_key      SERIAL PK
period_type     ENUM('annual','quarterly','monthly')
year            SMALLINT NOT NULL
quarter         SMALLINT          -- NULL for annual
month           SMALLINT          -- NULL for annual/quarterly
iso_code        VARCHAR(10)       -- '2024', '2024-Q1', '2024-04'
display_label   VARCHAR(50)
sort_order      INTEGER
fiscal_year     SMALLINT          -- Sudan fiscal year alignment
```

**`seo_core.dim_geography`**
```
geo_key         SERIAL PK
geo_type        ENUM('country','region','bloc','sudan_state','world')
iso2            CHAR(2)
iso3            CHAR(3)
name_en         VARCHAR(200)
name_ar         VARCHAR(200)
parent_key      INTEGER FK → self
wb_region       VARCHAR(100)
un_subregion    VARCHAR(100)
is_active       BOOLEAN DEFAULT TRUE
```

**`seo_core.dim_commodity`**
```
commodity_key   SERIAL PK
hs_code         VARCHAR(10)
hs_level        SMALLINT          -- 2, 4, or 6
description_en  VARCHAR(500)
description_ar  VARCHAR(500)
parent_key      INTEGER FK → self
cbos_group_code VARCHAR(50)       -- CBOS-specific grouping
cbos_group_name VARCHAR(200)
is_active       BOOLEAN DEFAULT TRUE
```

**`seo_core.dim_source`**
```
source_key      SERIAL PK
source_code     VARCHAR(100) UNIQUE   -- 'CBOS_2024', 'UN_COMTRADE'
source_name     VARCHAR(300)
source_type     ENUM('domestic_official','international_official','survey','estimated')
organization    VARCHAR(200)
country         CHAR(3)
url             TEXT
methodology_url TEXT
frequency       ENUM('annual','quarterly','monthly','daily')
first_period    VARCHAR(20)
last_period     VARCHAR(20)
is_active       BOOLEAN DEFAULT TRUE
```

**`seo_core.dim_measure`**
```
measure_key     SERIAL PK
measure_code    VARCHAR(100) UNIQUE   -- 'trade_exports_fob_usd', 'cpi_index'
domain          VARCHAR(50)           -- 'trade', 'inflation', 'fx'
label_en        VARCHAR(300)
label_ar        VARCHAR(300)
unit_default    VARCHAR(50)
value_type      ENUM('stock','flow','index','ratio','count')
description     TEXT
```

### 3.3 Governance Tables (`seo_core` schema)

**`seo_core.ingestion_batches`**
```
batch_id        UUID PK DEFAULT gen_random_uuid()
source_key      INTEGER FK → dim_source
batch_code      VARCHAR(200)       -- 'CBOS_2024_annual_exports_v1'
file_hash       VARCHAR(64)        -- SHA-256 of source file
file_name       TEXT
ingested_at     TIMESTAMPTZ DEFAULT now()
ingested_by     VARCHAR(200)
row_count       INTEGER
status          ENUM('received','staging','validated','approved','rejected','superseded')
notes           TEXT
```

**`seo_core.validation_runs`**
```
run_id          UUID PK
batch_id        UUID FK → ingestion_batches
run_at          TIMESTAMPTZ
run_by          VARCHAR(200)
engine_version  VARCHAR(50)
rule_set        VARCHAR(200)
total_checks    INTEGER
passed_checks   INTEGER
failed_checks   INTEGER
warning_checks  INTEGER
status          ENUM('pass','fail','pass_with_warnings')
summary_json    JSONB
```

**`seo_core.validation_findings`**
```
finding_id      BIGSERIAL PK
run_id          UUID FK → validation_runs
rule_code       VARCHAR(100)
severity        ENUM('error','warning','info')
affected_rows   INTEGER[]
finding_message TEXT
context_json    JSONB
resolved        BOOLEAN DEFAULT FALSE
resolved_at     TIMESTAMPTZ
resolved_by     VARCHAR(200)
resolution_note TEXT
```

**`seo_core.approval_events`**
```
event_id        BIGSERIAL PK
batch_id        UUID FK → ingestion_batches
event_type      ENUM('submitted','validated','approved','rejected','superseded','rolled_back')
event_at        TIMESTAMPTZ DEFAULT now()
actor           VARCHAR(200)
previous_status VARCHAR(50)
new_status      VARCHAR(50)
notes           TEXT
```

**`seo_core.audit_log`**
```
log_id          BIGSERIAL PK
event_at        TIMESTAMPTZ DEFAULT now()
actor           VARCHAR(200)
action          VARCHAR(200)
domain          VARCHAR(50)
entity_type     VARCHAR(100)
entity_id       TEXT
before_json     JSONB
after_json      JSONB
ip_address      INET
session_id      VARCHAR(200)
```

### 3.4 Trade Domain Tables (`seo_trade` schema)

**`seo_trade.trade_facts`** — The primary fact table

```
fact_id         BIGSERIAL PK
batch_id        UUID FK → seo_core.ingestion_batches
period_key      INTEGER FK → seo_core.dim_time
reporter_key    INTEGER FK → seo_core.dim_geography   -- always Sudan initially
partner_key     INTEGER FK → seo_core.dim_geography
commodity_key   INTEGER FK → seo_core.dim_commodity
flow_direction  ENUM('exports','imports','re_exports','re_imports')
source_key      INTEGER FK → seo_core.dim_source
value_usd       NUMERIC(20,4)
value_sdg       NUMERIC(20,4)
quantity        NUMERIC(20,4)
quantity_unit   VARCHAR(50)
is_preliminary  BOOLEAN DEFAULT FALSE
status          ENUM('draft','validated','approved','superseded')
revision_number SMALLINT DEFAULT 1
superseded_by   BIGINT FK → self
created_at      TIMESTAMPTZ DEFAULT now()
```

**`seo_trade.trade_facts_monthly`** — Separate table for monthly granularity

Same structure as `trade_facts` but period_key always resolves to monthly periods. Keeping annual and monthly in separate tables avoids mixed-granularity confusion and enables different partitioning strategies.

**`seo_trade.commodity_crosswalk`** — Maps CBOS commodity names to HS codes

```
crosswalk_id    SERIAL PK
cbos_name       VARCHAR(500)
cbos_group      VARCHAR(200)
hs_code         VARCHAR(10)
hs_level        SMALLINT
confidence      ENUM('exact','approximate','manual')
mapped_by       VARCHAR(200)
mapped_at       TIMESTAMPTZ
notes           TEXT
```

### 3.5 Staging Tables (`seo_staging` schema)

Each ingestion creates temporary staging tables that are fully isolated from production data. Staging tables mirror source structure without applying dimension lookups.

**`seo_staging.trade_raw`** — Ephemeral per batch
```
raw_id          BIGSERIAL PK
batch_id        UUID FK
row_number      INTEGER
sheet_name      VARCHAR(200)
period_raw      VARCHAR(100)
partner_raw     VARCHAR(500)
commodity_raw   VARCHAR(500)
flow_raw        VARCHAR(100)
value_raw       TEXT
quantity_raw    TEXT
unit_raw        TEXT
extra_columns   JSONB
parse_errors    TEXT[]
```

**`seo_staging.trade_normalized`** — After normalization, before fact loading
```
raw_id           BIGINT
batch_id         UUID
period_key       INTEGER          -- NULL if lookup failed
partner_key      INTEGER          -- NULL if lookup failed
commodity_key    INTEGER          -- NULL if lookup failed
value_usd        NUMERIC(20,4)
normalization_warnings TEXT[]
ready_for_load   BOOLEAN
```

### 3.6 Indexing Strategy

**Primary access patterns to optimize:**

1. Time-series queries: filter by reporter + flow + period range → aggregate value
2. Partner profile queries: filter by partner + flow + period → aggregated over commodities
3. Commodity profile queries: filter by commodity + flow + period → aggregated over partners
4. Ranking queries: rank partners or commodities by value in a given period
5. Cross-source comparison: same dimensions, different source_key

**Index recommendations:**

```sql
-- trade_facts
CREATE INDEX idx_trade_time_flow ON seo_trade.trade_facts (period_key, flow_direction);
CREATE INDEX idx_trade_partner ON seo_trade.trade_facts (partner_key, flow_direction, period_key);
CREATE INDEX idx_trade_commodity ON seo_trade.trade_facts (commodity_key, flow_direction, period_key);
CREATE INDEX idx_trade_source ON seo_trade.trade_facts (source_key, status);
CREATE INDEX idx_trade_status ON seo_trade.trade_facts (status) WHERE status = 'approved';
-- Composite for the most common API query pattern:
CREATE INDEX idx_trade_core_query ON seo_trade.trade_facts
  (flow_direction, period_key, status) INCLUDE (value_usd, partner_key, commodity_key);
```

**GIN index on JSONB columns** for ad-hoc filtering on context fields.

### 3.7 Partitioning Strategy

At current anticipated data volumes (tens of thousands of rows per batch, a few hundred thousand total across all years), partitioning is premature and should NOT be implemented in Phase 1. It would add operational complexity without measurable benefit.

**Trigger for revisiting partitioning:** When a single domain's fact table exceeds 10 million rows or query times on indexed columns exceed 500ms. At that point, partition `trade_facts` by `period_key` (year), which aligns with the dominant access pattern.

Mirror trade and international data connectors (Phase 3+) will likely make annual partitioning worthwhile, since those sources contribute orders of magnitude more rows.

---

## 4. ETL & Staging Strategy

### 4.1 Overall ETL Architecture

```
Source File (Excel / API)
         │
         ▼
┌────────────────────────┐
│   Source Reader        │  ← Pandas + OpenPyXL
│   (format-specific)    │  ← Reads raw sheets, preserves structure
└────────┬───────────────┘
         │
         ▼
┌────────────────────────┐
│   Staging Loader       │  ← Writes to seo_staging.trade_raw
│   (batch creation)     │  ← Records file hash, creates batch_id
└────────┬───────────────┘
         │
         ▼
┌────────────────────────┐
│   Normalization Engine │  ← Resolves dimensions, converts units
│   (dimension lookup)   │  ← Produces seo_staging.trade_normalized
└────────┬───────────────┘
         │
         ▼
┌────────────────────────┐
│   Validation Engine    │  ← Runs rule sets, produces findings
│   (domain rules)       │  ← Updates ingestion_batches status
└────────┬───────────────┘
         │  (on approval)
         ▼
┌────────────────────────┐
│   Fact Loader          │  ← Upserts into seo_trade.trade_facts
│   (production load)    │  ← Handles supersession of prior data
└────────────────────────┘
```

### 4.2 Excel Ingestion

**CBOS workbook structure** is complex: multiple sheets, merged cells, mixed row/column structures, custom headers in Arabic and English, and validation cross-checks built into the workbook. The reader must handle this without modifying the source files.

**Reader design principles:**

- Source readers are format-specific adapters. The CBOS_2024 reader knows about CBOS_2024's specific sheet structure. A separate reader handles CBOS_2022 if its format differs. Readers are never generic magic parsers — they are explicit, documented, testable adapters.

- Readers produce a normalized Python dataclass `RawObservationBatch` regardless of source. This is the boundary between format-specific code and the rest of the pipeline. Every reader must produce the same output contract.

- Readers record the complete parse metadata: which cells were read, which were skipped, which had merge conflicts, and which required manual interpretation. This metadata is stored in `ingestion_batches.notes` as structured JSON.

- File hashing (SHA-256) happens before any parsing. If the same file hash has already been processed, the system rejects re-ingestion unless explicitly overridden with a `force_reimport` flag.

### 4.3 Normalization Pipeline

Normalization resolves raw string values from source files to canonical dimension keys. This is where "Saudi Arabia", "KSA", "المملكة العربية السعودية" all resolve to the same `geo_key`.

**Normalization operates in tiers:**

1. **Exact match**: Direct ISO code or canonical name match → immediate resolution.
2. **Alias match**: Lookup in a maintained alias table (`dim_geography_aliases`, `dim_commodity_aliases`). Aliases are curated from prior ingestions.
3. **Fuzzy match**: Levenshtein distance or token-set ratio matching, with a confidence threshold. Results below threshold are flagged as `normalization_warnings` and require human review.
4. **Manual override**: An admin can explicitly create alias mappings or approve fuzzy matches, which then become tier-2 aliases for future ingestions.

Normalization results are written to the staging normalized tables, not directly to fact tables. Facts are only loaded after validation passes.

### 4.4 Provenance Preservation

Every fact row in production carries a `batch_id` that traces back to the exact source file, parse configuration, and normalization decisions. The audit trail is:

```
trade_facts.batch_id → ingestion_batches (file_hash, file_name, ingested_by, ingested_at)
                      → validation_runs (what was checked, what passed)
                      → approval_events (who approved, when, with what notes)
```

This means any production data point can be traced back to the exact cell in the exact Excel file that produced it.

### 4.5 Future External Data Ingestion

When UN Comtrade, IMF DOTS, or World Bank data is integrated, the ETL framework must remain unchanged at the pipeline level. What changes is only the source reader layer:

- `ComtradeApiReader` — calls UN Comtrade REST API, pages through results, normalizes to `RawObservationBatch`
- `ImfDotsReader` — calls IMF SDMX API, deserializes SDMX-JSON, normalizes to `RawObservationBatch`

Both plug into the same normalization, validation, and fact-loading pipeline. The `dim_source` table distinguishes which observations came from which source, enabling mirror trade comparison (Sudan-reported vs counterparty-reported) as a query-time operation, not a schema-level concern.

---

## 5. Validation & Approval Workflow

### 5.1 Validation Engine Architecture

The validation engine is a rules-based system. Rules are defined in Python as composable, testable classes. Each rule has:

- A unique `rule_code` (e.g., `TRADE_VAL_001`)
- A `severity` (error, warning, info)
- A `description` explaining what it checks
- An `apply(batch_id, session)` method that returns a list of `ValidationFinding` objects

Rule sets are domain-specific collections of rules. The trade domain's rule set is registered at domain initialization time.

**Trade domain rule categories:**

- **Structural rules**: Expected sheets present, expected columns found, no completely empty rows, consistent period coverage.
- **Completeness rules**: No NULL values where values are required, all dimension references resolvable, period range matches declared source period.
- **Consistency rules**: Export total matches sum of commodity-level exports within tolerance, monthly totals reconcile to annual totals, no double-counted rows.
- **Range rules**: No negative trade values (re-exports handled separately), values within plausible historical ranges (outlier detection with configurable sigma threshold).
- **Cross-batch rules**: If superseding a prior batch, the overlap period values should not diverge beyond a configurable threshold without an explicit override note.
- **Provenance rules**: File hash recorded, source declared, period declared, reporter declared.

### 5.2 Approval Lifecycle

```
RECEIVED → STAGING → VALIDATED ──┬── APPROVED → (live in production)
                                  └── REJECTED → (stays in staging)

APPROVED can transition to:
  SUPERSEDED ← when a newer batch for the same period is approved

SUPERSEDED data remains in warehouse, queryable with status filter.
```

**State machine rules:**
- Only users with `data_approver` role can transition to `APPROVED`
- A batch with validation errors (severity=error) CANNOT be approved without an explicit override with justification recorded in `approval_events.notes`
- Approval triggers the fact load from staging to production
- Supersession is automatic when a new batch covering the same source + period + domain is approved; prior batch transitions to `SUPERSEDED`, and `trade_facts` rows from that batch are updated with `status='superseded'`

### 5.3 Rollback Logic

Rollback is available for the most recently approved batch per source+period. It:
1. Updates `ingestion_batches.status` back to `validated`
2. Updates all `trade_facts` rows from that batch back to `status='draft'`
3. If a superseded batch exists for the same period, restores it to `approved` and re-activates its fact rows
4. Records a `rolled_back` event in `approval_events`

Rollback does NOT delete data. Data is only ever soft-deleted via status transitions.

### 5.4 Revision Handling

When data is revised (e.g., CBOS publishes a correction to 2022 annual exports), the new batch is ingested as a new batch with `revision_number = prior_revision + 1`. The fact rows carry `revision_number`, enabling queries like "show me all revisions to 2022 annual export data" or "what was the value as-of publication date X."

This is essential for statistical observatory integrity — published data at a point in time should always be reconstructable.

---

## 6. API Design Philosophy

### 6.1 Core Design Principles

The API is an observation query interface, not a chart data API. It never returns "data for the exports treemap" or "data for the partner bar chart." It returns observations matching a query specification, and the frontend decides how to visualize them.

This is the fundamental difference between a dashboard backend and an observatory backend. The API must be visualization-agnostic.

### 6.2 Generic Aggregation / Query Engine

The query engine accepts a declarative query specification:

```json
{
  "domain": "trade",
  "measures": ["value_usd"],
  "filters": {
    "flow_direction": ["exports"],
    "period_type": "annual",
    "year_from": 2018,
    "year_to": 2024,
    "status": "approved"
  },
  "group_by": ["period_key", "partner_key"],
  "order_by": [{"field": "value_usd", "direction": "desc"}],
  "limit": 50,
  "include_totals": true,
  "include_metadata": true
}
```

The engine translates this to a SQL query against the appropriate fact table, applies dimension label enrichment, and returns structured observations with full dimension context.

### 6.3 API Route Philosophy

Routes follow a resource-oriented pattern, NOT a chart-oriented pattern:

**Good (observation-oriented):**
```
GET /api/v1/trade/observations
GET /api/v1/trade/timeseries
GET /api/v1/trade/rankings
GET /api/v1/trade/partners/{iso3}
GET /api/v1/trade/commodities/{hs_code}
```

**Bad (chart-oriented — do not do this):**
```
GET /api/v1/trade/treemap-data         ← NO
GET /api/v1/trade/bar-chart-partners   ← NO
GET /api/v1/trade/dashboard-summary    ← NO
```

### 6.4 Filtering and Grouping Strategy

All query endpoints accept a common set of filter parameters, extended by domain:

**Common filters (all domains):**
- `period_type`: annual | quarterly | monthly
- `year_from`, `year_to`
- `quarter`, `month`
- `source_code`: filter by specific source dataset
- `status`: draft | validated | approved | superseded
- `revision`: specific revision number or `latest`

**Trade-specific filters:**
- `flow_direction`: exports | imports | re_exports | re_imports
- `partner_iso3`: single or comma-separated list
- `partner_region`: geographic region filter
- `partner_bloc`: trading bloc filter (COMESA, Arab League, etc.)
- `hs_code`: specific HS code
- `hs_level`: 2 | 4 | 6
- `cbos_group`: CBOS commodity group code

**Grouping dimensions** are a validated enum — only dimensions that exist in the fact table can be requested as group-by axes. The API returns an error if a grouping dimension is unavailable for the requested domain.

### 6.5 Time Series API

```
GET /api/v1/trade/timeseries?flow=exports&group_by=partner_iso3&partners=SAU,ARE,EGY&period_type=annual
```

Returns an array of series objects, one per group-by value, each with a sorted array of period-value pairs. This is the format that ECharts line charts, D3 multi-line charts, or any time series library consume natively without frontend transformation.

### 6.6 Rankings API

```
GET /api/v1/trade/rankings?flow=exports&rank_by=value_usd&period=2024&group_by=partner&top_n=20
```

Returns an ordered list with ranks, values, share-of-total, and year-over-year change. Rank ties are handled deterministically (alphabetical tiebreak).

### 6.7 Downloads API

The downloads API supports bulk data export in multiple formats:

```
GET /api/v1/trade/download?format=csv&...filters...
GET /api/v1/trade/download?format=xlsx&...filters...
GET /api/v1/trade/download?format=json&...filters...
```

Large downloads are handled asynchronously: the API returns a `job_id` and a polling endpoint. The download is generated in the background, stored temporarily, and the client retrieves it when ready. This prevents API gateway timeouts for large exports.

---

## 7. Visualization / Data Consumption Strategy

### 7.1 Frontend Consumption Model

The frontend is a **data explorer**, not a dashboard. The distinction matters architecturally: a dashboard presents pre-selected views of pre-specified data. An explorer allows the user to specify what they want to see, and the backend returns the appropriate observations.

The frontend is responsible for:
- Accepting user selection inputs (time period, flow direction, geography, commodity level)
- Constructing the appropriate API query from those inputs
- Rendering the API response in the appropriate visualization type
- Allowing the user to switch visualization type without re-fetching if the data already supports it

The frontend is NOT responsible for:
- Aggregating data
- Computing shares or ranks
- Filtering data after receipt
- Transforming observation structures into visualization formats (beyond minimal adapter code)

### 7.2 Chart Independence

Each API response includes a `meta` block that describes the returned data shape:

```json
{
  "meta": {
    "domain": "trade",
    "measure": "value_usd",
    "unit": "USD millions",
    "period_type": "annual",
    "group_by": "partner",
    "total_records": 47,
    "query_time_ms": 34
  },
  "data": [...],
  "totals": {...}
}
```

A thin frontend adapter layer maps this canonical response shape to the input format expected by ECharts or D3. This adapter is the ONLY chart-specific code. Swapping ECharts for D3 means rewriting only the adapters, not the API or data fetching logic.

### 7.3 Explorer-Based UX Architecture

The frontend explorer for trade works as follows:

1. **Context Selector**: User selects time range, flow direction, and analysis level (partner / commodity / both)
2. **API Call**: Frontend constructs and fires the appropriate query
3. **Visualization Selector**: User can switch between: table view, bar chart, treemap, time series, map
4. **All views consume the same API response** — the data is fetched once, visualized multiple ways
5. **Drill-down**: Clicking a partner loads the partner profile; clicking a commodity loads the commodity profile — these are separate API calls to `/partners/{iso3}` or `/commodities/{hs_code}` endpoints

---

## 8. Future Scalability

### 8.1 Adding New Domains (Market Pulse, Inflation, Exchange Rates)

Adding a new domain requires:

1. Create `seo_{domain}` PostgreSQL schema
2. Create Alembic migration for domain-specific fact tables
3. Create Python domain package under `seo/domains/{domain}/`
4. Register domain in the platform domain registry
5. Implement source reader(s) for the domain's data sources
6. Define domain-specific validation rule set
7. Register domain's API routes

The core platform — query engine, validation framework, approval workflow, audit log, download service — requires zero changes. This is the key architectural goal.

### 8.2 Adding Mirror Trade / Counterparty Analytics

Mirror trade is not a new domain — it is a **cross-source analytical layer** over the existing trade domain. When UN Comtrade data is ingested alongside CBOS data:

- Both live in `seo_trade.trade_facts` with different `source_key` values
- `reporter_key` differs: CBOS rows have Sudan as reporter; Comtrade rows may have UAE as reporter for imports from Sudan
- Mirror trade queries join these rows on (partner ↔ reporter, period, commodity, flow ↔ counterflow)
- Gaps, discrepancies, and CIF/FOB adjustments are computed at query time, not stored as derived facts

The Mirror Trade API layer (`/api/v1/mirror-trade/`) would be an analytical service built on top of the existing trade query engine, not a separate warehouse.

### 8.3 Adding External Datasets (UN Comtrade, IMF, World Bank)

The ETL framework handles this through new source readers. Each external source requires:

- A `dim_source` record describing the source
- A reader adapter that calls the external API and produces `RawObservationBatch`
- Potential commodity crosswalk additions (HS code coverage differences)
- Potential geography alias additions (different country naming conventions)

The warehouse, validation engine, and API are unchanged.

### 8.4 Scaling the Platform

**Data volume scaling:**
- PostgreSQL can comfortably handle hundreds of millions of rows with proper indexing
- Read replicas for query-heavy API endpoints
- Materialized views for pre-computed rankings and aggregates (refreshed on approval events)
- Partitioning added when justified by profiling

**API scaling:**
- FastAPI with async endpoints + connection pooling (asyncpg or SQLAlchemy async)
- Redis caching layer for expensive aggregate queries with cache invalidation on approval events
- Query timeout enforcement to prevent runaway aggregation queries

**ETL scaling:**
- Current volumes fit in single-process Pandas pipelines
- If ETL processing time becomes problematic (>30 minutes per batch), migrate to Celery or Prefect for background task orchestration

---

## 9. Folder Structure & Repository Organization

```
sudan-economic-observatory/
│
├── alembic/                          # Database migrations
│   ├── versions/
│   └── env.py
│
├── seo/                              # Main Python package
│   ├── __init__.py
│   ├── main.py                       # FastAPI app entry point
│   ├── config.py                     # Settings (pydantic-settings)
│   ├── database.py                   # SQLAlchemy engine, session factory
│   │
│   ├── core/                         # Shared platform components
│   │   ├── models/                   # SQLAlchemy ORM for seo_core schema
│   │   │   ├── dimensions.py         # dim_time, dim_geography, dim_commodity, ...
│   │   │   ├── governance.py         # ingestion_batches, validation_runs, ...
│   │   │   └── audit.py
│   │   ├── schemas/                  # Pydantic schemas for core entities
│   │   ├── query_engine.py           # Generic aggregation query builder
│   │   ├── validation/
│   │   │   ├── base.py               # ValidationRule base class, ValidationFinding
│   │   │   ├── engine.py             # ValidationEngine orchestrator
│   │   │   └── registry.py          # Rule set registry
│   │   ├── approval/
│   │   │   ├── workflow.py           # State machine, transitions
│   │   │   └── events.py            # Approval event recording
│   │   ├── etl/
│   │   │   ├── base_reader.py        # RawObservationBatch contract
│   │   │   ├── normalization.py      # Dimension resolution engine
│   │   │   ├── staging.py            # Staging table operations
│   │   │   └── fact_loader.py       # Staging → production load
│   │   ├── downloads/
│   │   │   ├── service.py
│   │   │   └── formatters.py        # CSV, XLSX, JSON formatters
│   │   └── api/
│   │       ├── deps.py              # Shared FastAPI dependencies
│   │       └── responses.py         # Standard response envelopes
│   │
│   ├── domains/                      # Economic domains
│   │   ├── __init__.py
│   │   ├── registry.py               # Domain registration
│   │   │
│   │   ├── trade/                    # Foreign Trade domain
│   │   │   ├── __init__.py
│   │   │   ├── models/
│   │   │   │   ├── facts.py          # trade_facts, trade_facts_monthly
│   │   │   │   └── staging.py        # trade_raw, trade_normalized
│   │   │   ├── schemas/              # Pydantic response/request models
│   │   │   ├── ingestion/
│   │   │   │   ├── cbos_2022.py      # CBOS 2022 workbook reader
│   │   │   │   ├── cbos_2024.py      # CBOS 2024 workbook reader
│   │   │   │   └── cbos_2025.py      # CBOS 2025 workbook reader
│   │   │   ├── validation/
│   │   │   │   ├── rules.py          # Trade-specific validation rules
│   │   │   │   └── rule_set.py       # Trade rule set definition
│   │   │   ├── queries/
│   │   │   │   └── builder.py        # Trade-specific query extensions
│   │   │   └── api/
│   │   │       ├── router.py
│   │   │       ├── observations.py
│   │   │       ├── timeseries.py
│   │   │       ├── rankings.py
│   │   │       ├── partners.py
│   │   │       ├── commodities.py
│   │   │       └── downloads.py
│   │   │
│   │   ├── inflation/                # Future: Inflation domain
│   │   │   └── (same structure)
│   │   │
│   │   ├── exchange_rates/           # Future: FX domain
│   │   │   └── (same structure)
│   │   │
│   │   └── mirror_trade/             # Future: Mirror trade analytical layer
│   │       └── (same structure)
│   │
│   └── admin/                        # Admin operations (non-public API)
│       ├── router.py
│       ├── ingestion.py              # Trigger ingestion, view batch status
│       ├── approval.py               # Approve/reject batches
│       ├── dimensions.py             # Manage dimension aliases
│       └── audit.py                  # Audit log viewer
│
├── data/                             # Source data (gitignored for large files)
│   ├── workbooks/
│   │   ├── CBOS_2022/
│   │   ├── CBOS_2024/
│   │   └── CBOS_2025/
│   └── reference/                    # Country lists, HS codes, etc.
│
├── scripts/                          # Operational scripts
│   ├── seed_dimensions.py            # Populate dim_geography, dim_commodity, dim_time
│   ├── ingest_batch.py               # CLI for manual batch ingestion
│   └── validate_batch.py             # CLI for manual validation
│
├── tests/
│   ├── core/
│   │   ├── test_query_engine.py
│   │   ├── test_normalization.py
│   │   └── test_validation_engine.py
│   ├── domains/
│   │   └── trade/
│   │       ├── test_cbos_reader.py
│   │       ├── test_trade_validation.py
│   │       └── test_trade_api.py
│   └── fixtures/
│       └── sample_workbooks/         # Minimal test workbooks
│
├── docs/
│   ├── architecture.md
│   ├── data-model.md
│   ├── etl-guide.md
│   └── api-reference.md
│
├── docker/
│   ├── Dockerfile
│   └── docker-compose.yml
│
├── .env.example
├── pyproject.toml
├── alembic.ini
└── README.md
```

---

## 10. Deployment Strategy

### 10.1 Local Development

```yaml
# docker-compose.yml
services:
  db:
    image: postgres:16
    environment:
      POSTGRES_DB: seo_dev
      POSTGRES_USER: seo
      POSTGRES_PASSWORD: devpassword
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  api:
    build: .
    command: uvicorn seo.main:app --reload --host 0.0.0.0 --port 8000
    volumes:
      - .:/app
      - ./data:/app/data
    environment:
      DATABASE_URL: postgresql+asyncpg://seo:devpassword@db:5432/seo_dev
    ports:
      - "8000:8000"
    depends_on:
      - db
```

Developers run `docker compose up` to get a fully working environment. Alembic migrations are run as a separate step (`docker compose run api alembic upgrade head`) or as part of a startup script.

Seed scripts populate reference dimensions (ISO country codes, HS classifications, time periods) from authoritative reference files checked into the repository.

### 10.2 Production Deployment

**Phase 1 (MVP — single server):** A single VPS or cloud VM running:
- PostgreSQL (managed database service preferred: RDS, Cloud SQL, Supabase, or equivalent)
- FastAPI application behind Nginx reverse proxy
- Systemd service or Docker container for the API

This is deliberately simple and appropriate for the current scale. A managed PostgreSQL eliminates operational burden for backups, failover, and version upgrades.

**Database hosting recommendation:** Use a managed PostgreSQL service. Supabase (open-source, free tier available), Railway, or Neon are all viable for early stages. AWS RDS or Google Cloud SQL for production with SLA requirements.

**Phase 2 (growth):**
- API deployed on a container platform (Railway, Render, or Kubernetes)
- PostgreSQL read replica for query-heavy traffic
- Redis for query result caching
- Background worker process for async downloads and ingestion jobs

### 10.3 Scaling Approach

| Scale trigger | Action |
|---|---|
| API latency > 200ms on indexed queries | Add Redis query cache |
| Concurrent users > 50 | Add read replica, load balance API |
| Batch processing > 30 min | Add Celery/Prefect for async ETL |
| Fact table > 10M rows | Add range partitioning by year |
| Need for near-realtime data | Add streaming ingestion adapter |

---

## 11. Risks & Architectural Tradeoffs

### 11.1 Overengineering Risk

**Risk**: Building too much platform infrastructure before validating the core use cases. The query engine, domain registry, and generic validation framework add significant upfront complexity.

**Mitigation**: Implement Phase 1 (trade domain, basic API, minimal validation) with the correct structural foundations but not full generalization. Generalize only when the second domain is being added and the patterns are confirmed. Resist the temptation to build the full validation rule framework before you have more than 3 rules to put in it.

**Decision point**: If after the trade domain is complete and working, the query engine has only one query profile, simplify it. Don't prematurely abstract what you only use one way.

### 11.2 Fragmentation Risk

**Risk**: Under time pressure, teams add new domains as separate FastAPI apps with separate databases, defeating the unified observatory goal.

**Mitigation**: Establish architectural governance early. The domain registration contract must be documented and enforced. Any new domain that cannot fit the domain module structure should trigger an architectural review, not a bypass.

### 11.3 Dimension Governance Risk

**Risk**: Geography and commodity dimensions become inconsistently maintained. "Saudi Arabia" appears as three different canonical forms because three different people handled three different batches.

**Mitigation**: Dimension tables are seeded from authoritative reference sources (ISO 3166 for countries, UN/WTO HS classification for commodities). Changes to dimension tables require admin-level access and are audit-logged. The alias system prevents the need for raw name changes — add an alias rather than rename a canonical entry.

### 11.4 Performance Risks

**Risk**: Complex multi-dimensional aggregations (e.g., top 20 partners by commodity group for 5-year period) are slow.

**Mitigation**:
- Materialized views for the most common aggregate patterns (annual rankings, period totals)
- Materialized views are refreshed as part of the approval workflow when new data is published
- Query timeouts enforced at the database and API level
- Expensive operations (large downloads) handled asynchronously

### 11.5 CBOS Workbook Complexity Risk

**Risk**: The CBOS workbooks have complex, irregular structures that change between editions. The readers become brittle and require constant maintenance.

**Mitigation**: Each workbook version gets its own explicitly documented reader with full test coverage against a sanitized sample of that workbook. When CBOS_2026 arrives with a new format, a new reader is written — old readers are not modified. This is more code but far more reliable than a "smart" generic reader that breaks silently.

### 11.6 Validation Coverage Risk

**Risk**: Data quality issues in CBOS workbooks pass validation undetected and enter production.

**Mitigation**: The cross-batch reconciliation rules (monthly totals sum to annual, quarterly totals sum to annual) are the strongest safeguard. These are internal consistency checks that don't require external ground truth. Implement these first, before partner/commodity-level range checks.

---

## 12. Recommended Step-by-Step Execution Roadmap

### Phase 0: Foundation (Weeks 1–2)

**Goal**: Working local development environment, schemas created, reference dimensions populated.

- Initialize project structure per folder layout above
- Set up Docker Compose with PostgreSQL
- Configure SQLAlchemy + Alembic
- Create `seo_core` schema with all shared dimension tables and governance tables
- Write and run seed scripts for `dim_time` (2000–2030, all granularities), `dim_geography` (all ISO countries + regions + blocs), `dim_commodity` (HS2 and HS4 at minimum)
- Configure FastAPI application skeleton with health endpoint
- Set up pytest with database fixtures

**MVP deliverable**: `docker compose up` → `GET /health` → `200 OK`. Dimension tables populated and queryable.

---

### Phase 1: Trade Domain — Data Layer (Weeks 3–5)

**Goal**: CBOS workbooks ingested, validated, and accessible in PostgreSQL.

- Create `seo_trade` schema with `trade_facts` and `trade_facts_monthly` tables
- Create `seo_staging` schema with staging tables
- Implement the ETL framework: `BaseReader`, `RawObservationBatch`, normalization engine, staging loader, fact loader
- Implement CBOS_2024 reader (most recent, start here)
- Implement core validation rules: structural, completeness, monthly-to-annual reconciliation
- Implement approval workflow state machine
- Write CLI script `ingest_batch.py` for manual ingestion
- Ingest and validate all three CBOS workbooks (2022, 2024, 2025)
- Write CBOS_2022 and CBOS_2025 readers

**MVP deliverable**: All three CBOS workbooks fully ingested, validated, and approved in PostgreSQL. Data queryable via raw SQL.

---

### Phase 2: Trade Domain — API Layer (Weeks 6–8)

**Goal**: Fully functional trade observation API.

- Implement generic query engine
- Implement trade API routes: observations, timeseries, rankings, partners, commodities
- Implement download API (CSV and JSON; XLSX can follow)
- Write API tests with realistic query patterns
- Document all endpoints (FastAPI auto-docs sufficient for now)
- Performance test key query patterns with realistic data volumes

**MVP deliverable**: Full trade API. A developer (or curl) can query exports by partner by year, get rankings, get timeseries, and download data.

---

### Phase 3: Admin Interface & Governance (Weeks 9–10)

**Goal**: The data pipeline can be operated without direct database access.

- Implement admin API routes: trigger ingestion, view batch status, approve/reject batches, view validation findings, manage dimension aliases
- Implement audit log API
- Consider a minimal admin UI (even a basic HTML form over the API is acceptable at this stage — full Next.js frontend comes later)

**MVP deliverable**: A data manager can ingest a new workbook, review validation findings, and approve the batch through an API or minimal UI.

---

### Phase 4: Frontend Foundation (Weeks 11–14)

**Goal**: Public-facing trade explorer UI.

- Initialize Next.js application
- Implement trade explorer: context selector → API call → visualization (table first, then charts)
- Implement ECharts integration: bar chart, time series, treemap
- Implement partner profile page and commodity profile page
- Implement data download from the frontend

**MVP deliverable**: SEO Trade Explorer is publicly accessible and usable.

---

### Phase 5: Mirror Trade Foundation (Weeks 15–16)

- Integrate UN Comtrade API reader
- Ingest counterparty data for Sudan's top 10 trading partners
- Implement mirror trade analytical queries
- Surface discrepancies in the API

---

### Phase 6: Second Domain — Exchange Rates or Inflation (Weeks 17–20)

**Goal**: Prove the domain extension model works.

- Implement the second economic domain end-to-end
- If the domain registration framework requires adjustment, make it now
- Validate that shared dimensions, governance tables, and the approval workflow work unchanged

**MVP deliverable**: Two independent economic domains in one observatory. The architecture is proven.

---

### Ongoing: International Connectors, Additional Domains, Public Launch

Each subsequent domain follows the Phase 1–3 pattern for that domain. International connectors (IMF, World Bank) are source readers that plug into the existing ETL framework.

---

## Summary of Key Architectural Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Single warehouse vs. per-domain databases | Single PostgreSQL, multiple schemas | Shared dimensions, cross-domain queries, simpler operations |
| Generic EAV observation table vs. typed tables | Typed per-domain fact tables | Performance, type safety, query clarity |
| Microservices vs. modular monolith | Modular monolith initially | Appropriate for scale; domains extractable later if needed |
| Chart-oriented API vs. observation API | Observation API | Visualization independence, reusability, longevity |
| ORM migrations vs. raw SQL migrations | Alembic + SQLAlchemy | Type safety, team familiarity, migration management |
| Eager partitioning vs. defer until needed | Defer | Current volumes don't justify complexity |
| Delete vs. soft-delete for data governance | Soft-delete only (status flags) | Auditability, revision history, rollback capability |
