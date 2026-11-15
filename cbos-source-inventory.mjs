import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { createWriteStream } from "node:fs";
import { basename, join, relative } from "node:path";
import { pipeline } from "node:stream/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const SOURCE_PAGE = "https://cbos.gov.sd/ar/periodicals-publications?field_publication_type_tid_i18n=48";
const SOURCE_HOST = "cbos.gov.sd";
const OUT_DIR = join("data", "source-pdfs", "foreign-trade-digest");
const MANIFEST_PATH = join(OUT_DIR, "manifest.json");
const MANUAL_URLS_PATH = join(OUT_DIR, "manual-urls.txt");

const args = new Set(process.argv.slice(2));
const force = args.has("--force");
const discoverOnly = args.has("--discover-only");
const useManualUrls = args.has("--manual");
const execFileAsync = promisify(execFile);
const events = [];

function logEvent(level, message, meta = {}) {
  const entry = { at: new Date().toISOString(), level, message, ...meta };
  events.push(entry);
  console.error(JSON.stringify(entry));
}

function absoluteUrl(href, baseUrl) {
  try {
    return new URL(href, baseUrl).toString();
  } catch {
    return null;
  }
}

function isCbosUrl(url) {
  try {
    return new URL(url).hostname === SOURCE_HOST;
  } catch {
    return false;
  }
}

