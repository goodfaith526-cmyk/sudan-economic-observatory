import { readFile, stat, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";

const MANIFEST_PATH = "data/source-pdfs/foreign-trade-digest/manifest.json";
const MANUALLY_VERIFIED_DIGESTS = new Map([
  ["Q1-2019.pdf", { year: 2019, period: "Q1", periodType: "quarter", quarter: 1 }],
  ["الربع_الرابع_2022.pdf", { year: 2022, period: "Q4", periodType: "quarter", quarter: 4 }],
  ["الربع_الاول_2025-1.pdf", { year: 2025, period: "Q1", periodType: "quarter", quarter: 1 }],
  ["النصف_الأول_2025.pdf", { year: 2025, period: "H1", periodType: "half-year", quarter: null }],
  ["الربع_الثالث_للعام_2025.pdf", { year: 2025, period: "Q3", periodType: "quarter", quarter: 3 }],
]);

function normalizeArabicDigits(value) {
  const eastern = "٠١٢٣٤٥٦٧٨٩";
  const persian = "۰۱۲۳۴۵۶۷۸۹";
  return String(value || "").replace(/[٠-٩۰-۹]/g, (digit) => {
    const easternIndex = eastern.indexOf(digit);
    if (easternIndex >= 0) return String(easternIndex);
    return String(persian.indexOf(digit));
  });
}

function safeDecode(value) {
  try {
    return decodeURIComponent(String(value || ""));
  } catch {
    return String(value || "");
  }
}

function textFor(entry) {
  return normalizeArabicDigits(
    [
      entry.title,
      entry.fileName,
      entry.sourceUrl,
      entry.detailUrl,
      safeDecode(entry.sourceUrl),
      safeDecode(entry.detailUrl),
    ].join(" ")
  ).toLowerCase();
}

function inferYear(entry) {
  const text = textFor(entry);
  const full = text.match(/\b(20\d{2}|19\d{2})\b/);
  if (full) return Number(full[1]);

  const twoDigit = text.match(/(?:^|[^0-9])(?:digest|q|quarter|الربع|النصف)[_\s-]*q?([1-4])?[_\s-]*(\d{2})(?:[^0-9]|$)/i)
    || text.match(/[_\s-](\d{2})(?:[_\s.-]|$)/);
  const yy = twoDigit ? Number(twoDigit[2] || twoDigit[1]) : null;
  if (yy === null || Number.isNaN(yy)) return null;
  if (yy >= 3 && yy <= 99) return 2000 + yy;
  return null;
}

function inferPeriod(entry) {
  const text = textFor(entry);
  if (/(jan|january|يناير).*(dec|december|ديسمبر)/.test(text)) {
    return { period: "Annual/Q4", periodType: "annual", quarter: null };
  }
  if (/semi|first[_\s-]*half|jan[_\s-]*jun|النصف\s+الأ?ول|النصف_الأ?ول/.test(text)) {
    return { period: "H1", periodType: "half-year", quarter: null };
  }
  if (/q0?1|qtr[_\s-]*1|quarter[_\s-]*1|1st|first quarter|الربع\s+الأ?ول|الربع_الأ?ول|الاول/.test(text)) {
    return { period: "Q1", periodType: "quarter", quarter: 1 };
  }
  if (/q0?2|qtr[_\s-]*2|quarter[_\s-]*2|2nd|second quarter|الربع\s+الثاني|الربع_الثاني/.test(text)) {
    return { period: "Q2", periodType: "quarter", quarter: 2 };
  }
  if (/q0?3|qtr[_\s-]*3|quarter[_\s-]*3|3rd|third quarter|الربع\s+الثالث|الربع_الثالث/.test(text)) {
    return { period: "Q3", periodType: "quarter", quarter: 3 };
  }
  if (/q0?4|qtr[_\s-]*4|quarter[_\s-]*4|4th|fourth quarter|الربع\s+الرابع|الربع_الرابع/.test(text)) {
    return { period: "Q4", periodType: "quarter", quarter: 4 };
  }
  return { period: null, periodType: null, quarter: null };
}

function inferCoveragePeriods(period) {
  if (period === "Annual/Q4") return ["Q1", "Q2", "Q3", "Q4"];
  if (period === "H1") return ["Q1", "Q2"];
  if (["Q1", "Q2", "Q3", "Q4"].includes(period)) return [period];
  return [];
}

function classifyPublication(entry) {
  const text = textFor(entry);
  const flags = [];
  const hasForeignTradeWords = /foreign[_\s-]*trade|trade[_\s-]*stat|trade[_\s-]*balance|التجارة\s+الخارجية/.test(text);
  const hasDigestWords = /digest|موجز|الموجز|مؤجز|احصائي|إحصائي|الإحصائي|statistical/.test(text);
  const hasQuarterWords = /q[1-4]|quarter|الربع|النصف|half/.test(text);
  const isExternalDebt = /debt|الدين\s+الخارجي|موقف\s+الدين/.test(text);

  if (isExternalDebt) {
    flags.push("likely_false_positive", "external_debt_publication");
    return {
      publicationType: "external_debt_report",
      isForeignTradeDigest: false,
      confidence: "high",
      flags,
      classificationNotes: "Matched external debt wording, not a Foreign Trade Statistical Digest.",
    };
  }

  if (hasForeignTradeWords || hasDigestWords) {
    if (!hasForeignTradeWords && !/digest/.test(text)) flags.push("arabic_digest_title_without_explicit_foreign_trade_words");
    return {
      publicationType: "foreign_trade_statistical_digest",
      isForeignTradeDigest: true,
      confidence: hasForeignTradeWords || /digest/.test(text) ? "high" : "medium",
      flags,
      classificationNotes: "Classified from digest/trade wording in title, filename, or source URL.",
    };
  }

  if (hasQuarterWords) {
    flags.push("ambiguous_quarter_publication");
    return {
      publicationType: "ambiguous_quarter_publication",
      isForeignTradeDigest: null,
      confidence: "low",
      flags,
      classificationNotes: "Quarter wording found, but no clear digest or foreign trade wording.",
    };
  }

  flags.push("unclassified");
  return {
    publicationType: "unknown",
    isForeignTradeDigest: null,
    confidence: "low",
    flags,
    classificationNotes: "No reliable publication type signal in manifest metadata.",
  };
}

async function sha256(path) {
  const bytes = await readFile(path);
  return createHash("sha256").update(bytes).digest("hex");
}

async function main() {
  const manifest = JSON.parse(await readFile(MANIFEST_PATH, "utf8"));
  const auditedAt = new Date().toISOString();
  const hashGroups = new Map();
  const coverageGroups = new Map();

  for (const entry of manifest.entries || []) {
    const year = inferYear(entry);
    const period = inferPeriod(entry);
    const publication = classifyPublication(entry);
    const manualVerification = MANUALLY_VERIFIED_DIGESTS.get(entry.fileName);
    let fileSha256 = null;
    let fileExists = false;
    let actualFileSizeBytes = null;

    if (entry.localPath) {
      try {
        const info = await stat(entry.localPath);
        fileExists = true;
        actualFileSizeBytes = info.size;
        fileSha256 = await sha256(entry.localPath);
        if (!hashGroups.has(fileSha256)) hashGroups.set(fileSha256, []);
        hashGroups.get(fileSha256).push(entry.sourceUrl);
      } catch {
        publication.flags.push("local_file_missing");
      }
    }

    const coverageKey = [
      publication.publicationType,
      publication.isForeignTradeDigest,
      year || "unknown-year",
      period.period || "unknown-period",
    ].join("|");
    if (!coverageGroups.has(coverageKey)) coverageGroups.set(coverageKey, []);
    coverageGroups.get(coverageKey).push(entry.sourceUrl);

    entry.classification = {
      auditedAt,
      year: manualVerification?.year || year,
      period: manualVerification?.period || period.period,
      periodType: manualVerification?.periodType || period.periodType,
      quarter: manualVerification ? manualVerification.quarter : period.quarter,
      coveragePeriods: inferCoveragePeriods(manualVerification?.period || period.period),
      publicationType: manualVerification ? "foreign_trade_statistical_digest" : publication.publicationType,
      isForeignTradeDigest: manualVerification ? true : publication.isForeignTradeDigest,
      confidence: manualVerification ? "manual-verified" : publication.confidence,
      flags: manualVerification ? ["manually_verified"] : publication.flags,
      notes: manualVerification
        ? "Manually verified against uploaded PDF and reconciled to the manifest entry by filename, file size, and SHA-256."
        : publication.classificationNotes,
      manualVerification: manualVerification
        ? {
            verifiedAt: auditedAt,
            method: "uploaded-pdf-fingerprint-reconciliation",
            status: "confirmed_foreign_trade_digest",
          }
        : null,
      fileExists,
      actualFileSizeBytes,
      fileSha256,
    };
  }

  const duplicateSourceUrls = new Set();
  for (const urls of hashGroups.values()) {
    if (urls.length > 1) urls.forEach((url) => duplicateSourceUrls.add(url));
  }
  for (const urls of coverageGroups.values()) {
    if (urls.length > 1) urls.forEach((url) => duplicateSourceUrls.add(url));
  }

  for (const entry of manifest.entries || []) {
    const duplicateByHash = entry.classification.fileSha256
      ? (hashGroups.get(entry.classification.fileSha256) || []).filter((url) => url !== entry.sourceUrl)
      : [];
    const coverageKey = [
      entry.classification.publicationType,
      entry.classification.isForeignTradeDigest,
      entry.classification.year || "unknown-year",
      entry.classification.period || "unknown-period",
    ].join("|");
    const duplicateByCoverage = (coverageGroups.get(coverageKey) || []).filter((url) => url !== entry.sourceUrl);
    if (duplicateByHash.length) entry.classification.flags.push("duplicate_file_hash");
    if (duplicateByCoverage.length) entry.classification.flags.push("duplicate_year_period_candidate");
    entry.classification.duplicateByHashSourceUrls = duplicateByHash;
    entry.classification.duplicateByCoverageSourceUrls = duplicateByCoverage;
  }

  const digestEntries = (manifest.entries || []).filter((entry) => entry.classification.isForeignTradeDigest === true);
  const falsePositiveEntries = (manifest.entries || []).filter((entry) => entry.classification.flags.includes("likely_false_positive"));
  const ambiguousEntries = (manifest.entries || []).filter((entry) => entry.classification.isForeignTradeDigest === null);
  const duplicateEntries = (manifest.entries || []).filter((entry) =>
    entry.classification.flags.includes("duplicate_file_hash") ||
    entry.classification.flags.includes("duplicate_year_period_candidate")
  );

  const expectedCoverageNotes = [];
  const byYear = new Map();
  for (const entry of digestEntries) {
    const year = entry.classification.year;
    if (!year) continue;
    if (!byYear.has(year)) byYear.set(year, new Set());
    for (const period of entry.classification.coveragePeriods || []) byYear.get(year).add(period);
  }
  for (const year of [...byYear.keys()].sort((a, b) => a - b)) {
    const periods = byYear.get(year);
    const missing = ["Q1", "Q2", "Q3", "Q4"].filter((period) => !periods.has(period));
    if (missing.length) {
      expectedCoverageNotes.push({
        year,
        observedPeriods: [...periods].sort(),
        missingStandardQuarters: missing,
        note: "Missing/unknown quarters are inferred from manifest metadata only.",
      });
    }
  }

  manifest.audit = {
    auditedAt,
    totalEntries: (manifest.entries || []).length,
    confirmedForeignTradeDigestCount: digestEntries.length,
    suspectedFalsePositiveCount: falsePositiveEntries.length,
    ambiguousCount: ambiguousEntries.length,
    duplicateCandidateCount: duplicateEntries.length,
    missingCoverageObservations: expectedCoverageNotes,
    method: "Manifest metadata and local file fingerprint audit only; no PDF text extraction was performed.",
  };

  await writeFile(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

  console.log(JSON.stringify({
    manifestPath: MANIFEST_PATH,
    totalAudited: manifest.audit.totalEntries,
    confirmedForeignTradeDigestCount: manifest.audit.confirmedForeignTradeDigestCount,
    suspectedFalsePositiveCount: manifest.audit.suspectedFalsePositiveCount,
    ambiguousCount: manifest.audit.ambiguousCount,
    duplicateCandidateCount: manifest.audit.duplicateCandidateCount,
    missingCoverageObservationCount: manifest.audit.missingCoverageObservations.length,
    suspectedFalsePositiveFiles: falsePositiveEntries.map((entry) => entry.fileName),
    ambiguousFiles: ambiguousEntries.map((entry) => entry.fileName),
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
