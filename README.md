# Sudan Economic Observatory Frontend

Phase 1 static frontend extraction of the single-file MVP, Phase 2 seed-data extraction, and Phase 3 synchronous data services.

## Run

Open `index.html` directly in a browser, or serve this folder with any static server.

```powershell
node static-server.mjs
```

Then open `http://127.0.0.1:4173/`.

No backend, authentication, or database is required in this phase. The existing localStorage keys are unchanged: `seo_obs_v2`, `seo_mp_v1`, and `seo_forum_v2`.