function isPdfLike(url) {
  try {
    return /\.pdf(?:$|[?#])/i.test(new URL(url).pathname);
  } catch {
    return false;
  }
}

function isDigestLike(entry) {
  const text = `${entry.sourceUrl || ""} ${entry.title || ""} ${entry.detailUrl || ""}`.toLowerCase();
  return /digest|foreign[_ -]?trade[_ -]?stat|trade[_ -]?balance|q[1-4]|quarter|first[_ -]?half|half|موجز|الموجز|الربع|النصف|التجارة\s+الخارجية/.test(text);
}

function psQuote(value) {
  return `'${String(value).replace(/'/g, "''")}'`;
}

function extractLinks(html, baseUrl) {
  const links = [];
  const re = /<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let match;
  while ((match = re.exec(html))) {
    const url = absoluteUrl(match[1], baseUrl);
    if (!url || !isCbosUrl(url)) continue;
    const title = cleanText(match[2]);
    links.push({ url, title });
  }
  return links;
}

function cleanText(value) {
  return String(value || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function inferYear(...values) {
  const haystack = values.join(" ");
  return haystack.match(/20\d{2}/)?.[0] || haystack.match(/19\d{2}/)?.[0] || null;
}

function inferPeriod(...values) {
  const haystack = values.join(" ").toLowerCase();
  if (/(4th|fourth|q4|quarter[_ -]?4)/.test(haystack)) return "Q4";
  if (/(3rd|third|q3|quarter[_ -]?3)/.test(haystack)) return "Q3";
  if (/(2nd|second|q2|quarter[_ -]?2|jan\s*-\s*jun|first-half)/.test(haystack)) return "Q2/H1";
  if (/(1st|first|q1|quarter[_ -]?1)/.test(haystack)) return "Q1";
  if (/(jan|january).*(dec|december)|q4|annual/.test(haystack)) return "Annual/Q4";
  return null;
}

function safeFileName(url, title) {
  const urlName = decodeURIComponent(basename(new URL(url).pathname) || "digest.pdf");
  const hasPdfName = /\.pdf$/i.test(urlName);
  const base = hasPdfName ? urlName : `${title || "foreign-trade-digest"}.pdf`;
  return base.replace(/[<>:"/\\|?*\x00-\x1f]+/g, "_").replace(/\s+/g, "_");
}

async function fetchText(url) {
  try {
    const res = await fetch(url, { headers: { "user-agent": "SudanEconomicObservatory/PhaseC1" } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.text();
  } catch (error) {
    logEvent("warn", "Node fetch failed; attempting PowerShell fallback", { url, error: error.message });
    if (process.platform !== "win32") throw error;
    const { stdout } = await execFileAsync("powershell", [
      "-NoProfile",
      "-Command",
      `[Net.ServicePointManager]::SecurityProtocol=[Net.SecurityProtocolType]::Tls12; (Invoke-WebRequest -UseBasicParsing -Uri ${psQuote(url)}).Content`,
    ], { maxBuffer: 20 * 1024 * 1024 });
    logEvent("info", "PowerShell fallback fetched text", { url, bytes: stdout.length });
    return stdout;
  }
}

async function loadManifest() {
  try {
    return JSON.parse(await readFile(MANIFEST_PATH, "utf8"));
  } catch {
    return { sourcePage: SOURCE_PAGE, generatedAt: null, entries: [] };
  }
}

async function saveManifest(manifest) {
  manifest.generatedAt = new Date().toISOString();
  await writeFile(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
}

async function discoverPdfEntries() {
  const listingHtml = await fetchText(SOURCE_PAGE);
  const listingLinks = extractLinks(listingHtml, SOURCE_PAGE);
  const detailLinks = listingLinks.filter((link) => !isPdfLike(link.url) && /foreign-trade-statistical-digest|periodicals-publications|\/node\/|\/en\/|\/ar\//i.test(link.url));
  const candidates = new Map();

  for (const link of listingLinks.filter((item) => isPdfLike(item.url))) {
    candidates.set(link.url, { sourceUrl: link.url, title: link.title || safeFileName(link.url, ""), detailUrl: SOURCE_PAGE });
  }

  for (const detail of detailLinks) {
    try {
      const html = await fetchText(detail.url);
      const pdfLinks = extractLinks(html, detail.url).filter((item) => isPdfLike(item.url));
      for (const pdf of pdfLinks) {
        if (!candidates.has(pdf.url)) {
          candidates.set(pdf.url, {
            sourceUrl: pdf.url,
            title: detail.title || pdf.title || safeFileName(pdf.url, ""),
            detailUrl: detail.url,
          });
        }
      }
    } catch (error) {
      candidates.set(`failed-detail:${detail.url}`, {
        sourceUrl: detail.url,
        title: detail.title,
        detailUrl: detail.url,
        status: "failed",
        notes: `Detail page fetch failed: ${error.message}`,
      });
    }
  }

  return [...candidates.values()].filter((entry) => entry.status === "failed" || (isPdfLike(entry.sourceUrl) && isDigestLike(entry)));
}

async function readManualUrlEntries() {
  let content = "";
  try {
    content = await readFile(MANUAL_URLS_PATH, "utf8");
  } catch {
    return [];
  }
  return content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"))
    .map((url) => {
      const validDomain = isCbosUrl(url);
      const validPdf = isPdfLike(url);
      return {
        sourceMode: "manual-url",
        sourceUrl: url,
        title: safeFileName(validDomain ? url : SOURCE_PAGE, "").replace(/\.pdf$/i, ""),
        detailUrl: null,
        status: validDomain && validPdf ? "pending" : "failed",
        notes: validDomain && validPdf ? "" : "Rejected manual URL: URL must be from cbos.gov.sd and look like a PDF",
      };
    });
}

async function downloadFile(entry, filePath) {
  try {
    const res = await fetch(entry.sourceUrl, { headers: { "user-agent": "SudanEconomicObservatory/PhaseC1" } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const contentType = res.headers.get("content-type") || "";
    if (!/pdf|octet-stream/i.test(contentType) && !isPdfLike(entry.sourceUrl)) throw new Error(`Unexpected content-type: ${contentType}`);
    await pipeline(res.body, createWriteStream(filePath));
  } catch (error) {
    logEvent("warn", "Node PDF download failed; attempting PowerShell fallback", { url: entry.sourceUrl, error: error.message });
    if (process.platform !== "win32") throw error;
    await execFileAsync("powershell", [
      "-NoProfile",
      "-Command",
      `[Net.ServicePointManager]::SecurityProtocol=[Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -UseBasicParsing -Uri ${psQuote(entry.sourceUrl)} -OutFile ${psQuote(filePath)}`,
    ], { maxBuffer: 1024 * 1024 });
  }
  const info = await stat(filePath);
  logEvent("info", "Downloaded PDF", { url: entry.sourceUrl, filePath, fileSizeBytes: info.size });
  return info.size;
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const manifest = await loadManifest();
  manifest.sourcePage = SOURCE_PAGE;
  manifest.entries = manifest.entries.filter((entry) => entry.status !== "failed" && isDigestLike(entry));
  const existingUrls = new Set(manifest.entries.map((entry) => entry.sourceUrl));
  const existingNames = new Set(manifest.entries.map((entry) => entry.fileName).filter(Boolean));
  let discovered = [];
  let downloaded = 0;
  let skipped = 0;
  const failed = [];

  try {
    discovered = await discoverPdfEntries();
  } catch (error) {
    failed.push({
      title: "Foreign Trade Statistical Digest source page",
      year: null,
      period: null,
      sourceUrl: SOURCE_PAGE,
      localPath: null,
      fileName: null,
      downloadedAt: new Date().toISOString(),
      fileSizeBytes: null,
      status: "failed",
      notes: `Source discovery failed: ${error.message}`,
    });
  }

  const manualEntries = useManualUrls ? await readManualUrlEntries() : [];
  const manualFailed = manualEntries.filter((entry) => entry.status === "failed");
  failed.push(...manualFailed);
  const combined = [
    ...discovered,
    ...manualEntries.filter((entry) => entry.status !== "failed"),
  ];
  const uniqueEntries = new Map();
  combined.forEach((entry) => {
    if (!uniqueEntries.has(entry.sourceUrl)) uniqueEntries.set(entry.sourceUrl, entry);
  });

  for (const item of uniqueEntries.values()) {
    if (item.status === "failed") {
      failed.push(item);
      continue;
    }
    if (!isCbosUrl(item.sourceUrl) || !isPdfLike(item.sourceUrl)) {
      failed.push({ ...item, status: "failed", notes: "Rejected: non-CBOS or non-PDF URL" });
      continue;
    }
    const fileName = safeFileName(item.sourceUrl, item.title);
    const localPath = join(OUT_DIR, fileName);
    const duplicateUrl = existingUrls.has(item.sourceUrl);
    const duplicateName = existingNames.has(fileName);
    let localExists = false;
    let localSize = null;
    try {
      const existingInfo = await stat(localPath);
      localExists = true;
      localSize = existingInfo.size;
    } catch {}
    if (!force && (duplicateUrl || duplicateName)) {
      skipped += 1;
      logEvent("info", "Skipped duplicate PDF", { url: item.sourceUrl, fileName, duplicateUrl, duplicateName });
      continue;
    }
    if (!force && localExists && localSize > 0) {
      const entry = {
        title: item.title || fileName,
        year: inferYear(item.title, item.sourceUrl),
        period: inferPeriod(item.title, item.sourceUrl),
        sourceMode: item.sourceMode || "auto-discovery",
        sourceUrl: item.sourceUrl,
        detailUrl: item.detailUrl,
        localPath: relative(".", localPath).replace(/\\/g, "/"),
        fileName,
        downloadedAt: new Date().toISOString(),
        fileSizeBytes: localSize,
        status: "downloaded",
        notes: "Existing local file registered in manifest without re-downloading",
      };
      manifest.entries.push(entry);
      existingUrls.add(item.sourceUrl);
      existingNames.add(fileName);
      skipped += 1;
      logEvent("info", "Registered existing local PDF", { url: item.sourceUrl, fileName, fileSizeBytes: localSize });
      continue;
    }
    if (discoverOnly) {
      skipped += 1;
      continue;
    }
    try {
      const size = await downloadFile(item, localPath);
      const entry = {
        title: item.title || fileName,
        year: inferYear(item.title, item.sourceUrl),
        period: inferPeriod(item.title, item.sourceUrl),
        sourceMode: item.sourceMode || "auto-discovery",
        sourceUrl: item.sourceUrl,
        detailUrl: item.detailUrl,
        localPath: relative(".", localPath).replace(/\\/g, "/"),
        fileName,
        downloadedAt: new Date().toISOString(),
        fileSizeBytes: size,
        status: "downloaded",
        notes: item.sourceMode === "manual-url" ? "Downloaded from manually provided CBOS PDF URL" : "",
      };
      manifest.entries = manifest.entries.filter((old) => force ? old.sourceUrl !== item.sourceUrl && old.fileName !== fileName : true);
      manifest.entries.push(entry);
      existingUrls.add(item.sourceUrl);
      existingNames.add(fileName);
      downloaded += 1;
    } catch (error) {
      logEvent("error", "PDF download failed", { url: item.sourceUrl, error: error.message });
      failed.push({
        title: item.title || fileName,
        year: inferYear(item.title, item.sourceUrl),
        period: inferPeriod(item.title, item.sourceUrl),
        sourceMode: item.sourceMode || "auto-discovery",
        sourceUrl: item.sourceUrl,
        detailUrl: item.detailUrl,
        localPath: relative(".", localPath).replace(/\\/g, "/"),
        fileName,
        downloadedAt: new Date().toISOString(),
        fileSizeBytes: null,
        status: "failed",
        notes: error.message,
      });
    }
  }

  if (failed.length) {
    for (const failedEntry of failed) {
      manifest.entries = manifest.entries.filter((old) => !(old.sourceUrl === failedEntry.sourceUrl && old.status === "failed"));
      manifest.entries.push(failedEntry);
    }
  }
  await saveManifest(manifest);

  const summary = {
    sourcePage: SOURCE_PAGE,
    discoveredPdfLinks: discovered.filter((entry) => entry.status !== "failed").length,
    manualPdfLinks: manualEntries.filter((entry) => entry.status !== "failed").length,
    downloaded,
    skippedDuplicates: skipped,
    failed: failed.length,
    manifestPath: MANIFEST_PATH.replace(/\\/g, "/"),
    failedUrls: failed.map((entry) => ({ url: entry.sourceUrl, notes: entry.notes })),
    events,
  };
  console.log(JSON.stringify(summary, null, 2));
}

main().catch((error) => {
  console.error(JSON.stringify({ status: "failed", error: error.message }, null, 2));
  process.exitCode = 1;
});
