window.SEO_SERVICES = window.SEO_SERVICES || {};

window.SEO_SERVICES.xlsxImport = {

  REQUIRED_SHEETS: [
    'metadata', 'validation_report', 'review_required',
    'trade_balance_summary',
    'annual_exports_summary', 'annual_imports_summary',
    'monthly_exports', 'monthly_imports',
    'quarterly_exports', 'quarterly_imports',
    'exports_by_country_monthly', 'imports_by_country_monthly',
    'exports_country_commodity', 'imports_country_commodity',
  ],

  AR_MONTH_MAP: {
    'يناير':1,'فبراير':2,'مارس':3,'أبريل':4,'مايو':5,'يونيو':6,
    'يوليو':7,'أغسطس':8,'اغسطس':8,'سبتمبر':9,'أكتوبر':10,'نوفمبر':11,'ديسمبر':12,
  },

  makeId(...parts) {
    return parts.map(p => String(p ?? '').trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-_]/g, '')).filter(Boolean).join('_');
  },

  sheetToRows(wb, sheetName) {
    const ws = wb.Sheets[sheetName];
    if (!ws) return [];
    const raw = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null });
    if (raw.length < 2) return [];
    const headers = raw[0].map(h => String(h ?? '').trim());
    return raw.slice(1)
      .filter(row => row.some(v => v !== null && v !== undefined && v !== ''))
      .map(row => {
        const obj = {};
        headers.forEach((h, i) => { obj[h] = row[i] ?? null; });
        return obj;
      });
  },

  readMetadata(wb) {
    return this.sheetToRows(wb, 'metadata')[0] || {};
  },

  validate(wb) {
    const errors = [];

    const missing = this.REQUIRED_SHEETS.filter(s => !wb.SheetNames.includes(s));
    if (missing.length) {
      errors.push(`ورقات مفقودة: ${missing.join(', ')}`);
    }

    if (wb.SheetNames.includes('validation_report')) {
      const valRows = this.sheetToRows(wb, 'validation_report');
      const failed = valRows.filter(r => r.status && String(r.status).trim() !== 'pass');
      if (failed.length) {
        errors.push(`فشل ${failed.length} فحص في validation_report: ${failed.map(r => r.dataset).join(', ')}`);
      }
    }

    return { ok: errors.length === 0, errors };
  },

  // ─── Commodity sheets ────────────────────────────────────────────────────
  // annual_exports_summary, annual_imports_summary,
  // monthly_exports, monthly_imports,
  // quarterly_exports, quarterly_imports

  commodityRowToObs(row, sourceFileId, importBatchId, dataset) {
    return {
      reporterCountry: 'SDN',
      flow: row.flow || null,
      year: Number(row.year),
      periodType: row.period_type || 'annual',
      month: row.month_number != null ? Number(row.month_number) : null,
      quarter: row.quarter != null ? Number(row.quarter) : null,
      commodityName: row.commodity_raw_en || null,
      commodityNameAr: row.commodity_raw_ar || null,
      commodityId: row.commodity_id || null,
      quantity: row.quantity != null ? Number(row.quantity) : null,
      unit: row.unit || null,
      countryName: null,
      partnerCountryId: null,
      region: null,
      valueUsdThousand: Number(row.value_usd_thousand) || 0,
      valueUsd: (Number(row.value_usd_thousand) || 0) * 1000,
      sourceFileId,
      importBatchId,
      sourcePageNumber: row.source_page != null ? Number(row.source_page) : null,
      sourceTableLabel: row.source_table || null,
      rawRowText: row.source_row_label || row.commodity_raw_en || '',
      rowType: row.row_type || 'detail',
      validationStatus: row.validation_status || null,
      observationDataset: dataset,
      extractionConfidence: 1,
      reviewStatus: 'draft',
      isPublished: false,
    };
  },

  // ─── Country-monthly sheets ───────────────────────────────────────────────
  // exports_by_country_monthly, imports_by_country_monthly

  countryMonthlyRowToObs(row, sourceFileId, importBatchId, dataset) {
    return {
      reporterCountry: 'SDN',
      flow: row.flow || null,
      year: Number(row.year),
      periodType: row.period_type || 'monthly',
      month: row.month_number != null ? Number(row.month_number) : null,
      quarter: null,
      commodityName: null,
      commodityNameAr: null,
      commodityId: null,
      quantity: null,
      unit: null,
      countryName: row.country_raw_en || null,
      countryNameAr: row.country_raw_ar || null,
      partnerCountryId: row.country_raw_en ? this.makeId('country', row.country_raw_en) : null,
      region: null,
      valueUsdThousand: Number(row.value_usd_thousand) || 0,
      valueUsd: (Number(row.value_usd_thousand) || 0) * 1000,
      sourceFileId,
      importBatchId,
      sourcePageNumber: row.source_page != null ? Number(row.source_page) : null,
      sourceTableLabel: row.source_table || null,
      rawRowText: row.source_row_label || row.country_raw_en || '',
      rowType: row.row_type || 'detail',
      validationStatus: row.validation_status || null,
      observationDataset: dataset,
      extractionConfidence: 1,
      reviewStatus: 'draft',
      isPublished: false,
    };
  },

  // ─── Country-commodity sheets ─────────────────────────────────────────────
  // exports_country_commodity, imports_country_commodity
  // Stored with both countryName and commodityGroupName.
  // Excluded from standard aggregation views (observationDataset='country-commodity-annual')
  // to avoid double-counting with commodity and country totals.

  countryCommodityRowToObs(row, sourceFileId, importBatchId, dataset) {
    return {
      reporterCountry: 'SDN',
      flow: row.flow || null,
      year: Number(row.year),
      periodType: row.period_type || 'annual',
      month: null,
      quarter: null,
      commodityName: null,
      commodityNameAr: null,
      commodityId: null,
      commodityGroupName: row.commodity_group_raw_en || null,
      commodityGroupNameAr: row.commodity_group_raw_ar || null,
      quantity: null,
      unit: null,
      countryName: row.country_raw_en || null,
      countryNameAr: row.country_raw_ar || null,
      partnerCountryId: row.country_raw_en ? this.makeId('country', row.country_raw_en) : null,
      region: null,
      valueUsdThousand: Number(row.value_usd_thousand) || 0,
      valueUsd: (Number(row.value_usd_thousand) || 0) * 1000,
      sourceFileId,
      importBatchId,
      sourcePageNumber: row.source_page != null ? Number(row.source_page) : null,
      sourceTableLabel: row.source_table || null,
      rawRowText: row.country_raw_en ? `${row.country_raw_en} / ${row.commodity_group_raw_en || ''}` : '',
      rowType: row.row_type || 'detail',
      validationStatus: row.validation_status || null,
      observationDataset: dataset,
      extractionConfidence: 1,
      reviewStatus: 'draft',
      isPublished: false,
    };
  },

  // ─── Trade balance → publishedTotals ─────────────────────────────────────

  buildPublishedTotals(wb, sourceFileId, importBatchId, stamp) {
    const rows = this.sheetToRows(wb, 'trade_balance_summary')
      .filter(r => r.include_in_observations === true);
    const totals = [];
    rows.forEach(row => {
      const year = Number(row.year);
      const periodType = row.period_type || 'annual';
      let month = null;
      if (periodType === 'monthly') {
        month = this.AR_MONTH_MAP[String(row.period_label || '').trim()] || null;
      }
      const suffix = month ? `${periodType}_${month}` : periodType;
      totals.push({
        id: this.makeId('total', stamp, 'export', year, suffix),
        year, flow: 'export', periodType, month,
        valueUsd: (Number(row.exports_value_usd_thousand) || 0) * 1000,
        valueUsdThousand: Number(row.exports_value_usd_thousand) || 0,
        sourceFileId, importBatchId,
      });
      totals.push({
        id: this.makeId('total', stamp, 'import', year, suffix),
        year, flow: 'import', periodType, month,
        valueUsd: (Number(row.imports_value_usd_thousand) || 0) * 1000,
        valueUsdThousand: Number(row.imports_value_usd_thousand) || 0,
        sourceFileId, importBatchId,
      });
    });
    return totals;
  },

  // ─── Main import entry point ──────────────────────────────────────────────

  importWorkbook(arrayBuffer, fileName) {
    let wb;
    try {
      wb = XLSX.read(new Uint8Array(arrayBuffer), { type: 'array' });
    } catch (err) {
      return { ok: false, errors: [`تعذر قراءة ملف Excel: ${err.message}`] };
    }

    const validation = this.validate(wb);
    if (!validation.ok) return { ok: false, errors: validation.errors };

    const meta = this.readMetadata(wb);
    const coveredYear = meta.covered_year || meta.publication_year || 'unknown';
    const stamp = Date.now();
    const sourceFileId = this.makeId('source', 'xlsx', coveredYear, stamp);
    const importBatchId = this.makeId('batch', 'xlsx', coveredYear, stamp);

    const reviewRows = this.sheetToRows(wb, 'review_required');

    const sourceFile = {
      id: sourceFileId,
      originalFilename: fileName,
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      sourceOrg: meta.institution || 'CBOS',
      publicationTitle: meta.source_title || 'Foreign Trade Statistical Digest',
      publicationYear: String(coveredYear),
      coveredYear: Number(coveredYear) || null,
      issue: meta.issue || null,
      volume: meta.volume || null,
      language: meta.language || null,
      currencyUnit: meta.currency_unit || null,
      extractionMethod: meta.extraction_method || null,
      reviewStatus: meta.review_status || null,
      origin: 'xlsx-import-v1',
      importedAt: new Date().toISOString(),
    };

    const importBatch = {
      id: importBatchId,
      sourceFileId,
      targetYear: String(coveredYear),
      status: 'draft',
      parserVersion: 'xlsx-import-v1',
      importedAt: new Date().toISOString(),
      reviewRequiredCount: reviewRows.length,
      notes: `رفع Excel — ${fileName} — review_required: ${reviewRows.length} صف`,
    };

    // Build published totals from trade_balance_summary
    const publishedTotals = this.buildPublishedTotals(wb, sourceFileId, importBatchId, stamp);

    // Build draft observations
    const SHEET_MAP = [
      { sheet: 'annual_exports_summary',    dataset: 'annual-commodity',   fn: 'commodityRowToObs' },
      { sheet: 'annual_imports_summary',    dataset: 'annual-commodity',   fn: 'commodityRowToObs' },
      { sheet: 'monthly_exports',           dataset: 'monthly-commodity',  fn: 'commodityRowToObs' },
      { sheet: 'monthly_imports',           dataset: 'monthly-commodity',  fn: 'commodityRowToObs' },
      { sheet: 'quarterly_exports',         dataset: 'quarterly-commodity',fn: 'commodityRowToObs' },
      { sheet: 'quarterly_imports',         dataset: 'quarterly-commodity',fn: 'commodityRowToObs' },
      { sheet: 'exports_by_country_monthly',dataset: 'monthly-country',    fn: 'countryMonthlyRowToObs' },
      { sheet: 'imports_by_country_monthly',dataset: 'monthly-country',    fn: 'countryMonthlyRowToObs' },
      { sheet: 'exports_country_commodity', dataset: 'country-commodity-annual', fn: 'countryCommodityRowToObs' },
      { sheet: 'imports_country_commodity', dataset: 'country-commodity-annual', fn: 'countryCommodityRowToObs' },
    ];

    const draftObservations = [];
    const bySheet = {};
    let counter = 0;

    SHEET_MAP.forEach(({ sheet, dataset, fn }) => {
      const rows = this.sheetToRows(wb, sheet).filter(r => r.include_in_observations === true);
      bySheet[sheet] = rows.length;
      rows.forEach(row => {
        const obs = this[fn](row, sourceFileId, importBatchId, dataset);
        obs.id = this.makeId('draftobs', importBatchId, ++counter);
        obs.importBatchId = importBatchId;
        draftObservations.push(obs);
      });
    });

    const importSummary = {
      fileName,
      coveredYear: String(coveredYear),
      sourceOrg: sourceFile.sourceOrg,
      issue: sourceFile.issue,
      totalObservations: draftObservations.length,
      publishedTotalsCount: publishedTotals.length,
      reviewRequiredCount: reviewRows.length,
      bySheet,
    };

    return {
      ok: true,
      sourceFile,
      importBatch,
      draftObservations,
      publishedTotals,
      reviewRequired: reviewRows,
      importSummary,
      metadata: meta,
    };
  },
};
