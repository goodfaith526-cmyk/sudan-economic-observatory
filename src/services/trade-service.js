window.SEO_SERVICES = window.SEO_SERVICES || {};

window.SEO_SERVICES.trade = {
  key: "seo_obs_v2",
  version: 2,

  makeId(prefix, parts) {
    return prefix + "_" + parts.map((part) => String(part ?? "").trim().toLowerCase().replace(/\s+/g, "-")).join("_");
  },

  emptyNormalized() {
    return {
      version: this.version,
      sourceFiles: [],
      importBatches: [],
      draftObservations: [],
      observations: [],
      publishedTotals: [],
      validationResults: [],
      extractionRules: [],
      activeYearBatches: {},
      activeYearRuleBatches: {},
    };
  },

  ensureNormalizedShape(normalized = {}) {
    const shaped = this.emptyNormalized();
    shaped.sourceFiles = Array.isArray(normalized.sourceFiles) ? normalized.sourceFiles : [];
    shaped.importBatches = Array.isArray(normalized.importBatches) ? normalized.importBatches : [];
    shaped.draftObservations = Array.isArray(normalized.draftObservations) ? normalized.draftObservations : [];
    shaped.observations = Array.isArray(normalized.observations) ? normalized.observations : [];
    shaped.publishedTotals = Array.isArray(normalized.publishedTotals) ? normalized.publishedTotals : [];
    shaped.validationResults = Array.isArray(normalized.validationResults) ? normalized.validationResults : [];
    shaped.extractionRules = Array.isArray(normalized.extractionRules) ? normalized.extractionRules : [];
    shaped.activeYearBatches = normalized.activeYearBatches && typeof normalized.activeYearBatches === "object" ? normalized.activeYearBatches : {};
    shaped.activeYearRuleBatches = normalized.activeYearRuleBatches && typeof normalized.activeYearRuleBatches === "object" ? normalized.activeYearRuleBatches : {};
    return shaped;
  },

  loadDatabase(seed) {
    const saved = window.SEO_SERVICES.storage.getJSON(this.key, {});
    const normalizedSeed = this.buildNormalizedFromLegacy(seed, saved);
    if (!saved.years) {
      const seedClone = window.SEO_SERVICES.storage.clone(seed);
      seedClone.normalized = normalizedSeed;
      window.SEO_TRADE_NORMALIZED = seedClone.normalized;
      return seedClone;
    }

    const merged = window.SEO_SERVICES.storage.clone(seed);
    if (Array.isArray(saved.annual)) {
      saved.annual.forEach((row) => {
        const existing = merged.annual.find((seedRow) => seedRow.y === row.y);
        if (existing) {
          existing.e = row.e;
          existing.i = row.i;
        } else {
          merged.annual.push(row);
        }
      });
      merged.annual.sort((a, b) => String(a.y).localeCompare(String(b.y)));
    }
    Object.keys(saved.years || {}).forEach((year) => {
      merged.years[year] = saved.years[year];
    });

    if (saved.sources) {
      merged.sources = [
        ...seed.sources,
        ...(saved.sources || []).filter((source) => !seed.sources.find((seedSource) => seedSource.year === source.year && seedSource.file === source.file)),
      ];
    }

    merged.normalized = this.rebuildNormalized(merged, saved);
    window.SEO_TRADE_NORMALIZED = merged.normalized;
    return merged;
  },

  saveDatabase(db, seed) {
    const normalized = this.rebuildNormalized(db, db.normalized || {});
    const compactNormalized = this.compactNormalizedForStorage(normalized);
    const toSave = {
      version: this.version,
      annual: db.annual.filter((row) => !seed.annual.find((seedRow) => seedRow.y === row.y && seedRow.e === row.e && seedRow.i === row.i)),
      years: {},
      sources: db.sources.filter((source) => !seed.sources.find((seedSource) => seedSource.year === source.year && seedSource.file === source.file)),
      sourceFiles: compactNormalized.sourceFiles,
      importBatches: compactNormalized.importBatches,
      draftObservations: compactNormalized.draftObservations,
      observations: compactNormalized.observations,
      publishedTotals: compactNormalized.publishedTotals,
      validationResults: compactNormalized.validationResults,
      extractionRules: compactNormalized.extractionRules,
      activeYearBatches: compactNormalized.activeYearBatches,
      activeYearRuleBatches: compactNormalized.activeYearRuleBatches,
    };

    Object.keys(db.years).forEach((year) => {
      if (!seed.years[year]) toSave.years[year] = db.years[year];
    });

    db.normalized = compactNormalized;
    window.SEO_TRADE_NORMALIZED = compactNormalized;
    window.SEO_SERVICES.storage.setJSON(this.key, toSave);
  },

  compactNormalizedForStorage(normalized) {
    const shaped = this.ensureNormalizedShape(normalized || {});
    return {
      ...shaped,
      importBatches: (shaped.importBatches || []).map((batch) => this.compactImportBatchForStorage(batch)),
      validationResults: (shaped.validationResults || []).map((validation) => this.compactValidationForStorage(validation)),
    };
  },

  compactImportBatchForStorage(batch) {
    const next = { ...batch };
    if (Array.isArray(next.debugPreviewPages)) {
      next.debugPreviewSummary = {
        pageCount: next.debugPreviewPages.length,
        pagesWithText: next.debugPreviewPages.filter((page) => (page.text || "").trim()).length,
        totalTextItems: next.debugPreviewPages.reduce((sum, page) => sum + (Number(page.itemsCount) || 0), 0),
        pageNumbers: next.debugPreviewPages.map((page) => page.pageNumber).slice(0, 120),
        compactedAt: new Date().toISOString(),
        storagePolicy: "page text stored in memory only; removed from localStorage to avoid quota overflow",
      };
      delete next.debugPreviewPages;
    }
    return next;
  },

  compactValidationForStorage(validation) {
    const next = { ...validation };
    if (next.tableTotalRow?.rawRowText) {
      next.tableTotalRow = { ...next.tableTotalRow, rawRowText: String(next.tableTotalRow.rawRowText).slice(0, 240) };
    }
    if (Array.isArray(next.rowDiagnostics)) {
      next.rowDiagnostics = next.rowDiagnostics.slice(0, 40).map((row) => this.compactDiagnosticRow(row));
      next.rowDiagnosticsCompacted = true;
    }
    if (Array.isArray(next.rowReconciliationDiagnostics)) {
      next.rowReconciliationDiagnostics = next.rowReconciliationDiagnostics.slice(0, 40).map((row) => this.compactDiagnosticRow(row));
      next.rowReconciliationDiagnosticsCompacted = true;
    }
    if (next.debug) {
      next.debug = this.compactDebugPayload(next.debug);
    }
    return next;
  },

  compactDiagnosticRow(row) {
    const next = { ...row };
    if (next.rawLine) next.rawLine = String(next.rawLine).slice(0, 220);
    if (next.rawRowText) next.rawRowText = String(next.rawRowText).slice(0, 220);
    if (Array.isArray(next.monthlyValues)) next.monthlyValues = next.monthlyValues.slice(0, 12);
    return next;
  },

  compactDebugPayload(debug) {
    const next = { ...debug };
    delete next.mismatchRawRows;
    delete next.skippedCandidateRows;
    if (Array.isArray(next.candidateRejections)) next.candidateRejections = next.candidateRejections.slice(0, 8);
    next.compacted = true;
    next.compactedAt = new Date().toISOString();
    return next;
  },

  mergeNormalized(saved, fallback) {
    const normalized = this.emptyNormalized();
    normalized.sourceFiles = Array.isArray(saved.sourceFiles) && saved.sourceFiles.length ? saved.sourceFiles : fallback.sourceFiles;
    normalized.importBatches = Array.isArray(saved.importBatches) && saved.importBatches.length ? saved.importBatches : fallback.importBatches;
    normalized.draftObservations = Array.isArray(saved.draftObservations) ? saved.draftObservations : fallback.draftObservations;
    normalized.observations = Array.isArray(saved.observations) && saved.observations.length ? saved.observations : fallback.observations;
    normalized.publishedTotals = Array.isArray(saved.publishedTotals) && saved.publishedTotals.length ? saved.publishedTotals : fallback.publishedTotals;
    normalized.validationResults = Array.isArray(saved.validationResults) ? saved.validationResults : fallback.validationResults;
    normalized.extractionRules = Array.isArray(saved.extractionRules) ? saved.extractionRules : fallback.extractionRules;
    normalized.activeYearBatches = saved.activeYearBatches && typeof saved.activeYearBatches === "object" ? saved.activeYearBatches : fallback.activeYearBatches;
    normalized.activeYearRuleBatches = saved.activeYearRuleBatches && typeof saved.activeYearRuleBatches === "object" ? saved.activeYearRuleBatches : fallback.activeYearRuleBatches;
    return normalized;
  },

  rebuildNormalized(db, saved = {}) {
    const rebuilt = this.buildNormalizedFromLegacy(db, saved);
    const preserved = this.ensureNormalizedShape(saved);
    const publishedBatchIds = new Set(rebuilt.importBatches.map((batch) => batch.id));
    const publishedSourceIds = new Set(rebuilt.sourceFiles.map((source) => source.id));
    rebuilt.sourceFiles.push(...preserved.sourceFiles.filter((source) => !publishedSourceIds.has(source.id)));
    rebuilt.importBatches.push(...preserved.importBatches.filter((batch) => !publishedBatchIds.has(batch.id)));
    rebuilt.draftObservations = preserved.draftObservations;
    rebuilt.observations.push(...preserved.observations.filter((obs) => obs.isPublished && !publishedBatchIds.has(obs.importBatchId)));
    rebuilt.publishedTotals.push(...preserved.publishedTotals.filter((total) => !publishedBatchIds.has(total.importBatchId)));
    rebuilt.validationResults = Array.isArray(saved.validationResults) ? saved.validationResults : rebuilt.validationResults;
    rebuilt.extractionRules = Array.isArray(saved.extractionRules) ? saved.extractionRules : rebuilt.extractionRules;
    rebuilt.activeYearBatches = preserved.activeYearBatches && Object.keys(preserved.activeYearBatches).length ? preserved.activeYearBatches : rebuilt.activeYearBatches;
    rebuilt.activeYearRuleBatches = preserved.activeYearRuleBatches && Object.keys(preserved.activeYearRuleBatches).length ? preserved.activeYearRuleBatches : rebuilt.activeYearRuleBatches;
    return rebuilt;
  },

  buildNormalizedFromLegacy(db, saved = {}) {
    const normalized = this.emptyNormalized();
    const years = Object.keys(db.years || {}).sort();
    years.forEach((year) => {
      const sourceFileId = this.makeId("source", [year, "legacy"]);
      const importBatchId = this.makeId("batch", [year, "legacy"]);
      if (saved.activeYearBatches?.[year] && saved.activeYearBatches[year] !== importBatchId) return;
      normalized.sourceFiles.push({
        id: sourceFileId,
        originalFilename: this.findSourceFileName(db, year),
        sourceOrg: "CBOS",
        publicationTitle: "Foreign Trade Statistical Digest",
        publicationYear: year,
        origin: "legacy",
      });
      normalized.importBatches.push({
        id: importBatchId,
        sourceFileId,
        targetYear: year,
        status: "approved",
        parserVersion: "legacy-adapter-v1",
        importedAt: this.findSourceDate(db, year),
        notes: "Generated from legacy Trade Explorer structure",
      });
      normalized.activeYearBatches[year] = importBatchId;
      this.appendYearObservations(normalized, db, year, sourceFileId, importBatchId);
      this.appendPublishedTotals(normalized, db, year, sourceFileId, importBatchId);
    });
    return normalized;
  },

  findSourceFileName(db, year) {
    const source = (db.sources || []).find((item) => String(item.year) === String(year));
    return source?.file || `Legacy trade data ${year}`;
  },

  findSourceDate(db, year) {
    const source = (db.sources || []).find((item) => String(item.year) === String(year));
    return source?.added || null;
  },

  appendYearObservations(normalized, db, year, sourceFileId, importBatchId) {
    const yearData = db.years?.[year] || {};
    this.appendCommodityObservations(normalized, year, "export", yearData.exp_com || [], sourceFileId, importBatchId);
    this.appendCommodityObservations(normalized, year, "import", yearData.imp_com || [], sourceFileId, importBatchId);
    this.appendCountryObservations(normalized, year, "export", yearData.exp_ctr || [], sourceFileId, importBatchId);
    this.appendCountryObservations(normalized, year, "import", yearData.imp_ctr || [], sourceFileId, importBatchId);
    this.appendPeriodObservations(normalized, year, "export", "monthly", yearData.monthly_e || [], sourceFileId, importBatchId);
    this.appendPeriodObservations(normalized, year, "import", "monthly", yearData.monthly_i || [], sourceFileId, importBatchId);
    this.appendPeriodObservations(normalized, year, "export", "quarterly", yearData.quarterly_e || [], sourceFileId, importBatchId);
    this.appendPeriodObservations(normalized, year, "import", "quarterly", yearData.quarterly_i || [], sourceFileId, importBatchId);
  },

  appendCommodityObservations(normalized, year, flow, rows, sourceFileId, importBatchId) {
    rows.forEach((row, index) => {
      normalized.observations.push({
        id: this.makeId("obs", [year, flow, "commodity", row.n, index]),
        reporterCountry: "SDN",
        partnerCountryId: null,
        flow,
        commodityId: this.makeId("cbos", [row.n]),
        commodityName: row.n,
        countryName: null,
        region: null,
        year: Number(year),
        month: null,
        quarter: null,
        periodType: "annual",
        valueUsd: row.v ? row.v * 1000 : 0,
        valueUsdThousand: row.v || 0,
        quantity: row.q || null,
        unit: row.u || null,
        sourceFileId,
        importBatchId,
        sourcePageNumber: null,
        sourceTableLabel: `${flow} commodities`,
        rawRowText: row.n,
        extractionConfidence: 1,
        reviewStatus: "approved",
        isPublished: true,
      });
    });
  },

  appendCountryObservations(normalized, year, flow, rows, sourceFileId, importBatchId) {
    rows.forEach((row, index) => {
      normalized.observations.push({
        id: this.makeId("obs", [year, flow, "country", row.n, index]),
        reporterCountry: "SDN",
        partnerCountryId: this.makeId("country", [row.n]),
        flow,
        commodityId: null,
        commodityName: null,
        countryName: row.n,
        region: row.r || null,
        year: Number(year),
        month: null,
        quarter: null,
        periodType: "annual",
        valueUsd: row.v ? row.v * 1000 : 0,
        valueUsdThousand: row.v || 0,
        quantity: row.q || null,
        unit: row.u || null,
        sourceFileId,
        importBatchId,
        sourcePageNumber: null,
        sourceTableLabel: `${flow} partner countries`,
        rawRowText: row.n,
        extractionConfidence: 1,
        reviewStatus: "approved",
        isPublished: true,
      });
    });
  },

  appendPeriodObservations(normalized, year, flow, periodType, values, sourceFileId, importBatchId) {
    values.forEach((value, index) => {
      normalized.observations.push({
        id: this.makeId("obs", [year, flow, periodType, index + 1]),
        reporterCountry: "SDN",
        partnerCountryId: null,
        flow,
        commodityId: null,
        commodityName: null,
        countryName: null,
        region: null,
        year: Number(year),
        month: periodType === "monthly" ? index + 1 : null,
        quarter: periodType === "quarterly" ? index + 1 : null,
        periodType,
        valueUsd: value ? value * 1000 : 0,
        valueUsdThousand: value || 0,
        quantity: null,
        unit: null,
        sourceFileId,
        importBatchId,
        sourcePageNumber: null,
        sourceTableLabel: `${flow} ${periodType} totals`,
        rawRowText: String(value || 0),
        extractionConfidence: 1,
        reviewStatus: "approved",
        isPublished: true,
      });
    });
  },

  appendPublishedTotals(normalized, db, year, sourceFileId, importBatchId) {
    const row = (db.annual || []).find((item) => String(item.y) === String(year));
    if (!row) return;
    normalized.publishedTotals.push({ id: this.makeId("total", [year, "export"]), year: Number(year), flow: "export", periodType: "annual", valueUsd: row.e * 1000, valueUsdThousand: row.e, sourceFileId, importBatchId });
    normalized.publishedTotals.push({ id: this.makeId("total", [year, "import"]), year: Number(year), flow: "import", periodType: "annual", valueUsd: row.i * 1000, valueUsdThousand: row.i, sourceFileId, importBatchId });
  },

  createSourceFileMetadata(file, details = {}) {
    const now = new Date().toISOString();
    return {
      id: this.makeId("source", [details.targetYear || "unknown", file?.name || "pdf", Date.now()]),
      originalFilename: file?.name || "Unknown PDF",
      mimeType: file?.type || "application/pdf",
      sizeBytes: file?.size || 0,
      sourceOrg: "CBOS",
      publicationTitle: "Foreign Trade Statistical Digest",
      publicationYear: details.targetYear || null,
      origin: "pdf-upload-prototype",
      uploadedAt: now,
      checksum: null,
      notes: details.notes || "",
    };
  },

  createDraftImportBatch(sourceFile, details = {}) {
    const now = new Date().toISOString();
    return {
      id: this.makeId("batch", [details.targetYear || sourceFile?.publicationYear || "unknown", "draft", Date.now()]),
      sourceFileId: sourceFile?.id || null,
      targetYear: String(details.targetYear || sourceFile?.publicationYear || ""),
      status: "draft",
      parserVersion: details.parserVersion || "pdf-text-foundation-v1",
      ruleFamilyId: details.ruleFamilyId || "cbos-legacy-q4-word-distiller",
      extractionRuleId: details.extractionRuleId || "cbos-2013-q4-v1",
      importedAt: now,
      reviewedAt: null,
      approvedAt: null,
      notes: details.notes || "",
      parseSummary: details.parseSummary || null,
    };
  },

  saveDraftObservations(normalized, batchId, observations = []) {
    const shaped = this.ensureNormalizedShape(normalized);
    shaped.draftObservations = shaped.draftObservations.filter((obs) => obs.importBatchId !== batchId);
    shaped.draftObservations.push(...observations.map((obs, index) => ({
      ...obs,
      id: obs.id || this.makeId("draftobs", [batchId, index + 1]),
      importBatchId: batchId,
      reviewStatus: obs.reviewStatus || "draft",
      isPublished: false,
    })));
    return shaped;
  },

  saveDraftObservationsForRule(normalized, batchId, extractionRuleId, observations = []) {
    const shaped = this.ensureNormalizedShape(normalized);
    shaped.draftObservations = shaped.draftObservations.filter((obs) => !(obs.importBatchId === batchId && obs.extractionRuleId === extractionRuleId));
    shaped.draftObservations.push(...observations.map((obs, index) => ({
      ...obs,
      id: obs.id || this.makeId("draftobs", [batchId, extractionRuleId, index + 1]),
      importBatchId: batchId,
      extractionRuleId,
      reviewStatus: obs.reviewStatus || "draft",
      isPublished: false,
    })));
    return shaped;
  },

  getDraftImportBatches(normalized) {
    return this.ensureNormalizedShape(normalized).importBatches.filter((batch) => batch.status === "draft" || batch.status === "parsed" || batch.status === "rejected");
  },

  getDraftObservationsByBatch(normalized, batchId) {
    return this.ensureNormalizedShape(normalized).draftObservations.filter((obs) => obs.importBatchId === batchId);
  },

  markImportBatchStatus(normalized, batchId, status, notes = "") {
    const shaped = this.ensureNormalizedShape(normalized);
    const batch = shaped.importBatches.find((item) => item.id === batchId);
    if (batch) {
      batch.status = status;
      batch.statusUpdatedAt = new Date().toISOString();
      if (notes) batch.notes = notes;
    }
    return shaped;
  },

  query(normalized, query) {
    if (!normalized) return null;
    if (query.flow === "balance") return this.queryBalance(normalized, query);
    if (query.view === "time" && query.periodMode === "annual" && (!query.commodityName || query.commodityName === "all") && (!query.countryName || query.countryName === "all")) return this.queryFlowTotals(normalized, query);
    const observations = this.filterObservations(normalized.observations || [], query);
    if (this.hasMixedPeriodLayers(observations)) return this.mixedPeriodGuardResult(query, observations);
    if (query.yearMode !== "single" && query.commodityName && query.commodityName !== "all") return this.aggregateByTime(observations, query);
    if (query.yearMode !== "single" && query.countryName && query.countryName !== "all") return this.aggregateByTime(observations, query);
    if (query.view === "commodity") return this.aggregateByCommodity(observations, query);
    if (query.view === "country") return this.aggregateByCountry(observations, query);
    return this.aggregateByTime(observations, query);
  },

  filterObservations(observations, query) {
    return observations.filter((obs) => {
      if (!obs.isPublished) return false;
      if (query.flow && obs.flow !== query.flow) return false;
      if (!this.yearMatches(obs.year, query)) return false;
      if (query.periodMode && obs.periodType !== query.periodMode) return false;
      if (query.periodMode === "monthly" && query.month && query.month !== "all" && Number(obs.month) !== Number(query.month)) return false;
      if (query.periodMode === "quarterly" && query.quarter && query.quarter !== "all" && Number(obs.quarter) !== Number(query.quarter)) return false;
      if (query.commodityName && query.commodityName !== "all") {
        const commodity = window.SEO_SERVICES.commodity?.normalizeCommodityName(query.commodityName);
        if (commodity?.commodityId) {
          if (obs.commodityId !== commodity.commodityId) return false;
        } else if (obs.commodityName !== query.commodityName) return false;
      }
      if (query.countryName && query.countryName !== "all" && obs.countryName !== query.countryName) return false;
      if (query.region && query.region !== "all" && obs.region !== query.region) return false;
      return true;
    });
  },

  hasMixedPeriodLayers(observations) {
    return new Set(observations.map((obs) => obs.periodType || "unknown")).size > 1;
  },

  mixedPeriodGuardResult(query, observations) {
    const layers = [...new Set(observations.map((obs) => obs.periodType || "unknown"))].sort();
    return {
      rows: [],
      labels: [],
      data: [],
      data2: [],
      title: "Mixed period layers blocked",
      isBalance: false,
      periodLayer: "mixed",
      periodLayerLabel: "mixed period layers blocked",
      warning: `Query returned mixed period layers (${layers.join(", ")}). Select annual summary or monthly time-series explicitly.`,
    };
  },

  yearMatches(year, query) {
    const y = Number(year);
    if (query.yearMode === "all") return true;
    if (query.yearMode === "range") return y >= Number(query.fromYear) && y <= Number(query.toYear);
    return y === Number(query.year);
  },

  aggregateByCommodity(observations, query) {
    const rows = this.sumBy(observations.filter((obs) => obs.commodityName), (obs) => obs.commodityId || obs.commodityName, (obs) => obs.commodityName)
      .sort((a, b) => b.v - a.v)
      .map((row, index, arr) => ({ type: "commodity", rank: index + 1, lb: row.lb, v: row.v, p: this.share(row.v, arr) }));
    return this.resultFromRows(rows, query);
  },

  aggregateByCountry(observations, query) {
    const rows = this.sumBy(observations.filter((obs) => obs.countryName), (obs) => obs.countryName, (obs) => obs.region)
      .sort((a, b) => b.v - a.v)
      .map((row, index, arr) => ({ type: "country", rank: index + 1, lb: row.lb, v: row.v, r: row.extra || "", pct: this.share(row.v, arr) }));
    return this.resultFromRows(rows, query);
  },

  aggregateByTime(observations, query) {
    const keyFn = (obs) => {
      if (query.periodMode === "monthly") return obs.month;
      if (query.periodMode === "quarterly") return obs.quarter;
      return obs.year;
    };
    const rows = this.sumBy(observations, keyFn)
      .sort((a, b) => Number(a.lb) - Number(b.lb))
      .map((row) => ({ type: "single", lb: this.periodLabel(row.lb, query.periodMode), v: row.v }));
    return this.resultFromRows(rows, query);
  },

  queryBalance(normalized, query) {
    const totals = this.selectActivePublishedTotals(normalized, (total) => total.periodType === "annual" && this.yearMatches(total.year, query));
    const byYear = new Map();
    totals.forEach((total) => {
      const year = String(total.year);
      if (!byYear.has(year)) byYear.set(year, { type: "bal", lb: year, e: 0, i: 0, b: 0 });
      const row = byYear.get(year);
      if (total.flow === "export") row.e += total.valueUsdThousand || 0;
      if (total.flow === "import") row.i += total.valueUsdThousand || 0;
      row.b = row.e - row.i;
    });
    const rows = [...byYear.values()].sort((a, b) => Number(a.lb) - Number(b.lb));
    return { rows, labels: rows.map((row) => row.lb), data: rows.map((row) => row.e), data2: rows.map((row) => row.i), title: "الميزان التجاري السنوي", isBalance: true, periodLayer: "annual", periodLayerLabel: this.periodLayerLabel("annual") };
  },

  queryFlowTotals(normalized, query) {
    const rows = this.selectActivePublishedTotals(normalized, (total) => total.flow === query.flow && total.periodType === "annual" && this.yearMatches(total.year, query))
      .sort((a, b) => Number(a.year) - Number(b.year))
      .map((total) => ({ type: "single", lb: String(total.year), v: total.valueUsdThousand || 0 }));
    return this.resultFromRows(rows, query);
  },

  selectActivePublishedTotals(normalized, filterFn) {
    const shaped = this.ensureNormalizedShape(normalized || {});
    const matching = (shaped.publishedTotals || []).filter(filterFn);
    const ruleScopedKeys = new Set(
      matching
        .filter((total) => total.extractionRuleId)
        .map((total) => [total.year, total.flow, total.periodType].join("|"))
    );
    return matching.filter((total) => {
      if (total.extractionRuleId) {
        const activeRuleBatch = shaped.activeYearRuleBatches?.[`${total.year}:${total.extractionRuleId}`];
        return !activeRuleBatch || activeRuleBatch === total.importBatchId;
      }
      const aggregateKey = [total.year, total.flow, total.periodType].join("|");
      if (ruleScopedKeys.has(aggregateKey)) return false;
      const activeYearBatch = shaped.activeYearBatches?.[String(total.year)];
      return !activeYearBatch || activeYearBatch === total.importBatchId;
    });
  },

  sumBy(observations, keyFn, extraFn) {
    const map = new Map();
    observations.forEach((obs) => {
      const key = keyFn(obs);
      if (key === null || key === undefined || key === "") return;
      const id = String(key);
      const extra = extraFn ? extraFn(obs) : "";
      if (!map.has(id)) map.set(id, { lb: extra || id, v: 0, extra });
      map.get(id).v += obs.valueUsdThousand || 0;
    });
    return [...map.values()];
  },

  share(value, rows) {
    const total = rows.reduce((sum, row) => sum + (row.v || 0), 0);
    return total ? (value / total * 100).toFixed(1) : "—";
  },

  periodLabel(value, periodMode) {
    if (periodMode === "monthly") return String(value);
    if (periodMode === "quarterly") return `Q${value}`;
    return String(value);
  },

  resultFromRows(rows, query) {
    return {
      rows,
      labels: rows.map((row) => row.lb),
      data: rows.map((row) => row.v),
      data2: [],
      title: this.queryTitle(query),
      isBalance: false,
      periodLayer: query.periodMode || "annual",
      periodLayerLabel: this.periodLayerLabel(query.periodMode || "annual"),
    };
  },

  periodLayerLabel(periodMode) {
    if (periodMode === "monthly") return "monthly time-series layer";
    if (periodMode === "quarterly") return "quarterly time-series layer";
    return "annual summary layer";
  },

  queryTitle(query) {
    const flow = query.flow === "export" ? "الصادرات" : "الواردات";
    const period = query.yearMode === "single" ? query.year : query.yearMode === "range" ? `${query.fromYear}–${query.toYear}` : "كل السنوات";
    if (query.commodityName && query.commodityName !== "all") return `${flow} ${query.commodityName} — ${period}`;
    if (query.countryName && query.countryName !== "all") return `${flow} ${query.countryName} — ${period}`;
    if (query.view === "commodity") return `${flow} حسب السلعة — ${period}`;
    if (query.view === "country") return `${flow} حسب الدولة — ${period}`;
    return `${flow} السنوية — ${period}`;
  },
};
