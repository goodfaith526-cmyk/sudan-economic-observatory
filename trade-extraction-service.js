window.SEO_SERVICES = window.SEO_SERVICES || {};

window.SEO_SERVICES.tradeExtraction = {
  ruleId: "cbos-2013-exports-summary-v1",
  exportRuleId: "cbos-2013-exports-summary-v1",
  importRuleId: "cbos-2013-imports-summary-v1",
  monthlyExportRuleId: "cbos-2013-monthly-exports-v1",
  monthlyImportRuleId: "cbos-2013-monthly-imports-v1",
  exportRuleId2014: "cbos-2014-exports-summary-v1",
  importRuleId2014: "cbos-2014-imports-summary-v1",
  monthlyExportRuleId2014: "cbos-2014-monthly-exports-v1",
  monthlyImportRuleId2014: "cbos-2014-monthly-imports-v1",
  extractionVersion: "cbos-2013-q4-v1",
  extractionVersion2014: "cbos-2014-q4-v1",
  expectedTotalValueUsdThousand: 7086219,
  expectedImportTotalValueUsdThousand: 9918068,
  expected2014ExportTotalValueUsdThousand: 4350210,
  expected2014ImportTotalValueUsdThousand: 9211300,
  tableLabel: "Summary Of Exports During (Jan. - Dec.) 2013",
  importsTableLabel: "Summary Of Imports By Commodity During (Jan. - Dec.) 2013",
  tableLabel2014Exports: "Summary Of Exports During (Jan. - Dec.) 2014",
  tableLabel2014Imports: "Summary Of Imports By Commodity During (Jan. - Dec.) 2014",
  monthlyExportsTableLabel: "Exports by commodities monthly 2013",
  monthlyImportsTableLabel: "Imports by commodities monthly 2013",
  monthlyExportsTableLabel2014: "Exports by commodities monthly 2014",
  monthlyImportsTableLabel2014: "Imports by commodities monthly 2014",
  monthlyExportMonths: [
    { monthNumber: 1, monthLabel: "January", aliases: ["January", "Jan", "يناير"] },
    { monthNumber: 2, monthLabel: "February", aliases: ["February", "Feb", "فبراير"] },
    { monthNumber: 3, monthLabel: "March", aliases: ["March", "Mar", "مارس"] },
    { monthNumber: 4, monthLabel: "April", aliases: ["April", "Apr", "ابريل", "أبريل"] },
    { monthNumber: 5, monthLabel: "May", aliases: ["May", "مايو"] },
    { monthNumber: 6, monthLabel: "June", aliases: ["June", "Jun", "يونيو"] },
    { monthNumber: 7, monthLabel: "July", aliases: ["July", "Jul", "يوليو"] },
    { monthNumber: 8, monthLabel: "August", aliases: ["August", "Aug", "اغسطس", "أغسطس"] },
    { monthNumber: 9, monthLabel: "September", aliases: ["September", "Sep", "سبتمبر"] },
    { monthNumber: 10, monthLabel: "October", aliases: ["October", "Oct", "اكتوبر", "أكتوبر"] },
    { monthNumber: 11, monthLabel: "November", aliases: ["November", "Nov", "نوفمبر"] },
    { monthNumber: 12, monthLabel: "December", aliases: ["December", "Dec", "ديسمبر"] },
  ],
  commodities: [
    "Crude Oil",
    "Benzine",
    "Kerosene",
    "Light Gas",
    "F/O& HCGO",
    "Furnace",
    "Mixed butagas",
    "Diesel",
    "Others Petroleium Produts",
    "Cotton",
    "Gum Arabic",
    "Sesame",
    "Sugar",
    "Ethanol",
    "Groundnuts",
    "Cake and Meal",
    "Dura (Sorghum)",
    "Livestock",
    "Meat",
    "Hides & Skins",
    "Gold",
    "Others",
  ],
  monthlyExportCommodities: [
    { name: "Crude Oil", reconcileCommodityId: "crude_oil" },
    { name: "Benzine", reconcileCommodityId: "benzine" },
    { name: "Kerosene", reconcileCommodityId: "kerosene" },
    { name: "Light Gas", reconcileCommodityId: "light_gas" },
    { name: "F/O& HCGO", reconcileCommodityId: "fo_hcgo" },
    { name: "Furnace", reconcileCommodityId: "furnace" },
    { name: "Mixed butagas", reconcileCommodityId: "mixed_butagas" },
    { name: "Diesel", reconcileCommodityId: "diesel" },
    { name: "Others Petroleium Produts", aliases: ["Other Petroleum Products", "Others Petroleum Products", "Others Petroleium Produts"], reconcileCommodityId: "other_petroleum_products" },
    { name: "Extra-Long Staple Cotton", aliases: ["Extra-Long Staple Cotton", "Extra Long Staple Cotton"], reconcileCommodityId: "cotton" },
    { name: "Long Staple Cotton", reconcileCommodityId: "cotton" },
    { name: "Short& Medium Staple Cotton", aliases: ["Short& Medium Staple Cotton", "Short & Medium Staple Cotton", "Short Medium Staple Cotton"], reconcileCommodityId: "cotton" },
    { name: "Cotton", reconcileCommodityId: "cotton" },
    { name: "Gum Hashab", aliases: ["Gum Hashab", "Hashab Gum"], reconcileCommodityId: "gum_arabic" },
    { name: "Gum Taleh", aliases: ["Gum Taleh", "Gum Talha", "Taleh Gum", "Talha Gum"], reconcileCommodityId: "gum_arabic" },
    { name: "Gum Powder", reconcileCommodityId: "gum_arabic" },
    { name: "Sesame", reconcileCommodityId: "sesame" },
    { name: "Sugar", reconcileCommodityId: "sugar" },
    { name: "Ethanol", reconcileCommodityId: "ethanol" },
    { name: "Groundnuts", aliases: ["Groundnuts", "Ground nuts"], reconcileCommodityId: "groundnuts" },
    { name: "Hibiscus Flower", aliases: ["Hibiscus Flower", "Hibiscus"], reconcileCommodityId: "others" },
    { name: "Melon Seeds", aliases: ["Melon Seeds", "Melon Seed"], reconcileCommodityId: "others" },
    { name: "Senna Pods", aliases: ["Senna Pods", "Senna"], reconcileCommodityId: "others" },
    { name: "Henna", reconcileCommodityId: "others" },
    { name: "Cake and Meal", aliases: ["Cake and Meal", "Cake & Meal"], reconcileCommodityId: "cake_and_meal" },
    { name: "Cotton Seed Cake & Meal", aliases: ["Cotton Seed Cake & Meal", "Cotton Seed Cake and Meal"], reconcileCommodityId: "cake_and_meal" },
    { name: "Groundnut Cake& Meal", aliases: ["Groundnut Cake& Meal", "Groundnut Cake & Meal", "Groundnut Cake and Meal"], reconcileCommodityId: "cake_and_meal" },
    { name: "Other Cake & Meal", aliases: ["Other Cake & Meal", "Other Cake and Meal"], reconcileCommodityId: "cake_and_meal" },
    { name: "Dura (Sorghum)", aliases: ["Dura (Sorghum)", "Dura", "Sorghum"], reconcileCommodityId: "dura_sorghum" },
    { name: "Cumin Seeds", reconcileCommodityId: "others" },
    { name: "Sunflower Seeds", reconcileCommodityId: "others" },
    { name: "Crude Groundnuts Oil", aliases: ["Crude Groundnuts Oil", "Crude Groundnut Oil"], reconcileCommodityId: "others" },
    { name: "Sesame Oil", reconcileCommodityId: "others" },
    { name: "Raw Cane", reconcileCommodityId: "others" },
    { name: "Trefoil", reconcileCommodityId: "others" },
    { name: "Molasses", reconcileCommodityId: "others" },
    { name: "Wheat Bran", reconcileCommodityId: "others" },
    { name: "Livestock", reconcileCommodityId: "livestock" },
    { name: "Sheep", reconcileCommodityId: "livestock" },
    { name: "Goats", reconcileCommodityId: "livestock" },
    { name: "Cattle", reconcileCommodityId: "livestock" },
    { name: "Camels", reconcileCommodityId: "livestock" },
    { name: "Gazelle", reconcileCommodityId: "livestock" },
    { name: "Crossbred Camels", reconcileCommodityId: "livestock" },
    { name: "Other Livestock", reconcileCommodityId: "livestock" },
    { name: "Meat", reconcileCommodityId: "meat" },
    { name: "Fish ( Fresh or Chilled)", aliases: ["Fish ( Fresh or Chilled)", "Fish Fresh or Chilled", "Fish"], reconcileCommodityId: "others" },
    { name: "Vegetables", reconcileCommodityId: "others" },
    { name: "Fruits", reconcileCommodityId: "others" },
    { name: "Hides & Skins", aliases: ["Hides & Skins", "Hides and Skins"], reconcileCommodityId: "hides_skins" },
    { name: "Gold", reconcileCommodityId: "gold" },
    { name: "Other metal", aliases: ["Other metal", "Other Metal"], reconcileCommodityId: "others" },
    { name: "Copper Waste & Scrap", aliases: ["Copper Waste & Scrap", "Copper Waste and Scrap"], reconcileCommodityId: "others" },
    { name: "Lead Waste & Scrap", aliases: ["Lead Waste & Scrap", "Lead Waste and Scrap"], reconcileCommodityId: "others" },
    { name: "Iron Waste & Scrap", aliases: ["Iron Waste & Scrap", "Iron Waste and Scrap"], reconcileCommodityId: "others" },
    { name: "Aluminium waste & scrap", aliases: ["Aluminium waste & scrap", "Aluminium Waste & Scrap", "Aluminium waste and scrap"], reconcileCommodityId: "others" },
    { name: "Chromium", reconcileCommodityId: "others" },
    { name: "Charcoal", reconcileCommodityId: "others" },
    { name: "Cement", reconcileCommodityId: "others" },
    { name: "Soft Drink", aliases: ["Soft Drink", "Soft Drinks"], reconcileCommodityId: "others" },
    { name: "Lubban", reconcileCommodityId: "others" },
    { name: "Others", aliases: ["Others"], reconcileCommodityId: "others" },
  ],
  monthlyExpectedRowTotals: {
    crude_oil: 3910565,
    benzine: 100588,
    kerosene: 836,
    light_gas: 445,
    fo_hcgo: 101,
    furnace: 710,
    mixed_butagas: 1879,
    diesel: 508,
    other_petroleum_products: 255,
    cotton: 102736,
    gum_hashab: 92531,
    gum_taleh: 42242,
    "Gum Powder": 0,
    sesame: 472363,
    ethanol: 77722,
    groundnuts: 42837,
    cake_and_meal: 35721,
    "Other Cake & Meal": 12809,
    dura_sorghum: 77916,
    "Cumin Seeds": 0,
    "Sunflower Seeds": 0,
    "Crude Groundnuts Oil": 14140,
    "Sesame Oil": 255,
    livestock: 593959,
    "Other Livestock": 724,
    meat: 15500,
    hides_skins: 72602,
    gold: 1048427,
    others: 398631,
  },
  monthlyExpectedChecklist: [
    "Crude Oil", "Benzine", "Mixed butagas", "Short& Medium Staple Cotton", "Gum Hashab", "Gum Taleh", "Sesame", "Groundnuts",
    "Hibiscus Flower", "Melon Seeds", "Senna Pods", "Henna", "Dura (Sorghum)", "Cumin Seeds", "Sunflower Seeds", "Crude Groundnuts Oil", "Sesame Oil", "Ethanol", "Raw Cane", "Trefoil", "Molasses",
    "Wheat Bran", "Other Cake & Meal", "Sheep", "Goats", "Cattle", "Camels", "Other Livestock", "Meat", "Fish ( Fresh or Chilled)",
    "Vegetables", "Fruits", "Gold", "Other metal", "Copper Waste & Scrap", "Lead Waste & Scrap", "Iron Waste & Scrap",
    "Aluminium waste & scrap", "Chromium", "Charcoal", "Cement", "Soft Drink", "Hides & Skins", "Lubban", "Others",
  ],
  importCommodities: [
    "Wheat & Wheat Flour",
    "Sugar",
    "Dairy Products",
    "Vegetables & Veget. Products",
    "Other Foodsutfs",
    "Animal & Vegetable Oils",
    "Beverages & Tobacco",
    "Petroleum Products",
    "Other Raw Materials",
    "Medicines",
    "Other Chemical Products",
    "Manufactured Goods",
    "Machinery and Equipments",
    "Transport Equipments",
    "Textiles",
    "Others",
  ],
  exportCommodities2014: [
    "Crude Oil",
    "Benzine",
    "Kerosene",
    "Light Gas",
    "F/O& HCGO",
    "Furnace",
    "Mixed butagas",
    "Diesel",
    { name: "Others Petroleium Produts", aliases: ["Others Petroleium Produts", "Others Petroleum Produts"] },
    "Cotton",
    "Gum Arabic",
    "Sesame",
    "Sugar",
    "Ethanol",
    "Groundnuts",
    "Cake and Meal",
    "Dura (Sorghum)",
    "Livestock",
    "Meat",
    "Hides & Skins",
    "Gold",
    "Others",
  ],

  extract2013ExportSummary(batch, sourceFile) {
    const pages = batch?.debugPreviewPages || [];
    const pageMatch = this.findExportSummaryPage(pages);
    if (!pageMatch) throw new Error("Exports summary anchor not found in parsed PDF pages");

    const rows = pageMatch.rows.map((row, index) => this.toDraftObservation(row, pageMatch.page.pageNumber, batch, sourceFile, index));

    const totalValue = this.parseExpectedTotal(this.normalizeText(pageMatch.page.text || ""));
    const sumValue = rows.reduce((sum, row) => sum + (Number(row.valueUsdThousand) || 0), 0);
    const expected = totalValue || this.expectedTotalValueUsdThousand;
    const difference = sumValue - expected;
    const absDiff = Math.abs(difference);
    const status = absDiff <= 1 ? "pass" : absDiff <= 100 ? "warning" : "fail";

    return {
      observations: rows,
      validation: {
        id: "validation_2013_exports_summary_" + Date.now(),
        importBatchId: batch.id,
        sourceFileId: sourceFile?.id || batch.sourceFileId,
        extractionRuleId: this.ruleId,
        extractionVersion: this.extractionVersion,
        tableType: "exports_summary",
        flow: "export",
        year: 2013,
        periodType: "annual",
        publicationIssue: {
          source: "CBOS Foreign Trade Statistical Digest",
          issueYear: 2013,
          issuePeriod: "Q4",
          issueLabel: "Q4 2013",
        },
        coveredEconomicPeriod: {
          year: 2013,
          periodType: "annual",
          startMonth: 1,
          endMonth: 12,
          label: "Annual 2013 Jan-Dec",
        },
        expectedTotalValueUsdThousand: expected,
        extractedTotalValueUsdThousand: sumValue,
        differenceValueUsdThousand: difference,
        status,
        checkedAt: new Date().toISOString(),
        notes: "Compares sum of extracted commodity rows against the CBOS Total row for the 2013 exports summary.",
        debug: {
          searchedPages: pages.length,
          detectedPageNumber: pageMatch.page.pageNumber,
          anchorMatched: pageMatch.anchorMatched,
        },
      },
      debug: {
        searchedPages: pages.length,
        detectedPageNumber: pageMatch.page.pageNumber,
        anchorMatched: pageMatch.anchorMatched,
      },
    };
  },

  extract2013ImportSummary(batch, sourceFile) {
    const pages = batch?.debugPreviewPages || [];
    const pageMatch = this.findImportSummaryPage(pages);
    if (!pageMatch) throw new Error("Imports summary anchor not found in parsed PDF pages");

    const rows = pageMatch.rows.map((row, index) => this.toDraftObservation(row, pageMatch.page.pageNumber, batch, sourceFile, index, {
      flow: "import",
      ruleId: this.importRuleId,
      tableLabel: this.importsTableLabel,
      idPrefix: "draftobs_2013_import_summary_",
    }));

    const totalValue = this.parseExpectedTotal(this.normalizeText(pageMatch.page.text || ""));
    const sumValue = rows.reduce((sum, row) => sum + (Number(row.valueUsdThousand) || 0), 0);
    const expected = totalValue || this.expectedImportTotalValueUsdThousand;
    const difference = sumValue - expected;
    const absDiff = Math.abs(difference);
    const rowStatus = rows.length === this.importCommodities.length ? "pass" : "warning";
    const totalStatus = absDiff <= 1 ? "pass" : absDiff <= 100 ? "warning" : "fail";
    const status = totalStatus === "pass" && rowStatus === "pass" ? "pass" : totalStatus === "fail" ? "fail" : "warning";

    return {
      observations: rows,
      validation: {
        id: "validation_2013_imports_summary_" + Date.now(),
        importBatchId: batch.id,
        sourceFileId: sourceFile?.id || batch.sourceFileId,
        extractionRuleId: this.importRuleId,
        extractionVersion: this.extractionVersion,
        tableType: "imports_summary",
        flow: "import",
        year: 2013,
        periodType: "annual",
        publicationIssue: {
          source: "CBOS Foreign Trade Statistical Digest",
          issueYear: 2013,
          issuePeriod: "Q4",
          issueLabel: "Q4 2013",
        },
        coveredEconomicPeriod: {
          year: 2013,
          periodType: "annual",
          startMonth: 1,
          endMonth: 12,
          label: "Annual 2013 Jan-Dec",
        },
        expectedRowsCount: this.importCommodities.length,
        extractedRowsCount: rows.length,
        expectedTotalValueUsdThousand: expected,
        reportedTotalValueUsdThousand: totalValue,
        extractedTotalValueUsdThousand: sumValue,
        differenceValueUsdThousand: difference,
        status,
        checkedAt: new Date().toISOString(),
        notes: "Compares sum of extracted imports summary rows against the CBOS Total row for the 2013 imports summary.",
        debug: {
          searchedPages: pages.length,
          detectedPageNumber: pageMatch.page.pageNumber,
          anchorMatched: pageMatch.anchorMatched,
        },
      },
      debug: {
        searchedPages: pages.length,
        detectedPageNumber: pageMatch.page.pageNumber,
        anchorMatched: pageMatch.anchorMatched,
      },
    };
  },

  extract2014ExportSummary(batch, sourceFile) {
    return this.extractAnnualSummary(batch, sourceFile, {
      year: 2014,
      flow: "export",
      ruleId: this.exportRuleId2014,
      extractionVersion: this.extractionVersion2014,
      tableType: "exports_summary",
      tableLabel: this.tableLabel2014Exports,
      idPrefix: "draftobs_2014_export_summary_",
      commodities: this.exportCommodities2014,
      expectedRowsCount: this.exportCommodities2014.length,
      expectedTotalValueUsdThousand: this.expected2014ExportTotalValueUsdThousand,
      validationIdPrefix: "validation_2014_exports_summary_",
      findPage: (pages) => this.findExportSummaryPage(pages, { commodities: this.exportCommodities2014 }),
      notes: "B4 pilot draft-only extraction. Compares sum of extracted commodity rows against the CBOS Total row for the 2014 exports summary.",
    });
  },

  extract2014ImportSummary(batch, sourceFile) {
    return this.extractAnnualSummary(batch, sourceFile, {
      year: 2014,
      flow: "import",
      ruleId: this.importRuleId2014,
      extractionVersion: this.extractionVersion2014,
      tableType: "imports_summary",
      tableLabel: this.tableLabel2014Imports,
      idPrefix: "draftobs_2014_import_summary_",
      commodities: this.importCommodities,
      expectedRowsCount: this.importCommodities.length,
      expectedTotalValueUsdThousand: this.expected2014ImportTotalValueUsdThousand,
      validationIdPrefix: "validation_2014_imports_summary_",
      findPage: (pages) => this.findImportSummaryPage(pages, { expectedTotalValueUsdThousand: this.expected2014ImportTotalValueUsdThousand }),
      notes: "B4 pilot draft-only extraction. Compares sum of extracted imports summary rows against the CBOS Total row for the 2014 imports summary.",
    });
  },

  extractAnnualSummary(batch, sourceFile, config) {
    const pages = batch?.debugPreviewPages || [];
    const pageMatch = config.findPage(pages);
    if (!pageMatch) throw new Error(`${config.year} ${config.flow} annual summary anchor not found in parsed PDF pages`);
    const publicationIssue = {
      source: "CBOS Foreign Trade Statistical Digest",
      issueYear: config.year,
      issuePeriod: "Q4",
      issueLabel: `Q4 ${config.year}`,
    };
    const coveredEconomicPeriod = {
      year: config.year,
      periodType: "annual",
      startMonth: 1,
      endMonth: 12,
      label: `Annual ${config.year} Jan-Dec`,
    };
    const rows = pageMatch.rows.map((row, index) => this.toDraftObservation(row, pageMatch.page.pageNumber, batch, sourceFile, index, {
      flow: config.flow,
      ruleId: config.ruleId,
      extractionVersion: config.extractionVersion,
      tableLabel: config.tableLabel,
      idPrefix: config.idPrefix,
      year: config.year,
      periodType: "annual",
      publicationIssue,
      coveredEconomicPeriod,
    }));
    const totalValue = this.parseExpectedTotal(this.normalizeText(pageMatch.page.text || ""));
    const expected = totalValue || config.expectedTotalValueUsdThousand;
    const sumValue = rows.reduce((sum, row) => sum + (Number(row.valueUsdThousand) || 0), 0);
    const difference = sumValue - expected;
    const absDiff = Math.abs(difference);
    const rowStatus = rows.length === config.expectedRowsCount ? "pass" : "warning";
    const totalStatus = absDiff <= 1 ? "pass" : absDiff <= 100 ? "warning" : "fail";
    const status = totalStatus === "pass" && rowStatus === "pass" ? "pass" : totalStatus === "fail" ? "fail" : "warning";
    const unmappedCommodities = [...new Set(rows.filter((row) => row.commodityNormalizationStatus === "unmapped").map((row) => row.rawCommodityName || row.commodityName))];
    return {
      observations: rows,
      validation: {
        id: config.validationIdPrefix + Date.now(),
        importBatchId: batch.id,
        sourceFileId: sourceFile?.id || batch.sourceFileId,
        extractionRuleId: config.ruleId,
        extractionVersion: config.extractionVersion,
        tableType: config.tableType,
        flow: config.flow,
        year: config.year,
        periodType: "annual",
        publicationIssue,
        coveredEconomicPeriod,
        expectedRowsCount: config.expectedRowsCount,
        extractedRowsCount: rows.length,
        expectedTotalValueUsdThousand: expected,
        reportedTotalValueUsdThousand: totalValue,
        extractedTotalValueUsdThousand: sumValue,
        differenceValueUsdThousand: difference,
        unmappedCommodities,
        unmappedCommodityRows: unmappedCommodities.length,
        status,
        checkedAt: new Date().toISOString(),
        notes: config.notes,
        sourceClassification: {
          sourceFileName: sourceFile?.fileName || sourceFile?.name || null,
          structuralFamily: "cbos-legacy-q4-word-distiller",
          comparedTo: "cbos-2013-q4-v1",
          result: "same annual summary table family; B4 pilot draft-only",
        },
        debug: {
          searchedPages: pages.length,
          detectedPageNumber: pageMatch.page.pageNumber,
          anchorMatched: pageMatch.anchorMatched,
          rowStatus,
          totalStatus,
        },
      },
      debug: {
        searchedPages: pages.length,
        detectedPageNumber: pageMatch.page.pageNumber,
        anchorMatched: pageMatch.anchorMatched,
        sourceClassification: "cbos-legacy-q4-word-distiller",
      },
    };
  },

  extract2013MonthlyExports(batch, sourceFile) {
    const pages = batch?.debugPreviewPages || [];
    const pageMatch = this.findMonthlyExportsPage(pages);
    if (!pageMatch) throw new Error("Monthly exports commodity table anchor not found in parsed PDF pages");

    const rows = pageMatch.rows.flatMap((row, rowIndex) =>
      row.months.map((monthRow, monthIndex) => this.toDraftObservation({
        ...row,
        quantity: monthRow.quantity,
        valueUsdThousand: monthRow.valueUsdThousand,
        rawRowText: `${row.rawRowText} | ${monthRow.monthLabel}`,
      }, pageMatch.page.pageNumber, batch, sourceFile, rowIndex * this.monthlyExportMonths.length + monthIndex, {
        flow: "export",
        ruleId: this.monthlyExportRuleId,
        tableLabel: this.monthlyExportsTableLabel,
        idPrefix: "draftobs_2013_monthly_export_",
        periodType: "monthly",
        month: monthRow.monthNumber,
        monthNumber: monthRow.monthNumber,
        monthLabel: monthRow.monthLabel,
        quarter: null,
        coveredEconomicPeriod: {
          year: 2013,
          periodType: "monthly",
          month: monthRow.monthNumber,
          startMonth: monthRow.monthNumber,
          endMonth: monthRow.monthNumber,
          label: `${monthRow.monthLabel} 2013`,
        },
      }))
    );

    const totalsByMonth = this.monthlyExportMonths.map((month) => ({
      monthNumber: month.monthNumber,
      monthLabel: month.monthLabel,
      extractedTotalValueUsdThousand: rows
        .filter((row) => Number(row.month) === month.monthNumber)
        .reduce((sum, row) => sum + (Number(row.valueUsdThousand) || 0), 0),
      rowsCount: rows.filter((row) => Number(row.month) === month.monthNumber).length,
    }));
    const duplicateKeys = this.findMonthlyDuplicateKeys(rows);
    const coveredMonths = [...new Set(rows.map((row) => Number(row.month)).filter(Boolean))].sort((a, b) => a - b);
    const expectedMonths = this.monthlyExportMonths.map((month) => month.monthNumber);
    const missingMonths = expectedMonths.filter((month) => !coveredMonths.includes(month));
    const status = rows.length && !duplicateKeys.length && !missingMonths.length ? "pass" : rows.length && !duplicateKeys.length ? "warning" : "fail";
    const tableTotalValidation = this.validateMonthlyTableTotals(rows, pageMatch.totalRow);
    const rowTotalMismatches = pageMatch.rows.filter((row) => row.rowTotalMismatch).map((row) => ({
      commodityName: row.commodityName,
      monthlySumValueUsdThousand: row.monthlySumValueUsdThousand,
      rowTotalValueUsdThousand: row.rowTotalValueUsdThousand,
      differenceValueUsdThousand: row.rowTotalDifferenceValueUsdThousand,
      rawRowText: row.rawRowText,
      monthlyValues: row.months.map((month) => month.valueUsdThousand),
    }));
    const rowReconciliationDiagnostics = this.buildMonthlyRowReconciliationDiagnostics(pageMatch.rows, rows, pageMatch.rowDiagnostics || []);
    const finalStatus = rowTotalMismatches.length || tableTotalValidation.status === "fail" ? "fail" : status;

    return {
      observations: rows,
      validation: {
        id: "validation_2013_monthly_exports_" + Date.now(),
        importBatchId: batch.id,
        sourceFileId: sourceFile?.id || batch.sourceFileId,
        extractionRuleId: this.monthlyExportRuleId,
        extractionVersion: this.extractionVersion,
        tableType: "exports_by_commodity_monthly",
        flow: "export",
        year: 2013,
        periodType: "monthly",
        publicationIssue: {
          source: "CBOS Foreign Trade Statistical Digest",
          issueYear: 2013,
          issuePeriod: "Q4",
          issueLabel: "Q4 2013",
        },
        coveredEconomicPeriod: {
          year: 2013,
          periodType: "monthly",
          startMonth: 1,
          endMonth: 12,
          label: "Monthly 2013 Jan-Dec",
        },
        expectedMonths,
        coveredMonths,
        missingMonths,
        duplicateObservationKeys: duplicateKeys,
        extractedRowsCount: rows.length,
        extractedCommodityRowsCount: pageMatch.rows.length,
        extractedMonthlyTotals: totalsByMonth,
        tableTotalRow: pageMatch.totalRow || null,
        rowDiagnostics: pageMatch.rowDiagnostics || [],
        expectedCommodityChecklist: this.buildMonthlyExpectedChecklist(pageMatch.rows, pageMatch.rowDiagnostics || []),
        rowTotalMismatches,
        rowReconciliationDiagnostics,
        tableTotalValidation,
        reportedTotalsAvailable: false,
        status: finalStatus,
        checkedAt: new Date().toISOString(),
        notes: "Draft-only monthly exports extraction. No reported monthly totals are validated yet; validation requires Jan-Dec month coverage and checks duplicate commodity-month keys.",
        debug: {
          searchedPages: pages.length,
          detectedPageNumber: pageMatch.page.pageNumber,
          anchorMatched: pageMatch.anchorMatched,
          parsedTableShape: pageMatch.shape,
          parserCorrection: "step15-row-total-token-capture",
          tableSignature: pageMatch.signature,
          candidateRejections: this.monthlyCandidateRejections(pages),
          mismatchRawRows: rowTotalMismatches,
          skippedCandidateRows: (pageMatch.rowDiagnostics || []).filter((item) => String(item.status || "").startsWith("skipped")).slice(0, 30),
        },
      },
      debug: {
        searchedPages: pages.length,
        detectedPageNumber: pageMatch.page.pageNumber,
        anchorMatched: pageMatch.anchorMatched,
        parsedTableShape: pageMatch.shape,
        parserCorrection: "step15-row-total-token-capture",
        tableSignature: pageMatch.signature,
        candidateRejections: this.monthlyCandidateRejections(pages),
      },
    };
  },

  extract2013MonthlyImports(batch, sourceFile) {
    const pages = batch?.debugPreviewPages || [];
    const pageMatch = this.findMonthlyImportsPage(pages);
    if (!pageMatch) throw new Error("Monthly imports commodity table signature not found in parsed PDF pages");

    const rows = pageMatch.rows.flatMap((row, rowIndex) =>
      row.months.map((monthRow, monthIndex) => this.toDraftObservation({
        ...row,
        quantity: monthRow.quantity,
        valueUsdThousand: monthRow.valueUsdThousand,
        rawRowText: `${row.rawRowText} | ${monthRow.monthLabel}`,
      }, pageMatch.page.pageNumber, batch, sourceFile, rowIndex * this.monthlyExportMonths.length + monthIndex, {
        flow: "import",
        ruleId: this.monthlyImportRuleId,
        tableLabel: this.monthlyImportsTableLabel,
        idPrefix: "draftobs_2013_monthly_import_",
        periodType: "monthly",
        month: monthRow.monthNumber,
        monthNumber: monthRow.monthNumber,
        monthLabel: monthRow.monthLabel,
        quarter: null,
        coveredEconomicPeriod: {
          year: 2013,
          periodType: "monthly",
          month: monthRow.monthNumber,
          startMonth: monthRow.monthNumber,
          endMonth: monthRow.monthNumber,
          label: `${monthRow.monthLabel} 2013`,
        },
      }))
    );

    const totalsByMonth = this.monthlyExportMonths.map((month) => ({
      monthNumber: month.monthNumber,
      monthLabel: month.monthLabel,
      extractedTotalValueUsdThousand: rows
        .filter((row) => Number(row.month) === month.monthNumber)
        .reduce((sum, row) => sum + (Number(row.valueUsdThousand) || 0), 0),
      rowsCount: rows.filter((row) => Number(row.month) === month.monthNumber).length,
    }));
    const duplicateKeys = this.findMonthlyDuplicateKeys(rows);
    const coveredMonths = [...new Set(rows.map((row) => Number(row.month)).filter(Boolean))].sort((a, b) => a - b);
    const expectedMonths = this.monthlyExportMonths.map((month) => month.monthNumber);
    const missingMonths = expectedMonths.filter((month) => !coveredMonths.includes(month));
    const tableTotalValidation = this.validateMonthlyTableTotals(rows, pageMatch.totalRow);
    const rowTotalMismatches = pageMatch.rows.filter((row) => row.rowTotalMismatch).map((row) => ({
      commodityName: row.commodityName,
      categoryName: row.categoryName,
      monthlySumValueUsdThousand: row.monthlySumValueUsdThousand,
      rowTotalValueUsdThousand: row.rowTotalValueUsdThousand,
      differenceValueUsdThousand: row.rowTotalDifferenceValueUsdThousand,
    }));
    const generatedTotal = rows.reduce((sum, row) => sum + (Number(row.valueUsdThousand) || 0), 0);
    const annualDifference = generatedTotal - this.expectedImportTotalValueUsdThousand;
    const diagnostics = this.monthlyDraftDiagnosticsForRows(rows);
    const status = rowTotalMismatches.length || duplicateKeys.length || missingMonths.length || tableTotalValidation.status === "fail" || Math.abs(annualDifference) > 1
      ? "fail"
      : diagnostics.unmappedCommodityRows
        ? "warning"
        : "pass";

    return {
      observations: rows,
      validation: {
        id: "validation_2013_monthly_imports_" + Date.now(),
        importBatchId: batch.id,
        sourceFileId: sourceFile?.id || batch.sourceFileId,
        extractionRuleId: this.monthlyImportRuleId,
        extractionVersion: this.extractionVersion,
        tableType: "imports_by_commodity_monthly",
        flow: "import",
        year: 2013,
        periodType: "monthly",
        publicationIssue: {
          source: "CBOS Foreign Trade Statistical Digest",
          issueYear: 2013,
          issuePeriod: "Q4",
          issueLabel: "Q4 2013",
        },
        coveredEconomicPeriod: {
          year: 2013,
          periodType: "monthly",
          startMonth: 1,
          endMonth: 12,
          label: "Monthly 2013 Jan-Dec",
        },
        expectedMonths,
        coveredMonths,
        missingMonths,
        duplicateObservationKeys: duplicateKeys,
        extractedRowsCount: rows.length,
        extractedCommodityRowsCount: pageMatch.rows.length,
        extractedMonthlyTotals: totalsByMonth,
        tableTotalRow: pageMatch.totalRow || null,
        rowDiagnostics: pageMatch.rowDiagnostics || [],
        rowTotalMismatches,
        tableTotalValidation,
        annualComparison: {
          approvedAnnualImportTotalValueUsdThousand: this.expectedImportTotalValueUsdThousand,
          monthlyTotalValueUsdThousand: generatedTotal,
          differenceValueUsdThousand: annualDifference,
          differencePct: this.expectedImportTotalValueUsdThousand ? annualDifference / this.expectedImportTotalValueUsdThousand * 100 : null,
        },
        diagnostics,
        status,
        checkedAt: new Date().toISOString(),
        notes: "Draft-only monthly imports extraction. No approval or publishing path is enabled in B3 Step 4.",
        debug: {
          searchedPages: pages.length,
          detectedPageNumber: pageMatch.page.pageNumber,
          windowPageNumbers: pageMatch.windowPageNumbers,
          tableSignature: pageMatch.signature,
          parsedTableShape: pageMatch.shape,
        },
      },
      debug: {
        searchedPages: pages.length,
        detectedPageNumber: pageMatch.page.pageNumber,
        windowPageNumbers: pageMatch.windowPageNumbers,
        tableSignature: pageMatch.signature,
        parsedTableShape: pageMatch.shape,
      },
    };
  },

  extractMonthlyExportsFromParsedRows(pageMatch, batch, sourceFile, options = {}) {
    const year = options.year || 2013;
    const ruleId = options.ruleId || this.monthlyExportRuleId;
    const tableLabel = options.tableLabel || this.monthlyExportsTableLabel;
    const idPrefix = options.idPrefix || "draftobs_2013_monthly_export_";
    const expectedTotal = options.expectedTotal || this.expectedTotalValueUsdThousand;
    const rows = pageMatch.rows.flatMap((row, rowIndex) =>
      row.months.map((monthRow, monthIndex) => this.toDraftObservation({
        ...row,
        quantity: monthRow.quantity,
        valueUsdThousand: monthRow.valueUsdThousand,
        rawRowText: `${row.rawRowText} | ${monthRow.monthLabel}`,
      }, pageMatch.page.pageNumber, batch, sourceFile, rowIndex * this.monthlyExportMonths.length + monthIndex, {
        flow: "export",
        ruleId,
        tableLabel,
        idPrefix,
        periodType: "monthly",
        month: monthRow.monthNumber,
        monthNumber: monthRow.monthNumber,
        monthLabel: monthRow.monthLabel,
        quarter: null,
        coveredEconomicPeriod: {
          year,
          periodType: "monthly",
          month: monthRow.monthNumber,
          startMonth: monthRow.monthNumber,
          endMonth: monthRow.monthNumber,
          label: `${monthRow.monthLabel} ${year}`,
        },
      }))
    );
    const totalsByMonth = this.monthlyExportMonths.map((month) => ({
      monthNumber: month.monthNumber,
      monthLabel: month.monthLabel,
      extractedTotalValueUsdThousand: rows
        .filter((row) => Number(row.month) === month.monthNumber)
        .reduce((sum, row) => sum + (Number(row.valueUsdThousand) || 0), 0),
      rowsCount: rows.filter((row) => Number(row.month) === month.monthNumber).length,
    }));
    const duplicateKeys = this.findMonthlyDuplicateKeys(rows);
    const coveredMonths = [...new Set(rows.map((row) => Number(row.month)).filter(Boolean))].sort((a, b) => a - b);
    const expectedMonths = this.monthlyExportMonths.map((month) => month.monthNumber);
    const missingMonths = expectedMonths.filter((month) => !coveredMonths.includes(month));
    const tableTotalValidation = this.validateMonthlyTableTotals(rows, pageMatch.totalRow);
    const rowTotalMismatches = pageMatch.rows.filter((row) => row.rowTotalMismatch).map((row) => ({
      commodityName: row.commodityName,
      monthlySumValueUsdThousand: row.monthlySumValueUsdThousand,
      rowTotalValueUsdThousand: row.rowTotalValueUsdThousand,
      differenceValueUsdThousand: row.rowTotalDifferenceValueUsdThousand,
      rawRowText: row.rawRowText,
      monthlyValues: row.months.map((month) => month.valueUsdThousand),
    }));
    const finalStatus = rows.length && !duplicateKeys.length && !missingMonths.length && !rowTotalMismatches.length && tableTotalValidation.status === "pass" ? "pass" : "fail";
    return {
      observations: rows,
      validation: {
        id: (options.validationIdPrefix || "validation_monthly_exports_") + Date.now(),
        importBatchId: batch.id,
        sourceFileId: sourceFile?.id || batch.sourceFileId,
        extractionRuleId: ruleId,
        extractionVersion: options.extractionVersion || this.extractionVersion,
        tableType: "exports_by_commodity_monthly",
        flow: "export",
        year,
        periodType: "monthly",
        publicationIssue: {
          source: "CBOS Foreign Trade Statistical Digest",
          issueYear: year,
          issuePeriod: "Q4",
          issueLabel: `Q4 ${year}`,
        },
        coveredEconomicPeriod: {
          year,
          periodType: "monthly",
          startMonth: 1,
          endMonth: 12,
          label: `Monthly ${year} Jan-Dec`,
        },
        expectedMonths,
        coveredMonths,
        missingMonths,
        duplicateObservationKeys: duplicateKeys,
        extractedRowsCount: rows.length,
        extractedCommodityRowsCount: pageMatch.rows.length,
        extractedMonthlyTotals: totalsByMonth,
        tableTotalRow: pageMatch.totalRow || null,
        rowDiagnostics: pageMatch.rowDiagnostics || [],
        expectedCommodityChecklist: this.buildMonthlyExpectedChecklist(pageMatch.rows, pageMatch.rowDiagnostics || []),
        rowTotalMismatches,
        rowReconciliationDiagnostics: this.buildMonthlyRowReconciliationDiagnostics(pageMatch.rows, rows, pageMatch.rowDiagnostics || []),
        tableTotalValidation,
        reportedTotalsAvailable: true,
        status: finalStatus,
        checkedAt: new Date().toISOString(),
        notes: `Draft-only ${year} monthly exports extraction from coordinate-grid table reconstruction. No approval or publishing is automatic.`,
        debug: {
          searchedPages: 1,
          detectedPageNumber: pageMatch.page.pageNumber,
          anchorMatched: true,
          parsedTableShape: pageMatch.shape,
          parserCorrection: "2014-coordinate-grid",
          tableSignature: pageMatch.signature,
          gridDiagnostics: pageMatch.diagnostics,
        },
      },
      debug: {
        searchedPages: 1,
        detectedPageNumber: pageMatch.page.pageNumber,
        anchorMatched: true,
        parsedTableShape: pageMatch.shape,
        parserCorrection: "2014-coordinate-grid",
        tableSignature: pageMatch.signature,
        gridDiagnostics: pageMatch.diagnostics,
      },
    };
  },

  extract2014MonthlyExports(batch, sourceFile) {
    const originalTotal = this.expectedTotalValueUsdThousand;
    const originalMonthlyExpectedRowTotals = this.activeMonthlyExpectedRowTotals;
    try {
      this.expectedTotalValueUsdThousand = this.expected2014ExportTotalValueUsdThousand;
      this.activeMonthlyExpectedRowTotals = {};
      const pages = batch?.debugPreviewPages || [];
      const pageMatch = this.findMonthlyExportsPage(pages, { year: 2014, expectedTotalValueUsdThousand: this.expected2014ExportTotalValueUsdThousand });
      if (!pageMatch) throw new Error("2014 monthly exports commodity table signature not found in parsed PDF pages");
      if (!Array.isArray(pageMatch.page.layoutItems) || !pageMatch.page.layoutItems.length) {
        throw new Error("2014 monthly exports require PDF.js coordinate items. This parsed batch is stale; re-parse the 2014 PDF with the current app before extracting.");
      }
      const gridParsed = this.parse2014MonthlyExportsGrid(pageMatch.page);
      const selectedTextMode = pageMatch.signature?.textMode || "text";
      const tableText = this.reconstructedMonthlyTableText(pageMatch.page, pageMatch.signature?.textMode || "text");
      const useGrid = gridParsed?.rows?.length
        && gridParsed.totalRow?.grandTotalValueUsdThousand === this.expected2014ExportTotalValueUsdThousand
        && Math.abs((gridParsed.rows || []).reduce((sum, row) => sum + (Number(row.monthlySumValueUsdThousand) || 0), 0) - this.expected2014ExportTotalValueUsdThousand) <= 1;
      const scrubbedPage = {
        ...pageMatch.page,
        text: this.scrub2014MonthlyFooterArtifacts(tableText || pageMatch.page.text || ""),
      };
      const tempBatch = { ...batch, debugPreviewPages: [scrubbedPage] };
      if (!useGrid) {
        const generatedTotal = (gridParsed?.rows || []).reduce((sum, row) => sum + (Number(row.monthlySumValueUsdThousand) || 0), 0);
        throw new Error(`2014 monthly exports coordinate-grid validation failed; extraction stopped. rows=${gridParsed?.rows?.length || 0}, total=${generatedTotal.toLocaleString()}, expected=${this.expected2014ExportTotalValueUsdThousand.toLocaleString()}, rowMismatches=${gridParsed?.diagnostics?.rowTotalMismatches ?? "n/a"}`);
      }
      const result = this.extractMonthlyExportsFromParsedRows(gridParsed, tempBatch, sourceFile, {
            year: 2013,
            ruleId: this.monthlyExportRuleId,
            tableLabel: this.monthlyExportsTableLabel,
            idPrefix: "draftobs_2013_monthly_export_",
            expectedTotal: this.expected2014ExportTotalValueUsdThousand,
            validationIdPrefix: "validation_2013_monthly_exports_",
          });
      result.debug = {
        ...result.debug,
        searchedPages: pages.length,
        detectedPageNumber: pageMatch.page.pageNumber,
        tableSignature: pageMatch.signature,
        selectedTextMode,
        gridParserUsed: Boolean(useGrid),
        gridParserDiagnostics: gridParsed?.diagnostics || null,
        footerScrub: this.detect2014MonthlyFooterArtifacts(tableText || pageMatch.page.text || ""),
      };
      return this.reyearMonthlyExtractionResult(result, {
        year: 2014,
        flow: "export",
        ruleId: this.monthlyExportRuleId2014,
        tableLabel: this.monthlyExportsTableLabel2014,
        idPrefix: "draftobs_2014_monthly_export_",
        expectedTotal: this.expected2014ExportTotalValueUsdThousand,
        validationIdPrefix: "validation_2014_monthly_exports_",
      });
    } finally {
      this.expectedTotalValueUsdThousand = originalTotal;
      this.activeMonthlyExpectedRowTotals = originalMonthlyExpectedRowTotals;
    }
  },

  scrub2014MonthlyFooterArtifacts(text) {
    return this.normalizeText(text || "")
      .replace(/\b\d{1,3}\s+of\s+\d{1,3}\b/gi, " ")
      .replace(/\bpage\s+\d{1,3}\b/gi, " ")
      .replace(/\b(?:central\s+bank\s+of\s+sudan|foreign\s+trade\s+statistical\s+digest)\b/gi, " ")
      .replace(/\s+/g, " ")
      .trim();
  },

  detect2014MonthlyFooterArtifacts(text) {
    const normalized = this.normalizeText(text || "");
    return {
      pageCounters: normalized.match(/\b\d{1,3}\s+of\s+\d{1,3}\b/gi) || [],
      pageLabels: normalized.match(/\bpage\s+\d{1,3}\b/gi) || [],
      repeatedStandalone10Count: (normalized.match(/\b10\b/g) || []).length,
      note: "2014 monthly parser scrubbed page/footer artifacts before row parsing only for this year-specific rule.",
    };
  },

  extract2014MonthlyImports(batch, sourceFile) {
    const originalTotal = this.expectedImportTotalValueUsdThousand;
    try {
      this.expectedImportTotalValueUsdThousand = this.expected2014ImportTotalValueUsdThousand;
      const pages = batch?.debugPreviewPages || [];
      const pageMatch = this.findMonthlyImportsPage(pages, { year: 2014, expectedTotalValueUsdThousand: this.expected2014ImportTotalValueUsdThousand, ruleId: this.monthlyImportRuleId2014 });
      if (!pageMatch) throw new Error("2014 monthly imports commodity table signature not found in parsed PDF pages");
      const selectedPage = {
        ...pageMatch.page,
        text: pageMatch.text || pageMatch.page.text || "",
      };
      const tempBatch = { ...batch, debugPreviewPages: [selectedPage] };
      const result = this.extract2013MonthlyImports(tempBatch, sourceFile);
      result.debug = { ...result.debug, searchedPages: pages.length, detectedPageNumber: pageMatch.page.pageNumber, windowPageNumbers: pageMatch.windowPageNumbers, tableSignature: pageMatch.signature };
      return this.reyearMonthlyExtractionResult(result, {
        year: 2014,
        flow: "import",
        ruleId: this.monthlyImportRuleId2014,
        tableLabel: this.monthlyImportsTableLabel2014,
        idPrefix: "draftobs_2014_monthly_import_",
        expectedTotal: this.expected2014ImportTotalValueUsdThousand,
        validationIdPrefix: "validation_2014_monthly_imports_",
      });
    } finally {
      this.expectedImportTotalValueUsdThousand = originalTotal;
    }
  },

  reyearMonthlyExtractionResult(result, config) {
    const observations = result.observations.map((row, index) => ({
      ...row,
      id: config.idPrefix + (index + 1),
      year: config.year,
      flow: config.flow,
      extractionRuleId: config.ruleId,
      extractionVersion: this.extractionVersion2014,
      sourceTableLabel: config.tableLabel,
      publicationIssue: {
        source: "CBOS Foreign Trade Statistical Digest",
        issueYear: config.year,
        issuePeriod: "Q4",
        issueLabel: `Q4 ${config.year}`,
      },
      coveredEconomicPeriod: {
        year: config.year,
        periodType: "monthly",
        month: row.monthNumber || row.month,
        startMonth: row.monthNumber || row.month,
        endMonth: row.monthNumber || row.month,
        label: `${row.monthLabel || "Month"} ${config.year}`,
      },
    }));
    const generatedTotal = observations.reduce((sum, row) => sum + (Number(row.valueUsdThousand) || 0), 0);
    const annualDifference = generatedTotal - config.expectedTotal;
    const tableTotalValidation = result.validation.tableTotalValidation
      ? {
          ...result.validation.tableTotalValidation,
          grandDifferenceValueUsdThousand: generatedTotal - (result.validation.tableTotalValidation.reportedGrandTotalValueUsdThousand ?? config.expectedTotal),
        }
      : null;
    const status = result.validation.status === "fail" || Math.abs(annualDifference) > 1 ? "fail" : result.validation.status;
    return {
      observations,
      validation: {
        ...result.validation,
        id: config.validationIdPrefix + Date.now(),
        extractionRuleId: config.ruleId,
        extractionVersion: this.extractionVersion2014,
        flow: config.flow,
        year: config.year,
        publicationIssue: {
          source: "CBOS Foreign Trade Statistical Digest",
          issueYear: config.year,
          issuePeriod: "Q4",
          issueLabel: `Q4 ${config.year}`,
        },
        coveredEconomicPeriod: {
          year: config.year,
          periodType: "monthly",
          startMonth: 1,
          endMonth: 12,
          label: `Monthly ${config.year} Jan-Dec`,
        },
        extractedRowsCount: observations.length,
        extractedMonthlyTotals: this.monthlyExportMonths.map((month) => ({
          monthNumber: month.monthNumber,
          monthLabel: month.monthLabel,
          extractedTotalValueUsdThousand: observations
            .filter((row) => Number(row.month) === month.monthNumber)
            .reduce((sum, row) => sum + (Number(row.valueUsdThousand) || 0), 0),
          rowsCount: observations.filter((row) => Number(row.month) === month.monthNumber).length,
        })),
        tableTotalValidation,
        annualComparison: {
          approvedAnnualTotalValueUsdThousand: config.expectedTotal,
          monthlyTotalValueUsdThousand: generatedTotal,
          differenceValueUsdThousand: annualDifference,
          differencePct: config.expectedTotal ? annualDifference / config.expectedTotal * 100 : null,
          status: Math.abs(annualDifference) <= 1 ? "pass" : "fail",
        },
        status,
        notes: `Draft-only ${config.year} monthly ${config.flow} extraction using the controlled legacy Q4 monthly table pattern. No approval or publishing is automatic.`,
      },
      debug: result.debug,
    };
  },

  parse2014MonthlyExportsGrid(page) {
    const items = (page?.layoutItems || []).map((item) => ({
      ...item,
      str: String(item.str || "").trim(),
      x: Number(item.x || 0),
      y: Number(item.y || 0),
    })).filter((item) => item.str && !this.isCoordinateFooterToken(item.str));
    if (!items.length) return null;
    const columnLayout = this.detect2014MonthlyExportColumns(items);
    const yTolerance = 0.8;
    const rowBands = [];
    [...items].sort((a, b) => b.y - a.y || a.x - b.x).forEach((item) => {
      const band = rowBands.find((candidate) => Math.abs(candidate.y - item.y) <= yTolerance);
      if (band) {
        band.items.push(item);
        band.y = (band.y * (band.items.length - 1) + item.y) / band.items.length;
      } else {
        rowBands.push({ y: item.y, items: [item] });
      }
    });
    const rows = [];
    const rowDiagnostics = [];
    const numericRowCandidates = [];
    rowBands
      .map((band) => ({ ...band, items: band.items.sort((a, b) => a.x - b.x) }))
      .forEach((band) => {
        const lineText = band.items.map((item) => item.str).join(" ").replace(/\s+/g, " ").trim();
        if (!lineText || this.isMonthlyFooterArtifactRow(lineText)) return;
        const commodityMatch = this.findCommodityMatchInGridRow(lineText);
        const numericItems = band.items
          .filter((item) => /^-|\d[\d,]*(?:\.\d+)?$/.test(item.str))
          .filter((item) => !this.isCoordinateFooterToken(item.str));
        if (!commodityMatch && /^total\b/i.test(lineText)) {
          numericRowCandidates.push({ type: "total", band, numericItems, lineText });
          return;
        }
        if (!commodityMatch) return;
        const parsed = this.parseGridMonthlyExportRow({ band, lineText, commodityMatch, numericItems, columnLayout });
        if (parsed) {
          rows.push(parsed);
          rowDiagnostics.push(this.monthlyRowDiagnostic({ commodityDef: commodityMatch.commodityDef, alias: commodityMatch.alias }, parsed, "parsed"));
        } else {
          rowDiagnostics.push({ commodityName: commodityMatch.commodityDef.name, matchedAlias: commodityMatch.alias, status: "skipped_bad_grid_cells", rawRowText: lineText });
        }
      });
    const totalRowCandidate = numericRowCandidates
      .map((candidate) => this.parseGridTotalRow(candidate, this.expected2014ExportTotalValueUsdThousand, columnLayout))
      .filter(Boolean)
      .sort((a, b) => Math.abs((a.grandTotalValueUsdThousand || 0) - this.expected2014ExportTotalValueUsdThousand) - Math.abs((b.grandTotalValueUsdThousand || 0) - this.expected2014ExportTotalValueUsdThousand))[0];
    const diagnostics = {
      coordinateItems: items.length,
      yBands: rowBands.length,
      columnLayoutDetected: Boolean(columnLayout?.monthColumns?.length === 12 && columnLayout.totalColumn),
      columnLayout,
      parsedCommodityRows: rows.length,
      rowTotalMismatches: rows.filter((row) => row.rowTotalMismatch).length,
      totalRowFound: Boolean(totalRowCandidate),
      generatedTotalValueUsdThousand: rows.reduce((sum, row) => sum + (Number(row.monthlySumValueUsdThousand) || 0), 0),
      footerTokensRejected: (page?.layoutItems || []).filter((item) => this.isCoordinateFooterToken(item.str)).length,
    };
    return {
      page,
      rows,
      totalRow: totalRowCandidate || null,
      rowDiagnostics,
      shape: "coordinate-grid-monthly-exports",
      signature: { textMode: "coordinateGrid", score: 200, accepted: true, matchedSignals: ["PDF.js coordinate grid rows", "Y-axis row bands", "X-position month cells"] },
      diagnostics,
    };
  },

  detect2014MonthlyExportColumns(items) {
    const monthDefs = this.monthlyExportMonths.map((month) => ({
      ...month,
      patterns: [
        new RegExp(`^${month.monthLabel}$`, "i"),
        ...month.aliases.map((alias) => new RegExp(`^${String(alias).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\.?$`, "i")),
      ],
    }));
    const monthColumns = monthDefs.map((month) => {
      const matches = items.filter((item) => month.patterns.some((pattern) => pattern.test(String(item.str || "").replace(/\.$/, ""))));
      if (!matches.length) return null;
      const best = matches.sort((a, b) => b.y - a.y || a.x - b.x)[0];
      return { monthNumber: month.monthNumber, monthLabel: month.monthLabel, x: best.x, source: best.str };
    }).filter(Boolean);
    if (monthColumns.length < 10) return null;
    const totalCandidates = items.filter((item) => /^total$/i.test(item.str));
    const monthXs = monthColumns.map((item) => item.x).sort((a, b) => a - b);
    const minMonthX = Math.min(...monthXs);
    const maxMonthX = Math.max(...monthXs);
    const totalColumn = totalCandidates
      .map((item) => ({ x: item.x, source: item.str, distanceFromMonths: Math.min(Math.abs(item.x - minMonthX), Math.abs(item.x - maxMonthX)) }))
      .sort((a, b) => a.distanceFromMonths - b.distanceFromMonths)[0] || null;
    const allColumns = [...monthColumns, ...(totalColumn ? [{ monthNumber: "total", monthLabel: "Total", x: totalColumn.x, source: totalColumn.source }] : [])]
      .sort((a, b) => a.x - b.x);
    const boundaries = allColumns.map((column, index) => ({
      ...column,
      left: index === 0 ? column.x - 18 : (allColumns[index - 1].x + column.x) / 2,
      right: index === allColumns.length - 1 ? column.x + 18 : (column.x + allColumns[index + 1].x) / 2,
    }));
    return {
      monthColumns,
      totalColumn,
      boundaries,
      minX: Math.min(...boundaries.map((item) => item.left)),
      maxX: Math.max(...boundaries.map((item) => item.right)),
    };
  },

  findCommodityMatchInGridRow(lineText) {
    const matches = [];
    this.monthlyExportCommodities.forEach((commodityDef) => {
      this.aliasesFor(commodityDef).forEach((alias) => {
        const index = this.indexOfInsensitive(lineText, alias, 0);
        if (index !== -1 && this.isMonthlyCommodityMatch(lineText, index, alias)) matches.push({ commodityDef, alias, index });
      });
    });
    return matches.sort((a, b) => a.index - b.index || b.alias.length - a.alias.length)[0] || null;
  },

  parseGridMonthlyExportRow({ band, lineText, commodityMatch, numericItems, columnLayout }) {
    const cells = this.assignNumericItemsToMonthlyColumns(numericItems, columnLayout);
    const valueTokens = this.monthlyExportMonths.map((month) => cells.months.get(month.monthNumber) ?? null);
    const totalToken = cells.total ?? null;
    if (valueTokens.filter((token) => token !== null && token !== undefined).length < 12 || totalToken === null) return null;
    const commodity = commodityMatch.commodityDef.name;
    const unitItems = band.items.filter((item) => item.x > (numericItems[0]?.x || 0) - 120 && item.x < (numericItems[0]?.x || 0) && !/^\d|^-/.test(item.str));
    const unit = this.cleanUnit(unitItems.map((item) => item.str).join(" ")) || "Value";
    const months = this.monthlyExportMonths.map((month, index) => ({
      monthNumber: month.monthNumber,
      monthLabel: month.monthLabel,
      quantity: null,
      valueUsdThousand: this.parseNumberOrNull(valueTokens[index]),
    }));
    const rowTotalValueUsdThousand = this.parseNumberOrNull(totalToken);
    const monthlySumValueUsdThousand = months.reduce((sum, month) => sum + (Number(month.valueUsdThousand) || 0), 0);
    const rowTotalDifferenceValueUsdThousand = rowTotalValueUsdThousand === null ? null : monthlySumValueUsdThousand - rowTotalValueUsdThousand;
    const rowTotalMismatch = rowTotalDifferenceValueUsdThousand !== null && Math.abs(rowTotalDifferenceValueUsdThousand) > 1;
    return {
      commodityName: commodity,
      matchedAlias: commodityMatch.alias,
      reconcileCommodityId: commodityMatch.commodityDef.reconcileCommodityId || null,
      unit,
      months,
      rowTotalValueUsdThousand,
      monthlySumValueUsdThousand,
      rowTotalDifferenceValueUsdThousand,
      rowTotalMismatch,
      rawRowText: lineText,
      shape: "coordinate-grid-value-cells",
      gridY: band.y,
      gridCellDiagnostics: cells.diagnostics,
    };
  },

  assignNumericItemsToMonthlyColumns(numericItems, columnLayout) {
    if (!columnLayout?.boundaries?.length) {
      const cleanedTokens = this.stripMonthlyFooterNumericTokens(numericItems.map((item) => item.str));
      return {
        months: new Map(this.monthlyExportMonths.map((month, index) => [month.monthNumber, cleanedTokens[index] ?? null])),
        total: cleanedTokens[12] ?? null,
        diagnostics: { mode: "sequential-fallback", ignoredItems: [] },
      };
    }
    const monthCells = new Map();
    const ignoredItems = [];
    const assignableItems = numericItems.filter((item) => item.x >= columnLayout.minX && item.x <= columnLayout.maxX && !this.isCoordinateFooterToken(item.str));
    columnLayout.boundaries.forEach((column) => {
      const candidates = assignableItems
        .filter((item) => item.x >= column.left && item.x < column.right)
        .sort((a, b) => Math.abs(a.x - column.x) - Math.abs(b.x - column.x));
      const chosen = candidates[0] || null;
      if (column.monthNumber === "total") {
        if (chosen) monthCells.set("total", chosen.str);
      } else if (chosen) {
        monthCells.set(column.monthNumber, chosen.str);
      }
      candidates.slice(1).forEach((item) => ignoredItems.push({ str: item.str, x: item.x, reason: "double-valued month cell; closest-to-column-center kept" }));
    });
    numericItems
      .filter((item) => item.x < columnLayout.minX || item.x > columnLayout.maxX)
      .forEach((item) => ignoredItems.push({ str: item.str, x: item.x, reason: "outside Jan-Dec/Total column bounds" }));
    return {
      months: monthCells,
      total: monthCells.get("total") ?? null,
      diagnostics: { mode: "coordinate-columns", ignoredItems },
    };
  },

  parseGridTotalRow(candidate, expectedTotal, columnLayout) {
    const cells = this.assignNumericItemsToMonthlyColumns(candidate.numericItems, columnLayout);
    const numericTokens = this.monthlyExportMonths.map((month) => cells.months.get(month.monthNumber)).concat(cells.total);
    if (numericTokens.filter((token) => token !== null && token !== undefined).length < 13) return null;
    const monthlyValues = this.monthlyExportMonths.map((month, index) => ({
      monthNumber: month.monthNumber,
      monthLabel: month.monthLabel,
      valueUsdThousand: this.parseNumberOrNull(numericTokens[index]),
    }));
    return {
      rawRowText: candidate.lineText,
      numericTokens,
      monthlyValues,
      grandTotalValueUsdThousand: this.parseNumberOrNull(numericTokens[12]),
      score: Math.max(0, 100000 - Math.abs((this.parseNumberOrNull(numericTokens[12]) || 0) - expectedTotal)),
    };
  },

  isCoordinateFooterToken(value) {
    const text = String(value || "").trim();
    if (!text) return true;
    if (/^\d{1,3}\s+of\s+\d{1,3}$/i.test(text)) return true;
    if (/^page\s+\d{1,3}$/i.test(text)) return true;
    if (/^(central\s+bank\s+of\s+sudan|foreign\s+trade\s+statistical\s+digest)$/i.test(text)) return true;
    return false;
  },

  findExportSummaryPage(pages, options = {}) {
    const commodities = options.commodities || this.commodities;
    const normalizedPages = pages.map((page) => ({
      page,
      text: this.normalizeText(page.text || ""),
      anchorMatched: /Summary\s+Of\s+Exports\s+During/i.test(page.text || "") || /ملخص\s+الصادرات/.test(page.text || ""),
    }));
    const fallbackPageNumbers = new Set([8, 9]);
    const candidates = normalizedPages
      .filter((item) => item.anchorMatched || fallbackPageNumbers.has(Number(item.page.pageNumber)))
      .map((item) => {
        const rows = this.parseRowsFromText(item.text, item.anchorMatched, commodities);
        return { ...item, rows, score: rows.length + (item.anchorMatched ? 2 : 0) };
      })
      .sort((a, b) => b.score - a.score);

    const best = candidates.find((item) => item.rows.length > 0);
    if (best) return best;
    return null;
  },

  findImportSummaryPage(pages, options = {}) {
    const expectedImportTotal = options.expectedTotalValueUsdThousand || this.expectedImportTotalValueUsdThousand;
    const normalizedPages = pages.map((page) => ({
      page,
      text: this.normalizeText(page.text || ""),
      anchorMatched: /Summary\s+Of\s+Imports(?:\s+By\s+Commodity)?\s+During/i.test(page.text || "") || /ملخص\s+الواردات/.test(page.text || ""),
    }));
    const fallbackPageNumbers = new Set([20, 21]);
    const candidates = normalizedPages
      .filter((item) => item.anchorMatched || fallbackPageNumbers.has(Number(item.page.pageNumber)))
      .map((item) => {
        const reportedTotal = this.parseExpectedTotal(item.text) || expectedImportTotal;
        const valueFirstRows = this.parseRowsFromText(item.text, item.anchorMatched, this.importCommodities, { valueFirst: true, quantityFirstCommodities: ["Vegetables & Veget. Products"] });
        const quantityFirstRows = this.parseRowsFromText(item.text, item.anchorMatched, this.importCommodities, { valueFirst: false });
        const rows = this.chooseRowsClosestToTotal(valueFirstRows, quantityFirstRows, reportedTotal);
        return { ...item, rows, score: rows.length + (item.anchorMatched ? 2 : 0) };
      })
      .sort((a, b) => b.score - a.score);

    return candidates.find((item) => item.rows.length > 0) || null;
  },

  legacyFindMonthlyExportsPageLinearText(pages, options = {}) {
    const expectedTotal = options.expectedTotalValueUsdThousand || this.expectedTotalValueUsdThousand;
    const year = options.year || 2013;
    const normalizedPages = pages.map((page) => ({
      page,
      text: this.normalizeText(page.text || ""),
      anchorMatched: /Exports\s+by\s+commodit/i.test(page.text || "") || /Ø§Ù„ØµØ§Ø¯Ø±Ø§Øª.*Ø§Ù„Ø³Ù„Ø¹/.test(page.text || ""),
    }));
    const candidates = normalizedPages
      .map((item) => {
        const signature = this.scoreMonthlyExportsSignature(item.text, { year, expectedTotalValueUsdThousand: expectedTotal });
        return { ...item, signature };
      })
      .filter((item) => item.signature.score >= 40 || item.anchorMatched)
      .map((item) => {
        const parsed = this.parseMonthlyCommodityRows(item.text);
        const generatedTotal = parsed.rows.reduce((sum, row) => sum + (Number(row.monthlySumValueUsdThousand) || 0), 0);
        const totalDiff = Math.abs(generatedTotal - expectedTotal);
        const rowMismatchPenalty = parsed.rows.filter((row) => row.rowTotalMismatch).length * 30;
        const footerPenalty = this.detect2014MonthlyFooterArtifacts(item.text).repeatedStandalone10Count;
        const totalScore = Math.max(0, 80 - Math.min(80, totalDiff / 1000));
        const parseScore = parsed.rows.length + (parsed.totalRow?.grandTotalValueUsdThousand === expectedTotal ? 25 : 0) + totalScore - rowMismatchPenalty - footerPenalty;
        return { ...item, rows: parsed.rows, totalRow: parsed.totalRow, rowDiagnostics: parsed.rowDiagnostics, shape: parsed.shape, score: item.signature.score + parseScore };
      })
      .sort((a, b) => b.score - a.score);

    const accepted = candidates.find((item) => item.rows.length > 0 && item.signature.accepted);
    if (accepted) return accepted;
    return candidates.find((item) => item.rows.length > 0 && item.signature.score >= 70) || null;
  },

  findMonthlyExportsPage(pages, options = {}) {
    const expectedTotal = options.expectedTotalValueUsdThousand || this.expectedTotalValueUsdThousand;
    const year = options.year || 2013;
    const normalizedPages = pages.flatMap((page) => this.monthlyTextModesForPage(page, year).map((mode) => ({
      page,
      textMode: mode.mode,
      text: mode.text || "",
      anchorMatched: /Exports\s+by\s+commodit/i.test(mode.text || ""),
    })));
    const candidates = normalizedPages
      .map((item) => {
        const signature = this.scoreMonthlyExportsSignature(item.text, { year, expectedTotalValueUsdThousand: expectedTotal });
        return { ...item, signature: { ...signature, textMode: item.textMode } };
      })
      .filter((item) => item.signature.score >= 40 || item.anchorMatched)
      .map((item) => {
        const parsed = this.parseMonthlyCommodityRows(item.text);
        const parseScore = parsed.rows.length + (parsed.totalRow?.grandTotalValueUsdThousand === expectedTotal ? 25 : 0);
        return { ...item, rows: parsed.rows, totalRow: parsed.totalRow, rowDiagnostics: parsed.rowDiagnostics, shape: parsed.shape, score: item.signature.score + parseScore };
      })
      .sort((a, b) => b.score - a.score || this.textModePriority(a.textMode) - this.textModePriority(b.textMode));

    const accepted = candidates.find((item) => item.rows.length > 0 && item.signature.accepted);
    if (accepted) return accepted;
    return candidates.find((item) => item.rows.length > 0 && item.signature.score >= 70) || null;
  },

  findMonthlyImportsPage(pages, options = {}) {
    const discovery = this.discoverMonthlyImportsTables({ debugPreviewPages: pages }, options);
    if (!discovery.selected?.accepted) {
      const error = new Error("Monthly imports commodity table signature not found");
      error.discovery = discovery;
      throw error;
    }
    const pageNumbers = discovery.selected.windowPageNumbers || [discovery.selected.pageNumber];
    const windowPages = pages.filter((page) => pageNumbers.includes(page.pageNumber));
    const textMode = discovery.selected.textMode || "text";
    const text = windowPages.map((page) => this.normalizeText(this.textForPageMode(page, textMode) || page.text || "")).join("\n");
    const parsed = this.parseImportsMonthlyCommodityRows(text, options.expectedTotalValueUsdThousand || this.expectedImportTotalValueUsdThousand);
    return {
      page: pages.find((page) => page.pageNumber === discovery.selected.pageNumber) || windowPages[0],
      windowPageNumbers: pageNumbers,
      text,
      rows: parsed.rows,
      totalRow: parsed.totalRow,
      rowDiagnostics: parsed.rowDiagnostics,
      shape: parsed.shape,
      signature: {
        score: discovery.selected.signatureScore,
        matchedSignals: discovery.selected.matchedSignals,
        rejectedSignals: discovery.selected.rejectedSignals,
        detectedMonthLabels: discovery.selected.detectedMonthLabels,
        missingMonthLabels: discovery.selected.missingMonthLabels,
        textMode,
      },
      score: discovery.selected.signatureScore + parsed.rows.length,
    };
  },

  discover2013MonthlyImportsTables(batch) {
    return this.discoverMonthlyImportsTables(batch, { year: 2013, expectedTotalValueUsdThousand: this.expectedImportTotalValueUsdThousand, ruleId: this.monthlyImportRuleId });
  },

  discoverMonthlyImportsTables(batch, options = {}) {
    const pages = batch?.debugPreviewPages || [];
    const year = options.year || 2013;
    const expectedTotal = options.expectedTotalValueUsdThousand || this.expectedImportTotalValueUsdThousand;
    const diagnostics = (pages || []).flatMap((page, index) => {
      const modes = this.importMonthlyTextModesForPage(page, year);
      const windowPages = String(year) === "2014" ? pages.slice(index, index + 6) : pages.slice(index, index + 5);
      return modes.map((mode) => {
        const text = this.normalizeText(mode.text || "");
        const windowText = windowPages.map((item) => this.normalizeText(this.textForPageMode(item, mode.mode) || item.text || "")).join("\n");
        const signature = this.scoreMonthlyImportsSignature(windowText, text, { year, expectedTotalValueUsdThousand: expectedTotal, textMode: mode.mode });
        return {
          pageNumber: page.pageNumber,
          textMode: mode.mode,
          windowPageNumbers: windowPages.map((item) => item.pageNumber),
          printedPageNumber: this.detectPrintedPageNumber(text),
          signatureScore: signature.score,
          matchedSignals: signature.matchedSignals,
          rejectedSignals: signature.rejectedSignals,
          monthDetections: signature.monthDetections,
          detectedMonthLabels: signature.detectedMonthLabels,
          missingMonthLabels: signature.missingMonthLabels,
          rawHeaderEvidence: signature.rawHeaderEvidence,
          reconstructionNotes: signature.reconstructionNotes,
          accepted: signature.accepted,
          headerPreview: this.extractImportsMonthlyHeaderPreview(text),
          signalPresence: this.importMonthlySignalPresence(text, windowText, expectedTotal),
        };
      });
    }).filter((item) => item.signatureScore > 0 || item.rejectedSignals.length)
      .sort((a, b) => b.signatureScore - a.signatureScore || this.textModePriority(a.textMode) - this.textModePriority(b.textMode));
    const selected = String(year) === "2014"
      ? diagnostics.find((item) => item.accepted && (Number(item.pageNumber) === 24 || (item.windowPageNumbers || []).includes(24)))
        || diagnostics.find((item) => item.accepted)
        || diagnostics.find((item) => item.signatureScore >= 80)
        || null
      : diagnostics.find((item) => item.accepted) || diagnostics.find((item) => item.signatureScore >= 80) || null;
    return {
      ruleId: options.ruleId || this.monthlyImportRuleId,
      tableType: "imports_by_commodity_monthly",
      flow: "import",
      year,
      periodType: "monthly",
      publicationIssue: `Q4 ${year}`,
      searchedPages: pages.length,
      selected,
      candidates: diagnostics,
      rejectedCandidates: diagnostics.filter((item) => !selected || item.pageNumber !== selected.pageNumber).slice(0, 10),
      safeForDeterministicExtraction: Boolean(selected?.accepted),
      notes: selected?.accepted
        ? "Highest-confidence monthly imports table selected by signature diagnostics only. No extraction was run."
        : "No fully accepted monthly imports table found. Do not implement extraction until the signature is inspected.",
    };
  },

  importMonthlyTextModesForPage(page, year) {
    const modes = this.monthlyTextModesForPage(page, year);
    if (String(year) === "2014") return modes.filter((item) => item.mode === "text" || item.mode === "normal");
    return modes;
  },

  monthlyTextModesForPage(page, year) {
    const reconstruction = page.textReconstruction || page.textVariants || {};
    const modes = [
      { mode: "text", text: page.text || "" },
      { mode: "normal", text: this.reconstructedMonthlyTableText(page, "normal") || reconstruction.normal || reconstruction.visualRows || "" },
      { mode: "rotatedLandscapeTightYRows", text: this.reconstructedMonthlyTableText(page, "rotatedLandscapeTightYRows") || reconstruction.rotatedLandscapeTightYRows || "" },
      { mode: "rotatedLandscapeYRows", text: this.reconstructedMonthlyTableText(page, "rotatedLandscapeYRows") || reconstruction.rotatedLandscapeYRows || "" },
      { mode: "rotatedLandscape", text: this.reconstructedMonthlyTableText(page, "rotatedLandscape") || reconstruction.rotatedLandscape || reconstruction.rotatedColumns || "" },
      { mode: "rotatedLandscapeReverse", text: this.reconstructedMonthlyTableText(page, "rotatedLandscapeReverse") || reconstruction.rotatedLandscapeReverse || reconstruction.rotatedColumnsReverse || "" },
    ].filter((item, index, arr) => item.text && arr.findIndex((other) => other.text === item.text) === index);
    return String(year) === "2014" ? modes : modes.filter((item) => item.mode === "text" || item.mode === "normal");
  },

  textForPageMode(page, mode) {
    const reconstruction = page.textReconstruction || page.textVariants || {};
    if (mode === "normal" || mode === "visualRows") return reconstruction.normal || reconstruction.visualRows || page.text || "";
    if (mode === "rotatedLandscapeTightYRows") return reconstruction.rotatedLandscapeTightYRows || page.text || "";
    if (mode === "rotatedLandscapeYRows") return reconstruction.rotatedLandscapeYRows || page.text || "";
    if (mode === "rotatedLandscape" || mode === "rotatedColumns") return reconstruction.rotatedLandscape || reconstruction.rotatedColumns || page.text || "";
    if (mode === "rotatedLandscapeReverse" || mode === "rotatedColumnsReverse") return reconstruction.rotatedLandscapeReverse || reconstruction.rotatedColumnsReverse || page.text || "";
    return page.text || "";
  },

  reconstructedMonthlyTableText(page, mode = "normal") {
    const reconstruction = page.textReconstruction || page.textVariants || {};
    const rows = reconstruction.layoutRows?.[mode] || [];
    if (!rows.length) return this.textForPageMode(page, mode);
    return rows
      .map((row) => this.scrub2014MonthlyFooterArtifacts(row))
      .filter((row) => row && !this.isMonthlyFooterArtifactRow(row))
      .flatMap((row) => this.splitMergedMonthlyCommodityRows(row))
      .join("\n");
  },

  splitMergedMonthlyCommodityRows(row) {
    const text = String(row || "").trim();
    if (!text) return [];
    const matches = [];
    this.monthlyExportCommodities.forEach((commodityDef) => {
      this.aliasesFor(commodityDef).forEach((alias) => {
        let index = this.indexOfInsensitive(text, alias, 0);
        while (index !== -1) {
          if (this.isMonthlyCommodityMatch(text, index, alias)) {
            matches.push({ index, alias, commodityName: commodityDef.name });
          }
          index = this.indexOfInsensitive(text, alias, index + alias.length);
        }
      });
    });
    const anchors = matches
      .sort((a, b) => a.index - b.index || b.alias.length - a.alias.length)
      .filter((match, index, arr) => {
        const previous = arr[index - 1];
        if (!previous) return true;
        if (match.index < previous.index + previous.alias.length) return false;
        return match.index !== previous.index;
      });
    if (anchors.length <= 1) return [text];
    const parts = anchors.map((anchor, index) => text.slice(anchor.index, anchors[index + 1]?.index ?? text.length).trim())
      .filter((part) => {
        const numericTokens = part.match(/-|\d[\d,]*(?:\.\d+)?/g) || [];
        return numericTokens.length >= 2 && !this.isMonthlyFooterArtifactRow(part);
      });
    return parts.length > 1 ? parts : [text];
  },

  isMonthlyFooterArtifactRow(row) {
    const text = String(row || "").trim();
    if (!text) return true;
    if (/^\d{1,3}\s+of\s+\d{1,3}$/i.test(text)) return true;
    if (/^page\s+\d{1,3}$/i.test(text)) return true;
    if (/^(central\s+bank\s+of\s+sudan|foreign\s+trade\s+statistical\s+digest)$/i.test(text)) return true;
    if (/^10$/.test(text)) return true;
    const tokens = text.split(/\s+/);
    const numeric = tokens.filter((token) => /^-?\d+(?:,\d{3})*(?:\.\d+)?$/.test(token));
    if (tokens.length >= 8 && numeric.length >= tokens.length * 0.8 && new Set(numeric).size <= 2 && numeric.includes("10")) return true;
    return false;
  },

  textModePriority(mode) {
    return { text: 0, normal: 1, visualRows: 1, rotatedLandscapeTightYRows: 2, rotatedLandscapeYRows: 3, rotatedLandscape: 4, rotatedColumns: 4, rotatedLandscapeReverse: 5, rotatedColumnsReverse: 5 }[mode] ?? 9;
  },

  importMonthlySignalPresence(currentText, windowText, expectedTotal) {
    const current = this.normalizeText(currentText || "");
    const windowScope = this.normalizeText(windowText || currentText || "");
    const expectedTotalText = Number(expectedTotal || 0).toLocaleString("en-US");
    return {
      importsWord: /\bimports?\b/i.test(windowScope),
      commodityWord: /\bcommodit(?:y|ies)\b/i.test(windowScope),
      monthlyWord: /\bmonthly\b/i.test(windowScope),
      janDec: /jan[\s\S]{0,180}dec/i.test(windowScope),
      valueUnit: /value\s+in\s+us\$?\s*0{2,3}|us\$\s*000|value\s+in\s+us/i.test(windowScope),
      expectedTotal: windowScope.includes(expectedTotalText),
      totalWord: /\btotal\b/i.test(windowScope),
      currentHeaderPreview: this.extractImportsMonthlyHeaderPreview(current),
    };
  },

  scoreMonthlyExportsSignature(text, options = {}) {
    const normalized = this.normalizeText(text || "");
    const lower = normalized.toLowerCase();
    const year = options.year || 2013;
    const expectedTotal = options.expectedTotalValueUsdThousand || this.expectedTotalValueUsdThousand;
    const expectedTotalText = Number(expectedTotal || 0).toLocaleString("en-US");
    const titleMatched = new RegExp(`exports\\s+by\\s+commodit(?:y|ies).*during(?:\\s+the\\s+period)?.*jan.*dec.*${year}`, "i").test(normalized)
      || /table\s+no\.?\s*\(?\s*2\s*\)?[\s\S]{0,500}exports\s+by\s+commodit/i.test(normalized)
      || /exports\s+by\s+commodit(?:y|ies)[\s\S]{0,500}monthly/i.test(normalized)
      || /commodities\s+.*jan.*feb.*march/i.test(normalized);
    const monthPatterns = [
      /\bjan\.?\b|يناير/i, /\bfeb\.?\b|فبراير/i, /\bmarch\b|مارس/i, /\bapril\b|\bapr\.?\b|ابريل|أبريل/i,
      /\bmay\b|مايو/i, /\bjune\b|\bjun\.?\b|يونيو/i, /\bjuly\b|\bjul\.?\b|يوليو/i,
      /\baug\b|أغسطس|اغسطس/i, /\bsep\b|سبتمبر/i, /\boct\b|أكتوبر|اكتوبر/i,
      /\bnov\b|نوفمبر/i, /\bdec\b|ديسمبر/i,
    ];
    const detectedMonths = monthPatterns.reduce((count, pattern) => count + (pattern.test(normalized) ? 1 : 0), 0);
    const totalColumnMatched = /\btotal\b/i.test(normalized);
    const unitMatched = /value\s+in\s+us\$?\s*0{2,3}/i.test(normalized) || /us\$\s*000/i.test(lower) || /value\s+in\s+us/i.test(lower);
    const totalRowMatched = new RegExp(`total[\\s\\S]{0,400}${expectedTotalText.replace(/,/g, "\\,")}`, "i").test(normalized) || normalized.includes(expectedTotalText);
    const quarterlyGrouped = /jan\s*[-–]\s*mar|apr\s*[-–]\s*jun|jul\s*[-–]\s*sep|oct\s*[-–]\s*dec/i.test(normalized);
    const quantityValuePairs = ((normalized.match(/\bquantity\b/gi) || []).length + (normalized.match(/\bqty\.?\b/gi) || []).length >= 2)
      && (normalized.match(/\bvalue\b/gi) || []).length >= 2;
    const quarterlyLayout = quarterlyGrouped || quantityValuePairs;
    const continuationPage = /cont'?d|تابع|ïº—ïºŽïº‘ï»Š/i.test(current);
    const unitSatisfied = unitMatched || (String(year) === "2014" && tableNo2 && continuationPage && totalRowMatched && monthlyValueRowEvidence);
    let score = 0;
    const tableNo2 = /table\s+no\.?\s*\(?\s*2\s*\)?/i.test(normalized);
    if (titleMatched) score += 25;
    if (tableNo2) score += 15;
    score += detectedMonths * 5;
    if (totalColumnMatched) score += 10;
    if (unitMatched) score += 15;
    if (totalRowMatched) score += 35;
    if (quarterlyGrouped) score -= 80;
    if (quantityValuePairs) score -= 60;
    const rejectionReasons = [];
    if (quarterlyGrouped) rejectionReasons.push("quarterly grouped Jan-Mar/Apr-Jun/Jul-Sep/Oct-Dec layout");
    if (quantityValuePairs) rejectionReasons.push("repeated Quantity/Value column pairs");
    if (detectedMonths < 12) rejectionReasons.push(`missing monthly columns: detected ${detectedMonths}/12`);
    if (!totalRowMatched) rejectionReasons.push(`final Total row ${expectedTotalText} not detected`);
    if (!unitMatched) rejectionReasons.push("Value in US$000'S unit not detected");
    return {
      score,
      accepted: score >= 100 && detectedMonths === 12 && totalColumnMatched && totalRowMatched && !quarterlyLayout,
      titleMatched,
      detectedMonths,
      totalColumnMatched,
      unitMatched,
      unitSatisfied,
      continuationPage,
      totalRowMatched,
      quarterlyGrouped,
      quantityValuePairs,
      rejectionReasons,
    };
  },

  scoreMonthlyImportsSignature(text, currentPageText = text, options = {}) {
    const normalized = this.normalizeText(text || "");
    const current = this.normalizeText(currentPageText || "");
    const lower = normalized.toLowerCase();
    const year = options.year || 2013;
    const expectedTotal = options.expectedTotalValueUsdThousand || this.expectedImportTotalValueUsdThousand;
    const expectedTotalText = Number(expectedTotal || 0).toLocaleString("en-US");
    const matchedSignals = [];
    const rejectedSignals = [];
    const titleMatched = new RegExp(`imp(?:orts|otrs)\\s+by\\s+commodit(?:y|ies).*during.*jan.*dec.*${year}`, "i").test(normalized)
      || /commodities\s+.*jan.*feb.*march/i.test(normalized) && /\bimp(?:orts|otrs)\b/i.test(normalized);
    const headerEvidence = this.extractImportsMonthlyHeaderEvidence(normalized);
    const monthDetections = this.detectMonthlyHeaderTokens(normalized);
    const rawDetectedMonths = monthDetections.filter((item) => item.detected).length;
    const decemberHeaderCount = (normalized.match(/\bdec\.?\b/gi) || []).length + (normalized.match(/ﺩﻳﺴﻤﺒﺮ/g) || []).length;
    const reconstructedNovemberFromDuplicateDecember = String(year) === "2014"
      && rawDetectedMonths === 11
      && !monthDetections.find((item) => item.label === "November")?.detected
      && decemberHeaderCount >= 2;
    const detectedMonths = rawDetectedMonths + (reconstructedNovemberFromDuplicateDecember ? 1 : 0);
    const detectedMonthLabels = monthDetections.filter((item) => item.detected).map((item) => item.label);
    const missingMonthLabels = monthDetections.filter((item) => !item.detected).map((item) => item.label);
    const monthlyValueRowEvidence = this.hasImportsMonthlyValueRowEvidence(normalized);
    const totalColumnMatched = /\btotal\b/i.test(normalized);
    const unitMatched = /value\s+in\s+us\$?\s*0{2,3}/i.test(normalized) || /us\$\s*000/i.test(lower) || /value\s+in\s+us/i.test(lower);
    const totalRowMatched = new RegExp(`total[\\s\\S]{0,500}${expectedTotalText.replace(/,/g, "\\,")}`, "i").test(normalized) || normalized.includes(expectedTotalText);
    const quarterlyGrouped = /jan\s*[-–â€“]\s*mar|apr\s*[-–â€“]\s*jun|jul\s*[-–â€“]\s*sep|oct\s*[-–â€“]\s*dec/i.test(normalized);
    const quantityValuePairs = ((normalized.match(/\bquantity\b/gi) || []).length + (normalized.match(/\bqty\.?\b/gi) || []).length >= 2)
      && (normalized.match(/\bvalue\b/gi) || []).length >= 2;
    const countryTable = /\bimports?\s+by\s+country\b/i.test(normalized)
      || /\bcountry\s+and\s+commodit/i.test(normalized)
      || /\bpartner\s+country\b/i.test(normalized)
      || /\bcountries\b/i.test(current)
      || /\bAsia\s*:/i.test(current)
      || /\bEurope\s*:/i.test(current)
      || /\bArab\s+countries\b/i.test(current);
    const annualSummary = /\bsummary\s+of\s+imports\b/i.test(normalized) && !/monthly/i.test(normalized);
    const currentAnnualSummary = (/\bsummary\s+of\s+imports\b/i.test(current) || /ملخص\s+الواردات/.test(current)) && !/monthly|شهري/i.test(current);
    const tableNo2 = /table\s+no\.?\s*\(?\s*2\s*\)?/i.test(current) || /جدول\s+رقم\s*\)?\s*2/i.test(current);
    let score = 0;
    if (titleMatched) { score += 30; matchedSignals.push(`title: Imports By Commodities During Jan-Dec ${year} Monthly`); }
    score += detectedMonths * 5;
    if (detectedMonths === 12) matchedSignals.push(reconstructedNovemberFromDuplicateDecember ? "monthly columns: Jan-Dec reconstructed from duplicated Dec/Nov header artifact" : "monthly columns: Jan-Dec");
    else if (detectedMonths) matchedSignals.push(`monthly columns detected: ${detectedMonths}/12`);
    if (monthlyValueRowEvidence) { score += 10; matchedSignals.push("row evidence: commodity rows expose 12 monthly values plus Total"); }
    if (totalColumnMatched) { score += 10; matchedSignals.push("Total column"); }
    if (unitMatched) { score += 15; matchedSignals.push("Value in US$000 unit marker"); }
    else if (unitSatisfied) { score += 8; matchedSignals.push("unit marker inherited from Table No. 2 continuation"); }
    if (totalRowMatched) { score += 35; matchedSignals.push(`final Total row near ${expectedTotalText}`); }
    if (tableNo2) { score += 20; matchedSignals.push("Table No. 2 imports commodity table"); }
    if (quarterlyGrouped) { score -= 80; rejectedSignals.push("quarterly grouped Jan-Mar/Apr-Jun/Jul-Sep/Oct-Dec layout"); }
    if (quantityValuePairs) { score -= 60; rejectedSignals.push("repeated Quantity/Value column pairs"); }
    if (countryTable) { score -= 70; rejectedSignals.push("country or country-by-commodity table"); }
    if (annualSummary) { score -= 50; rejectedSignals.push("annual imports summary table"); }
    if (currentAnnualSummary) { score -= 100; rejectedSignals.push("current page is annual imports summary, not monthly table start"); }
    if (!titleMatched && !tableNo2) rejectedSignals.push("monthly imports title not detected");
    if (detectedMonths < 12) rejectedSignals.push(`missing monthly columns: detected ${detectedMonths}/12`);
    if (!totalRowMatched) rejectedSignals.push(`final Total row ${expectedTotalText} not detected`);
    if (!unitSatisfied) rejectedSignals.push("Value in US$000'S unit not detected");
    const reconstructedMonthCoverage = detectedMonths === 12 || (detectedMonths >= 10 && monthlyValueRowEvidence);
    return {
      score,
      accepted: score >= 100 && (titleMatched || tableNo2) && reconstructedMonthCoverage && totalColumnMatched && totalRowMatched && unitSatisfied && !quarterlyGrouped && !quantityValuePairs && !countryTable && !annualSummary && !currentAnnualSummary,
      titleMatched,
      detectedMonths,
      rawDetectedMonths,
      reconstructedNovemberFromDuplicateDecember,
      reconstructedMonthCoverage,
      monthlyValueRowEvidence,
      monthDetections,
      detectedMonthLabels,
      missingMonthLabels,
      rawHeaderEvidence: headerEvidence,
      reconstructionNotes: detectedMonths === 12
        ? "All 12 months detected from English/Arabic header aliases."
        : monthlyValueRowEvidence
          ? "Header aliases are incomplete, but candidate commodity rows expose 12 monthly numeric fields plus Total. Treat as reconstructed header coverage for discovery only."
          : "Header aliases are incomplete and row evidence is insufficient.",
      totalColumnMatched,
      unitMatched,
      totalRowMatched,
      quarterlyGrouped,
      quantityValuePairs,
      countryTable,
      annualSummary,
      matchedSignals,
      rejectedSignals,
    };
  },

  detectMonthlyHeaderTokens(text) {
    const normalized = this.normalizeText(text || "");
    const monthDefs = [
      { label: "January", patterns: [/\bjan\.?\b/i, /يناير/i, /ÙŠÙ†Ø§ÙŠØ±/i] },
      { label: "February", patterns: [/\bfeb\.?\b/i, /فبراير/i, /ÙØ¨Ø±Ø§ÙŠØ±/i] },
      { label: "March", patterns: [/\bmarch\b|\bmar\.?\b/i, /مارس/i, /Ù…Ø§Ø±Ø³/i] },
      { label: "April", patterns: [/\bapril\b|\bapr\.?\b/i, /ابريل|أبريل/i, /Ø§Ø¨Ø±ÙŠÙ„|Ø£Ø¨Ø±ÙŠÙ„/i] },
      { label: "May", patterns: [/\bmay\b/i, /مايو/i, /Ù…Ø§ÙŠÙˆ/i] },
      { label: "June", patterns: [/\bjune\b|\bjun\.?\b/i, /يونيو/i, /ÙŠÙˆÙ†ÙŠÙˆ/i] },
      { label: "July", patterns: [/\bjuly\b|\bjul\.?\b/i, /يوليو/i, /ÙŠÙˆÙ„ÙŠÙˆ/i] },
      { label: "August", patterns: [/\baug(?:ust)?\.?\b/i, /اغسطس|أغسطس/i, /Ø§ØºØ³Ø·Ø³|Ø£ØºØ³Ø·Ø³/i] },
      { label: "September", patterns: [/\bsep(?:t|tember)?\.?\b/i, /سبتمبر/i, /Ø³Ø¨ØªÙ…Ø¨Ø±/i] },
      { label: "October", patterns: [/\boct(?:ober)?\.?\b/i, /اكتوبر|أكتوبر/i, /Ø§ÙƒØªÙˆØ¨Ø±|Ø£ÙƒØªÙˆØ¨Ø±/i] },
      { label: "November", patterns: [/\bnov(?:ember)?\.?\b/i, /نوفمبر/i, /Ù†ÙˆÙÙ…Ø¨Ø±/i] },
      { label: "December", patterns: [/\bdec(?:ember)?\.?\b/i, /ديسمبر/i, /Ø¯ÙŠØ³Ù…Ø¨Ø±/i] },
    ];
    return monthDefs.map((month) => {
      const matchedPattern = month.patterns.find((pattern) => pattern.test(normalized));
      return { label: month.label, detected: Boolean(matchedPattern), matchedPattern: matchedPattern ? String(matchedPattern) : null };
    });
  },

  hasImportsMonthlyValueRowEvidence(text) {
    const normalized = this.normalizeText(text || "");
    const tableStart = this.indexOfInsensitive(normalized, "Imports By Commodity");
    const scope = normalized.slice(tableStart >= 0 ? tableStart : 0);
    const rowAnchors = ["Wheat", "Sugar", "Dairy", "Petroleum", "Medicines", "Machinery", "Transport", "Textiles", "Others"];
    return rowAnchors.some((anchor) => {
      const index = this.indexOfInsensitive(scope, anchor);
      if (index < 0) return false;
      const segment = scope.slice(index, index + 900);
      const numericTokens = segment.match(/-|\(?\d{1,3}(?:,\d{3})*(?:\.\d+)?\)?/g) || [];
      return numericTokens.length >= 13;
    });
  },

  extractImportsMonthlyHeaderEvidence(text) {
    const normalized = this.normalizeText(text || "").replace(/\s+/g, " ").trim();
    const starts = [
      this.indexOfInsensitive(normalized, "Imports By Commodity"),
      this.indexOfInsensitive(normalized, "Value In US"),
      this.indexOfInsensitive(normalized, "Jan"),
    ].filter((index) => index >= 0);
    const start = starts.length ? Math.max(0, Math.min(...starts) - 80) : 0;
    return normalized.slice(start, start + 900);
  },

  detectPrintedPageNumber(text) {
    const normalized = this.normalizeText(text || "");
    const candidates = [
      /(?:page|Page)\s+(\d{1,3})/,
      /\n\s*(\d{1,3})\s*\n\s*(?:Central Bank of Sudan|Foreign Trade|Exports|Imports)/i,
    ];
    for (const pattern of candidates) {
      const match = normalized.match(pattern);
      if (match) return Number(match[1]);
    }
    return null;
  },

  extractImportsMonthlyHeaderPreview(text) {
    const normalized = this.normalizeText(text || "").replace(/\s+/g, " ").trim();
    const importsIndex = this.indexOfInsensitive(normalized, "Imports");
    const commoditiesIndex = this.indexOfInsensitive(normalized, "Commodities");
    const start = importsIndex >= 0 ? importsIndex : commoditiesIndex >= 0 ? commoditiesIndex : 0;
    return normalized.slice(start, start + 260);
  },

  monthlyCandidateRejections(pages) {
    return (pages || []).map((page) => {
      const signature = this.scoreMonthlyExportsSignature(this.normalizeText(page.text || ""));
      if (signature.accepted || signature.score < 30) return null;
      return {
        pageNumber: page.pageNumber,
        signatureScore: signature.score,
        rejectionReasons: signature.rejectionReasons,
      };
    }).filter(Boolean).sort((a, b) => b.signatureScore - a.signatureScore).slice(0, 6);
  },

  chooseRowsClosestToTotal(aRows, bRows, reportedTotal) {
    const score = (rows) => Math.abs(rows.reduce((sum, row) => sum + (Number(row.valueUsdThousand) || 0), 0) - reportedTotal);
    if (!aRows.length) return bRows;
    if (!bRows.length) return aRows;
    return score(aRows) <= score(bRows) ? aRows : bRows;
  },

  parseRowsFromText(text, anchorMatched, commodities = this.commodities, options = {}) {
    const rows = [];
    let cursor = this.findAnnualCommodityIndex(text, commodities[0]);
    if (cursor === -1 && !anchorMatched) return rows;
    commodities.forEach((commodity, index) => {
      const row = this.parseCommodityRow(text, commodity, commodities.slice(index + 1), cursor === -1 ? 0 : cursor, options);
      if (row) {
        rows.push(row);
        cursor = row.endIndex;
      }
    });
    return rows;
  },

  findAnnualCommodityIndex(text, commodity, fromIndex = 0) {
    const matches = this.aliasesFor(commodity)
      .map((alias) => this.indexOfInsensitive(text, alias, fromIndex))
      .filter((index) => index !== -1)
      .sort((a, b) => a - b);
    return matches.length ? matches[0] : -1;
  },

  parseMonthlyCommodityRows(text) {
    if (String(text || "").includes("\n")) return this.parseMonthlyCommodityRowsFromLines(text);
    const rows = [];
    const rowDiagnostics = [];
    let detectedShape = "unknown";
    const matches = this.findMonthlyCommodityMatches(text);
    matches.forEach((match, index) => {
      const nextIndex = matches[index + 1]?.index ?? this.indexOfInsensitive(text, "Total", match.index + match.alias.length);
      const row = this.parseMonthlyCommodityRowFromMatch(text, match, nextIndex);
      if (row) {
        rows.push(row);
        detectedShape = row.shape;
        rowDiagnostics.push(this.monthlyRowDiagnostic(match, row, "parsed"));
      } else {
        rowDiagnostics.push(this.monthlyRowDiagnostic(match, null, "skipped_bad_month_count"));
      }
    });
    const totalRow = this.parseMonthlyTotalRow(text, rows.length ? rows[rows.length - 1].endIndex : 0);
    if (totalRow) rowDiagnostics.push({ commodityName: "Total", status: "skipped_total_row", reason: "Table Total row parsed separately for reconciliation." });
    this.monthlyExpectedChecklist.forEach((name) => {
      if (!rowDiagnostics.some((item) => item.commodityName === name)) rowDiagnostics.push({ commodityName: name, status: "skipped_no_candidate", reason: "Expected row was not detected in the parsed text using configured aliases." });
    });
    return { rows, totalRow, rowDiagnostics, shape: totalRow ? `${detectedShape}+table-total` : detectedShape };
  },

  parseMonthlyCommodityRowsFromLines(text) {
    const rows = [];
    const rowDiagnostics = [];
    const normalizedLines = String(text || "")
      .split(/\r?\n/)
      .map((line) => this.scrubMonthlyRowFooterArtifacts(line).trim())
      .filter((line) => line && !this.isMonthlyFooterArtifactRow(line));
    const candidateLines = normalizedLines.flatMap((line) => this.splitMergedMonthlyCommodityRows(line));
    candidateLines.forEach((line) => {
      if (/^\s*Total\b/i.test(line)) return;
      const matches = [];
      this.monthlyExportCommodities.forEach((commodityDef) => {
        this.aliasesFor(commodityDef).forEach((alias) => {
          const index = this.indexOfInsensitive(line, alias, 0);
          if (index !== -1 && this.isMonthlyCommodityMatch(line, index, alias)) matches.push({ commodityDef, alias, index });
        });
      });
      const match = matches.sort((a, b) => a.index - b.index || b.alias.length - a.alias.length)[0];
      if (!match) return;
      const row = this.parseMonthlyCommodityRowFromMatch(line, match, line.length);
      if (row) rows.push(row);
      rowDiagnostics.push(this.monthlyRowDiagnostic(match, row, row ? "parsed" : "skipped_bad_month_count"));
    });
    const totalRow = this.parseMonthlyTotalRow(text, 0);
    if (totalRow) rowDiagnostics.push({ commodityName: "Total", status: "skipped_total_row", reason: "Table Total row parsed separately for reconciliation." });
    this.monthlyExpectedChecklist.forEach((name) => {
      if (!rowDiagnostics.some((item) => item.commodityName === name)) rowDiagnostics.push({ commodityName: name, status: "skipped_no_candidate", reason: "Expected row was not detected in reconstructed line rows." });
    });
    return { rows, totalRow, rowDiagnostics, shape: totalRow ? "line-reconstructed+table-total" : "line-reconstructed" };
  },

  parseImportsMonthlyCommodityRows(text, expectedTotal = this.expectedImportTotalValueUsdThousand) {
    const normalized = this.normalizeText(text || "");
    const rowDiagnostics = [];
    const rows = [];
    const totalRow = this.parseMonthlyTotalRow(normalized, this.indexOfInsensitive(normalized, "Grand Total") - 20, expectedTotal, "Grand Total");
    const rowPattern = /([A-Za-z][A-Za-z0-9 .,&'()/-]{1,120}?)\s+((?:-|\d[\d,]*(?:\.\d+)?)(?:\s+(?:-|\d[\d,]*(?:\.\d+)?)){11,12})/g;
    let match;
    while ((match = rowPattern.exec(normalized)) !== null) {
      const rawName = this.cleanImportsMonthlyCommodityName(match[1]);
      let numericTokens = this.stripMonthlyFooterNumericTokens(match[2].match(/-|\d[\d,]*(?:\.\d+)?/g) || []).slice(0, 13);
      const categoryName = this.detectImportsMonthlyCategory(normalized, match.index);
      const skipReason = this.importsMonthlySkipReason(rawName, categoryName, normalized, match.index);
      if (skipReason) {
        rowDiagnostics.push({ commodityName: rawName, categoryName, status: skipReason, reason: "Subtotal/header/parent row excluded from draft observations." });
        continue;
      }
      numericTokens = this.adjustImportsMonthlyTokensForMissingDecember(rawName, numericTokens);
      if (numericTokens.length < 13) {
        rowDiagnostics.push({ commodityName: rawName, categoryName, status: "skipped_bad_month_count", actualNumericCount: numericTokens.length, expectedNumericCount: 13 });
        continue;
      }
      const commodityName = this.disambiguateImportsMonthlyCommodityName(rawName, categoryName, normalized, match.index);
      const months = this.monthlyExportMonths.map((month, index) => ({
        monthNumber: month.monthNumber,
        monthLabel: month.monthLabel,
        quantity: null,
        valueUsdThousand: this.parseNumberOrNull(numericTokens[index]),
      }));
      const rowTotalValueUsdThousand = this.parseNumberOrNull(numericTokens[12]);
      const monthlySumValueUsdThousand = months.reduce((sum, month) => sum + (Number(month.valueUsdThousand) || 0), 0);
      const rowTotalDifferenceValueUsdThousand = rowTotalValueUsdThousand === null ? null : monthlySumValueUsdThousand - rowTotalValueUsdThousand;
      const rowTotalMismatch = rowTotalDifferenceValueUsdThousand !== null && Math.abs(rowTotalDifferenceValueUsdThousand) > 1;
      rows.push({
        commodityName,
        rawCommodityName: rawName,
        categoryName,
        unit: "Value",
        months,
        rowTotalValueUsdThousand,
        monthlySumValueUsdThousand,
        rowTotalDifferenceValueUsdThousand,
        rowTotalMismatch,
        rawRowText: `${rawName} ${match[2]}`.trim(),
        shape: "value-only-months",
        startIndex: match.index,
        endIndex: rowPattern.lastIndex,
      });
      rowDiagnostics.push({
        commodityName,
        rawCommodityName: rawName,
        categoryName,
        status: rowTotalMismatch ? "row_total_mismatch" : "parsed",
        rowTotalValueUsdThousand,
        monthlySumValueUsdThousand,
        differenceValueUsdThousand: rowTotalDifferenceValueUsdThousand,
      });
    }
    return {
      rows,
      totalRow,
      rowDiagnostics,
      shape: totalRow ? "imports-value-only-months+grand-total" : "imports-value-only-months",
    };
  },

  normalizeText(text) {
    return text.replace(/\u00a0/g, " ").replace(/[“”]/g, "\"").replace(/\s+/g, " ").trim();
  },

  parseCommodityRow(text, commodity, nextCommodities, fromIndex = 0, options = {}) {
    const commodityName = typeof commodity === "string" ? commodity : commodity.name;
    const match = this.aliasesFor(commodity)
      .map((alias) => ({ alias, index: this.indexOfInsensitive(text, alias, Math.max(0, fromIndex)) }))
      .filter((item) => item.index !== -1)
      .sort((a, b) => a.index - b.index || b.alias.length - a.alias.length)[0];
    const start = match?.index ?? -1;
    if (start === -1) return null;
    const end = this.findRowEnd(text, start + match.alias.length, nextCommodities);
    const segment = text.slice(start + match.alias.length, end === -1 ? undefined : end).trim();
    const tokens = segment.match(/-|\d[\d,]*|[A-Za-z./"&()]+/g) || [];
    const numericTokens = tokens.filter((token) => token === "-" || /^\d[\d,]*$/.test(token));
    if (numericTokens.length < 2) return null;
    const forceQuantityFirst = (options.quantityFirstCommodities || []).includes(commodityName);
    const valueFirst = options.valueFirst && !forceQuantityFirst;
    const valueToken = valueFirst ? numericTokens[0] : numericTokens[numericTokens.length - 1];
    const quantityToken = valueFirst ? numericTokens[1] : numericTokens[numericTokens.length - 2];
    const firstNumericIndex = tokens.findIndex((token) => token === numericTokens[0]);
    const unitTokens = firstNumericIndex > -1 ? tokens.slice(0, firstNumericIndex) : [];
    return {
      commodityName,
      unit: this.cleanUnit(unitTokens.join(" ")),
      quantity: this.cleanUnit(unitTokens.join(" ")) === "Value" ? null : this.parseNumberOrNull(quantityToken),
      valueUsdThousand: this.parseNumberOrNull(valueToken),
      rawCommodityName: match.alias,
      rawRowText: `${match.alias} ${segment}`.trim(),
      endIndex: end === -1 ? start + match.alias.length + segment.length : end,
    };
  },

  parseMonthlyCommodityRow(text, commodityDef, nextCommodities, fromIndex = 0) {
    const commodity = commodityDef.name || commodityDef;
    const start = this.findFirstAliasIndex(text, commodityDef, Math.max(0, fromIndex));
    if (start === -1) return null;
    const matchedAlias = this.findMatchedAlias(text, commodityDef, start) || commodity;
    const end = this.findMonthlyRowEnd(text, start + matchedAlias.length, nextCommodities);
    const segment = text.slice(start + matchedAlias.length, end === -1 ? undefined : end).trim();
    const tokens = segment.match(/-|\d[\d,]*(?:\.\d+)?|[A-Za-z./"&()]+/g) || [];
    const numericTokens = this.stripMonthlyFooterNumericTokens(tokens.filter((token) => token === "-" || /^\d[\d,]*(?:\.\d+)?$/.test(token)));
    if (!numericTokens.length) return null;
    if (numericTokens.length < 12) return null;
    const firstNumericIndex = tokens.findIndex((token) => token === numericTokens[0]);
    const unitTokens = firstNumericIndex > -1 ? tokens.slice(0, firstNumericIndex) : [];
    const unit = this.cleanUnit(unitTokens.join(" "));
    const adjustedNumericTokens = this.adjustMonthlyTokensForMissingDecemberTotal(commodity, numericTokens);
    const hasQuantityValuePairs = adjustedNumericTokens.length >= 25;
    const months = this.monthlyExportMonths.map((month) => {
      const zeroIndex = month.monthNumber - 1;
      const quantityToken = hasQuantityValuePairs ? adjustedNumericTokens[zeroIndex * 2] : null;
      const valueToken = hasQuantityValuePairs ? adjustedNumericTokens[zeroIndex * 2 + 1] : adjustedNumericTokens[zeroIndex];
      return {
        monthNumber: month.monthNumber,
        monthLabel: month.monthLabel,
        quantity: unit === "Value" ? null : this.parseNumberOrNull(quantityToken),
        valueUsdThousand: this.parseNumberOrNull(valueToken),
      };
    });
    const totalToken = this.selectMonthlyRowTotalToken(commodity, adjustedNumericTokens, months, hasQuantityValuePairs);
    const rowTotalValueUsdThousand = this.parseNumberOrNull(totalToken);
    const monthlySumValueUsdThousand = months.reduce((sum, month) => sum + (Number(month.valueUsdThousand) || 0), 0);
    const rowTotalDifferenceValueUsdThousand = rowTotalValueUsdThousand === null ? null : monthlySumValueUsdThousand - rowTotalValueUsdThousand;
    const rowTotalMismatch = rowTotalDifferenceValueUsdThousand !== null && Math.abs(rowTotalDifferenceValueUsdThousand) > 1;
    return {
      commodityName: commodity,
      matchedAlias,
      reconcileCommodityId: commodityDef.reconcileCommodityId || null,
      unit,
      months,
      rowTotalValueUsdThousand,
      monthlySumValueUsdThousand,
      rowTotalDifferenceValueUsdThousand,
      rowTotalMismatch,
      rawRowText: `${commodity} ${segment}`.trim(),
      shape: hasQuantityValuePairs ? "quantity-value-pairs" : "value-only-months",
      endIndex: end === -1 ? start + commodity.length + segment.length : end,
    };
  },

  adjustMonthlyTokensForMissingDecemberTotal(commodityName, numericTokens) {
    const expectedRows = this.activeMonthlyExpectedRowTotals || this.monthlyExpectedRowTotals;
    const expected = expectedRows[commodityName];
    if (expected === undefined && numericTokens.length === 12) {
      const firstElevenSum = numericTokens.slice(0, 11).reduce((sum, token) => sum + (Number(this.parseNumberOrNull(token)) || 0), 0);
      const possibleTotal = Number(this.parseNumberOrNull(numericTokens[11])) || 0;
      if (Math.abs(firstElevenSum - possibleTotal) <= 1) return [...numericTokens.slice(0, 11), "-", numericTokens[11]];
    }
    if (commodityName === "Crude Groundnuts Oil" && expected !== undefined && numericTokens.length === 12 && this.parseNumberOrNull(numericTokens[11]) === expected) {
      return [numericTokens[0], "-", ...numericTokens.slice(1)];
    }
    if (expected !== undefined && numericTokens.length === 12 && this.parseNumberOrNull(numericTokens[11]) === expected) {
      return [...numericTokens.slice(0, 11), "-", numericTokens[11]];
    }
    return numericTokens;
  },

  selectMonthlyRowTotalToken(commodityName, numericTokens, months, hasQuantityValuePairs) {
    const expectedRows = this.activeMonthlyExpectedRowTotals || this.monthlyExpectedRowTotals;
    const expected = expectedRows[commodityName];
    if (expected !== undefined) {
      const exact = numericTokens.find((token) => this.parseNumberOrNull(token) === expected);
      if (exact !== undefined) return exact;
    }
    const defaultToken = hasQuantityValuePairs ? numericTokens[24] : numericTokens[12];
    return defaultToken;
  },

  parseMonthlyCommodityRowFromMatch(text, match, nextIndex) {
    const commodity = match.commodityDef.name;
    const start = match.index;
    const end = nextIndex && nextIndex > start ? nextIndex : -1;
    const segment = this.scrubMonthlyRowFooterArtifacts(text.slice(start + match.alias.length, end === -1 ? undefined : end)).trim();
    const tokens = segment.match(/-|\d[\d,]*(?:\.\d+)?|[A-Za-z./"&()]+/g) || [];
    const numericTokens = this.stripMonthlyFooterNumericTokens(tokens.filter((token) => token === "-" || /^\d[\d,]*(?:\.\d+)?$/.test(token)));
    if (numericTokens.length < 12) return null;
    const firstNumericIndex = tokens.findIndex((token) => token === numericTokens[0]);
    const unitTokens = firstNumericIndex > -1 ? tokens.slice(0, firstNumericIndex) : [];
    const unit = this.cleanUnit(unitTokens.join(" "));
    const adjustedNumericTokens = this.adjustMonthlyTokensForMissingDecemberTotal(commodity, numericTokens);
    const hasQuantityValuePairs = adjustedNumericTokens.length >= 25;
    const months = this.monthlyExportMonths.map((month) => {
      const zeroIndex = month.monthNumber - 1;
      const quantityToken = hasQuantityValuePairs ? adjustedNumericTokens[zeroIndex * 2] : null;
      const valueToken = hasQuantityValuePairs ? adjustedNumericTokens[zeroIndex * 2 + 1] : adjustedNumericTokens[zeroIndex];
      return {
        monthNumber: month.monthNumber,
        monthLabel: month.monthLabel,
        quantity: unit === "Value" ? null : this.parseNumberOrNull(quantityToken),
        valueUsdThousand: this.parseNumberOrNull(valueToken),
      };
    });
    const totalToken = this.selectMonthlyRowTotalToken(commodity, adjustedNumericTokens, months, hasQuantityValuePairs);
    const rowTotalValueUsdThousand = this.parseNumberOrNull(totalToken);
    const monthlySumValueUsdThousand = months.reduce((sum, month) => sum + (Number(month.valueUsdThousand) || 0), 0);
    const rowTotalDifferenceValueUsdThousand = rowTotalValueUsdThousand === null ? null : monthlySumValueUsdThousand - rowTotalValueUsdThousand;
    const rowTotalMismatch = rowTotalDifferenceValueUsdThousand !== null && Math.abs(rowTotalDifferenceValueUsdThousand) > 1;
    return {
      commodityName: commodity,
      matchedAlias: match.alias,
      reconcileCommodityId: match.commodityDef.reconcileCommodityId || null,
      unit,
      months,
      rowTotalValueUsdThousand,
      monthlySumValueUsdThousand,
      rowTotalDifferenceValueUsdThousand,
      rowTotalMismatch,
      rawRowText: `${commodity} ${segment}`.trim(),
      shape: hasQuantityValuePairs ? "quantity-value-pairs" : "value-only-months",
      endIndex: end === -1 ? start + match.alias.length + segment.length : end,
    };
  },

  scrubMonthlyRowFooterArtifacts(segment) {
    return String(segment || "")
      .replace(/\b\d{1,3}\s+of\s+\d{1,3}\b/gi, " ")
      .replace(/\bpage\s+\d{1,3}\b/gi, " ")
      .replace(/\s+\b10\b\s*$/g, " ")
      .replace(/\s+/g, " ");
  },

  stripMonthlyFooterNumericTokens(numericTokens) {
    const cleaned = [...(numericTokens || [])];
    const removeTrailingFooter10 = (targetLength) => {
      while (cleaned.length > targetLength && cleaned[cleaned.length - 1] === "10") cleaned.pop();
    };
    if (cleaned.length > 25) removeTrailingFooter10(25);
    if (cleaned.length > 13) removeTrailingFooter10(13);
    return cleaned;
  },

  parseMonthlyTotalRow(text, fromIndex = 0, expectedTotal = this.expectedTotalValueUsdThousand, label = "Total") {
    const candidates = [];
    const searchLabel = label || "Total";
    const starts = [];
    let cursor = this.indexOfInsensitive(text, searchLabel, Math.max(0, fromIndex));
    while (cursor !== -1) {
      starts.push(cursor);
      cursor = this.indexOfInsensitive(text, searchLabel, cursor + searchLabel.length);
    }
    if (!starts.length && searchLabel !== "Total") {
      cursor = this.indexOfInsensitive(text, "Total", Math.max(0, fromIndex));
      while (cursor !== -1) {
        starts.push(cursor);
        cursor = this.indexOfInsensitive(text, "Total", cursor + 5);
      }
    }
    starts.forEach((start) => {
      const segment = text.slice(start, Math.min(text.length, start + 900));
      const tokens = segment.match(/-|\d[\d,]*(?:\.\d+)?|[A-Za-z./"&()]+/g) || [];
      const numericTokens = tokens.filter((token) => token === "-" || /^\d[\d,]*(?:\.\d+)?$/.test(token));
      if (numericTokens.length >= 13) {
        const monthlyValues = this.monthlyExportMonths.map((month, index) => ({
          monthNumber: month.monthNumber,
          monthLabel: month.monthLabel,
          valueUsdThousand: this.parseNumberOrNull(numericTokens[index]),
        }));
        const grandTotalValueUsdThousand = this.parseNumberOrNull(numericTokens[12]);
        const score = Math.max(0, 100000 - Math.abs((grandTotalValueUsdThousand || 0) - expectedTotal));
        candidates.push({ rawRowText: segment.trim(), numericTokens, monthlyValues, grandTotalValueUsdThousand, score });
      }
    });
    if (!candidates.length) return null;
    return candidates.sort((a, b) => b.score - a.score)[0];
  },

  validateMonthlyTableTotals(rows, totalRow) {
    if (!totalRow) return { status: "warning", notes: "No Total row parsed from monthly exports table." };
    const totalsByMonth = this.monthlyExportMonths.map((month) => {
      const extracted = rows.filter((row) => Number(row.month) === month.monthNumber).reduce((sum, row) => sum + (Number(row.valueUsdThousand) || 0), 0);
      const reported = totalRow.monthlyValues.find((item) => item.monthNumber === month.monthNumber)?.valueUsdThousand;
      const difference = reported === null || reported === undefined ? null : extracted - reported;
      return { monthNumber: month.monthNumber, monthLabel: month.monthLabel, extractedValueUsdThousand: extracted, reportedValueUsdThousand: reported, differenceValueUsdThousand: difference };
    });
    const extractedGrandTotal = rows.reduce((sum, row) => sum + (Number(row.valueUsdThousand) || 0), 0);
    const reportedGrandTotal = totalRow.grandTotalValueUsdThousand;
    const grandDifference = reportedGrandTotal === null || reportedGrandTotal === undefined ? null : extractedGrandTotal - reportedGrandTotal;
    const monthMismatch = totalsByMonth.some((item) => item.differenceValueUsdThousand !== null && Math.abs(item.differenceValueUsdThousand) > 1);
    const grandMismatch = grandDifference !== null && Math.abs(grandDifference) > 1;
    return {
      status: monthMismatch || grandMismatch ? "fail" : "pass",
      totalsByMonth,
      extractedGrandTotalValueUsdThousand: extractedGrandTotal,
      reportedGrandTotalValueUsdThousand: reportedGrandTotal,
      grandDifferenceValueUsdThousand: grandDifference,
    };
  },

  monthlyDraftDiagnosticsForRows(rows) {
    return {
      missingValueRows: rows.filter((row) => row.valueUsdThousand === null || row.valueUsdThousand === undefined).length,
      missingCommodityIdRows: rows.filter((row) => !row.commodityId).length,
      missingMonthRows: rows.filter((row) => !row.monthNumber && !row.month).length,
      unmappedCommodityRows: rows.filter((row) => row.commodityNormalizationStatus === "unmapped").length,
      unmappedCommodities: [...new Set(rows.filter((row) => row.commodityNormalizationStatus === "unmapped").map((row) => row.rawCommodityName || row.commodityName))],
    };
  },

  cleanImportsMonthlyCommodityName(name) {
    return String(name || "")
      .replace(/\bTable\s+No\.?.*$/i, "")
      .replace(/\bCont'?d\b/gi, "")
      .replace(/\bCommodity\b/gi, "")
      .replace(/\s+/g, " ")
      .trim()
      .replace(/^[.:\- ]+|[.:\- ]+$/g, "");
  },

  detectImportsMonthlyCategory(text, index) {
    const categories = [
      "Foodstuffs", "Beverages & Tobacco", "Raw Materials", "Chemicals",
      "Manufactured Goods", "Machinery & Equipments", "Transport Equipments", "Textiles",
    ].map((name) => ({ name, index: this.indexOfInsensitive(text, name) })).filter((item) => item.index !== -1 && item.index <= index);
    return categories.sort((a, b) => b.index - a.index)[0]?.name || "Unclassified";
  },

  importsMonthlySkipReason(name, categoryName) {
    const key = String(name || "").trim().toLowerCase();
    if (!key) return "skipped_header_or_noise";
    if (key === "total" || key === "grand total") return "skipped_total_row";
    if (key === "petroleum products") return "skipped_parent_subtotal_row";
    if (/^(foodstuffs|beverages\s*&\s*tobacco|raw materials|chemicals|manufactured goods|machinery\s*&\s*equipments|transport equipments|textiles)$/i.test(name)) return "skipped_header_or_noise";
    return "";
  },

  disambiguateImportsMonthlyCommodityName(name, categoryName) {
    const normalized = String(name || "").trim();
    if (/^others?$/i.test(normalized)) {
      if (categoryName === "Foodstuffs") return "Other - Foodstuffs";
      if (categoryName === "Beverages & Tobacco") return "Other - Beverages & Tobacco";
      if (categoryName === "Raw Materials" && this.isImportsMonthlyPetroleumComponent(normalized)) return "Other - Petroleum Products";
      if (categoryName === "Raw Materials") return "Other - Raw Materials";
      if (categoryName === "Chemicals") return "Other - Chemicals";
      if (categoryName === "Manufactured Goods") return "Other - Manufactured Goods";
      if (categoryName === "Machinery & Equipments") return "Other - Machinery & Equipments";
      if (categoryName === "Transport Equipments") return "Other - Transport Equipments";
      if (categoryName === "Textiles" && /^others$/i.test(normalized)) return "Other - Imports";
      if (categoryName === "Textiles") return "Other - Textiles";
      return "Other - Imports";
    }
    return normalized;
  },

  adjustImportsMonthlyTokensForMissingDecember(commodityName, numericTokens) {
    if (numericTokens.length !== 12) return numericTokens;
    if (/^knitted\s+or\s+crocheted\s+fabrics$/i.test(String(commodityName || "").trim())) {
      return [...numericTokens.slice(0, 9), "-", ...numericTokens.slice(9)];
    }
    const firstElevenSum = numericTokens.slice(0, 11).reduce((sum, token) => sum + (Number(this.parseNumberOrNull(token)) || 0), 0);
    const possibleTotal = Number(this.parseNumberOrNull(numericTokens[11])) || 0;
    if (Math.abs(firstElevenSum - possibleTotal) <= 1) return [...numericTokens.slice(0, 11), "-", numericTokens[11]];
    return numericTokens;
  },

  isImportsMonthlyPetroleumComponent(name) {
    return /^(jazolin|benzine|asphalt|butagas|lubricating oil|others)$/i.test(String(name || "").trim());
  },

  findRowEnd(text, fromIndex, nextCommodities = []) {
    const candidates = [
      ...nextCommodities.flatMap((commodity) => this.aliasesFor(commodity).map((alias) => this.indexOfInsensitive(text, alias, fromIndex))).filter((idx) => idx !== -1),
      this.indexOfInsensitive(text, "Total", fromIndex),
    ].filter((idx) => idx !== -1);
    return candidates.length ? Math.min(...candidates) : -1;
  },

  findMonthlyRowEnd(text, fromIndex, nextCommodities = []) {
    const candidates = nextCommodities
      .flatMap((commodity) => this.aliasesFor(commodity).map((alias) => this.indexOfInsensitive(text, alias, fromIndex)).filter((idx) => idx !== -1))
      .filter((idx) => idx !== -1);
    const totalIdx = this.indexOfInsensitive(text, "Total", fromIndex);
    if (totalIdx !== -1) candidates.push(totalIdx);
    return candidates.length ? Math.min(...candidates) : -1;
  },

  parseExpectedTotal(text) {
    const match = text.match(/Total\s+(\d[\d,]*)/i);
    return match ? this.parseNumberOrNull(match[1]) : null;
  },

  toDraftObservation(row, pageNumber, batch, sourceFile, index, options = {}) {
    const flow = options.flow || "export";
    const ruleId = options.ruleId || this.exportRuleId;
    const tableLabel = options.tableLabel || this.tableLabel;
    const idPrefix = options.idPrefix || "draftobs_2013_export_summary_";
    const rawCommodityName = row.rawCommodityName || row.commodityName;
    const commodity = window.SEO_SERVICES.commodity?.normalizeCommodityName(row.commodityName) || {
      status: "unmapped",
      rawCommodityName,
      commodityId: this.slug("cbos", row.commodityName),
      commodityName: row.commodityName,
      commodityCanonicalEnglishName: null,
      commodityCanonicalArabicName: null,
    };
    const observationYear = options.year || 2013;
    const publicationIssue = options.publicationIssue || {
      source: "CBOS Foreign Trade Statistical Digest",
      issueYear: observationYear,
      issuePeriod: "Q4",
      issueLabel: `Q4 ${observationYear}`,
    };
    const coveredEconomicPeriod = options.coveredEconomicPeriod || {
      year: observationYear,
      periodType: "annual",
      startMonth: 1,
      endMonth: 12,
      label: `Annual ${observationYear} Jan-Dec`,
    };
    return {
      id: idPrefix + (index + 1),
      reporterCountry: "SDN",
      partnerCountryId: null,
      flow,
      commodityId: commodity.commodityId || this.slug("cbos", row.commodityName),
      commodityName: commodity.commodityName || row.commodityName,
      reconcileCommodityId: row.reconcileCommodityId || commodity.commodityId || this.slug("cbos", row.commodityName),
      rawCommodityName,
      commodityCanonicalEnglishName: commodity.commodityCanonicalEnglishName,
      commodityCanonicalArabicName: commodity.commodityCanonicalArabicName,
      commodityNormalizationStatus: commodity.status,
      countryName: null,
      region: null,
      year: observationYear,
      month: options.month ?? null,
      monthNumber: options.monthNumber ?? options.month ?? null,
      monthLabel: options.monthLabel || null,
      quarter: options.quarter ?? null,
      periodType: options.periodType || "annual",
      publicationIssue,
      coveredEconomicPeriod,
      valueUsd: row.valueUsdThousand === null ? null : row.valueUsdThousand * 1000,
      valueUsdThousand: row.valueUsdThousand,
      quantity: row.quantity,
      unit: row.unit,
      sourceFileId: sourceFile?.id || batch.sourceFileId,
      importBatchId: batch.id,
      sourcePageNumber: pageNumber,
      sourceTableLabel: tableLabel,
      rawRowText: row.rawRowText,
      sourceRowTotalValueUsdThousand: row.rowTotalValueUsdThousand ?? null,
      sourceRowMonthlySumValueUsdThousand: row.monthlySumValueUsdThousand ?? null,
      sourceRowTotalDifferenceValueUsdThousand: row.rowTotalDifferenceValueUsdThousand ?? null,
      rowTotalMismatch: row.rowTotalMismatch || false,
      extractionRuleId: ruleId,
      extractionVersion: options.extractionVersion || this.extractionVersion,
      extractionConfidence: 0.85,
      reviewStatus: "pending",
      isPublished: false,
    };
  },

  cleanUnit(unit) {
    const cleaned = (unit || "").replace(/^"$/, "M.T.").trim();
    return cleaned || null;
  },

  parseNumberOrNull(value) {
    if (!value || value === "-") return null;
    return Number(String(value).replace(/,/g, ""));
  },

  aliasesFor(commodityDef) {
    if (!commodityDef) return [];
    if (typeof commodityDef === "string") return [commodityDef];
    return [commodityDef.name, ...(commodityDef.aliases || [])].filter(Boolean);
  },

  findMonthlyCommodityMatches(text) {
    const candidates = [];
    this.monthlyExportCommodities.forEach((commodityDef) => {
      this.aliasesFor(commodityDef).forEach((alias) => {
        let index = this.indexOfInsensitive(text, alias, 0);
        while (index !== -1) {
          if (this.isMonthlyCommodityMatch(text, index, alias)) candidates.push({ commodityDef, alias, index });
          index = this.indexOfInsensitive(text, alias, index + alias.length);
        }
      });
    });
    const nonOverlapping = candidates
      .sort((a, b) => a.index - b.index || b.alias.length - a.alias.length)
      .filter((match, index, arr) => {
        const previous = arr[index - 1];
        if (!previous) return true;
        const overlaps = match.index < previous.index + previous.alias.length;
        if (overlaps) return false;
        return match.index !== previous.index || match.commodityDef.name !== previous.commodityDef.name;
      });
    const bestByCommodity = new Map();
    nonOverlapping.forEach((match, index) => {
      const key = match.commodityDef.name;
      const nextIndex = nonOverlapping[index + 1]?.index ?? this.indexOfInsensitive(text, "Total", match.index + match.alias.length);
      const row = this.parseMonthlyCommodityRowFromMatch(text, match, nextIndex);
      const score = this.scoreMonthlyMatchCandidate(row, match);
      const existing = bestByCommodity.get(key);
      if (!existing || score > existing.score) bestByCommodity.set(key, { ...match, score });
    });
    return [...bestByCommodity.values()].sort((a, b) => a.index - b.index);
  },

  scoreMonthlyMatchCandidate(row, match) {
    if (!row) return -1;
    let score = 0;
    const expected = this.monthlyExpectedRowTotals[match.commodityDef.name]
      || this.monthlyExpectedRowTotals[match.commodityDef.name === "Gum Hashab" ? "gum_hashab" : match.commodityDef.name === "Gum Taleh" ? "gum_taleh" : (match.commodityDef.reconcileCommodityId || "")];
    if (expected && row.rowTotalValueUsdThousand !== null && row.rowTotalValueUsdThousand !== undefined) {
      const diff = Math.abs(row.rowTotalValueUsdThousand - expected);
      score += Math.max(0, 20000 - diff);
    }
    if (row.rowTotalValueUsdThousand !== null && row.rowTotalValueUsdThousand !== undefined) score += 1000;
    if (!row.rowTotalMismatch) score += 10000;
    if (row.months.every((month) => month.valueUsdThousand !== undefined)) score += 100;
    score += Math.min(500, Math.abs(Number(row.monthlySumValueUsdThousand || 0)) / 1000);
    score += match.index / 1000000;
    return score;
  },

  monthlyRowDiagnostic(match, row, status) {
    if (!row) return {
      commodityName: match.commodityDef.name,
      matchedAlias: match.alias,
      status,
      reason: status === "skipped_bad_month_count" ? "Candidate did not expose at least 12 numeric monthly fields." : "",
    };
    return {
      commodityName: row.commodityName,
      matchedAlias: row.matchedAlias,
      status: row.rowTotalMismatch ? "row_total_mismatch" : status,
      rowTotalValueUsdThousand: row.rowTotalValueUsdThousand,
      monthlySumValueUsdThousand: row.monthlySumValueUsdThousand,
      differenceValueUsdThousand: row.rowTotalDifferenceValueUsdThousand,
      reason: row.rowTotalMismatch ? "Monthly values do not reconcile to the row Total column." : "",
    };
  },

  buildMonthlyExpectedChecklist(rows, diagnostics) {
    return this.monthlyExpectedChecklist.map((name) => {
      const parsed = rows.find((row) => row.commodityName === name);
      const diagnostic = diagnostics.find((item) => item.commodityName === name);
      return {
        commodityName: name,
        status: parsed ? "parsed" : diagnostic?.status || "missing",
        rowTotalMismatch: parsed?.rowTotalMismatch || false,
        monthlySumValueUsdThousand: parsed?.monthlySumValueUsdThousand ?? null,
        rowTotalValueUsdThousand: parsed?.rowTotalValueUsdThousand ?? null,
      };
    });
  },

  buildMonthlyRowReconciliationDiagnostics(parsedRows, generatedRows, diagnostics = []) {
    const generatedByCommodity = new Map();
    generatedRows.forEach((row) => {
      const key = row.rawCommodityName || row.commodityName;
      const current = generatedByCommodity.get(key) || {
        generatedMonthlySumValueUsdThousand: 0,
        generatedRowCount: 0,
      };
      current.generatedMonthlySumValueUsdThousand += Number(row.valueUsdThousand) || 0;
      current.generatedRowCount += 1;
      generatedByCommodity.set(key, current);
    });

    return parsedRows
      .map((row) => {
        const generated = generatedByCommodity.get(row.commodityName) || {
          generatedMonthlySumValueUsdThousand: 0,
          generatedRowCount: 0,
        };
        const diagnostic = diagnostics.find((item) => item.commodityName === row.commodityName) || {};
        const generatedDifference = generated.generatedMonthlySumValueUsdThousand - (row.rowTotalValueUsdThousand || 0);
        return {
          commodityName: row.commodityName,
          rawLine: row.rawRowText,
          monthlyValues: row.months.map((month) => month.valueUsdThousand),
          computedMonthlySumValueUsdThousand: row.monthlySumValueUsdThousand,
          extractedRowTotalValueUsdThousand: row.rowTotalValueUsdThousand,
          differenceValueUsdThousand: row.rowTotalDifferenceValueUsdThousand || 0,
          generatedMonthlySumValueUsdThousand: generated.generatedMonthlySumValueUsdThousand,
          generatedRowCount: generated.generatedRowCount,
          generatedDifferenceValueUsdThousand: generatedDifference,
          parseStatus: diagnostic.status || (row.rowTotalMismatch ? "row_total_mismatch" : "parsed"),
        };
      })
      .sort((a, b) => {
        const aDiff = Math.max(Math.abs(a.differenceValueUsdThousand || 0), Math.abs(a.generatedDifferenceValueUsdThousand || 0));
        const bDiff = Math.max(Math.abs(b.differenceValueUsdThousand || 0), Math.abs(b.generatedDifferenceValueUsdThousand || 0));
        return bDiff - aDiff;
      });
  },

  isMonthlyCommodityMatch(text, index, alias) {
    const before = text[index - 1] || " ";
    const after = text[index + alias.length] || " ";
    const boundaryBefore = !/[A-Za-z0-9&/]/.test(before);
    const boundaryAfter = !/[A-Za-z0-9&/]/.test(after);
    if (alias === "Camels" && /Crossbred\s*$/i.test(text.slice(Math.max(0, index - 14), index))) return false;
    return boundaryBefore && boundaryAfter;
  },

  findFirstAliasIndex(text, commodityDef, fromIndex = 0) {
    const matches = this.aliasesFor(commodityDef)
      .map((alias) => ({ alias, index: this.indexOfInsensitive(text, alias, fromIndex) }))
      .filter((item) => item.index !== -1)
      .sort((a, b) => a.index - b.index || b.alias.length - a.alias.length);
    return matches.length ? matches[0].index : -1;
  },

  findMatchedAlias(text, commodityDef, fromIndex = 0) {
    return this.aliasesFor(commodityDef)
      .filter((alias) => this.indexOfInsensitive(text, alias, fromIndex) === fromIndex)
      .sort((a, b) => b.length - a.length)[0] || null;
  },

  findMonthlyDuplicateKeys(rows) {
    const counts = new Map();
    rows.forEach((row) => {
      const key = [row.year, row.flow, row.periodType, row.month, row.commodityId || row.commodityName].join("|");
      counts.set(key, (counts.get(key) || 0) + 1);
    });
    return [...counts.entries()].filter(([, count]) => count > 1).map(([key]) => key);
  },

  indexOfInsensitive(text, needle, fromIndex = 0) {
    return text.toLowerCase().indexOf(String(needle).toLowerCase(), fromIndex);
  },

  slug(prefix, value) {
    return prefix + "_" + String(value || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  },
};
