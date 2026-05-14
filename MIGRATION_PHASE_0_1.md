# Migration Phase 0 and Phase 1

## Phase 0

- Preserved the original MVP as legacy/sudan_economic_observatory.html.
- This legacy file remains the source reference for behavior and UI identity.

## Phase 1

- Created rontend/index.html as the static app entrypoint.
- Extracted inline CSS to rontend/src/styles/main.css.
- Extracted inline JavaScript to rontend/src/app.js.
- Created rontend/src/data/ as the Phase 2 target for seed-data extraction.

## Constraints Preserved

- Arabic RTL remains in the HTML document.
- UI design and markup remain unchanged except for stylesheet/script references.
- Existing features remain in place.
- localStorage remains the active persistence layer.
- No backend, auth, or database migration has been introduced.

## Phase 2

- Moved seed constants from `frontend/src/app.js` into dedicated files under `frontend/src/data/`.
- Kept the same global constant names in `app.js` by reading from `window.SEO_DATA`.
- Kept localStorage keys unchanged: `seo_obs_v2`, `seo_mp_v1`, and `seo_forum_v2`.
- Added `frontend/static-server.mjs` as a local static-server helper for testing.

## Phase 3

- Added synchronous data services under `frontend/src/services/`.
- Kept localStorage as the active source for trade, market, and forum data.
- Kept the existing wrapper functions in `app.js`: `loadDB()`, `saveDB()`, `mpSavePrices()`, `mpLoadPrices()`, and `fSave()`.
- No React, backend, authentication, fetch, async data flow, UI changes, or localStorage key changes were introduced.

## Trade Explorer Phase A

- Added normalized trade storage alongside the current legacy `seo_obs_v2` shape.
- Added adapter-generated `sourceFiles`, `importBatches`, `observations`, `publishedTotals`, `validationResults`, and `activeYearBatches`.
- Kept the current Trade Explorer UI, filters, charts, imports, and exports on the legacy compatibility layer.
- Normalized observations are regenerated from the merged legacy DB so imported years can coexist with 2024/2025 seed data.

## Trade Explorer Phase B1

- Added normalized query helpers for annual, range, and all-year Trade Explorer views.
- Added compatibility adapter from existing `TS` state to `tradeQuery`.
- Added year mode controls: single year, year range, all years.
- Added annual period mode while preserving monthly and quarterly behavior.
- Added single-year month and quarter selectors for monthly/quarterly period narrowing.
- Kept PDF parsing/review workflow out of scope for B1.

