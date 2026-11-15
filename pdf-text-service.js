window.SEO_SERVICES = window.SEO_SERVICES || {};

window.SEO_SERVICES.pdfText = {
  workerSrc: "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js",

  async extractPdfPages(file, onProgress) {
    if (!window.pdfjsLib) throw new Error("PDF.js is not loaded");
    if (!file) throw new Error("No PDF file selected");

    window.pdfjsLib.GlobalWorkerOptions.workerSrc = this.workerSrc;
    if (onProgress) onProgress({ phase: "file-received", fileName: file.name, fileSizeBytes: file.size || 0 });
    if (onProgress) onProgress({ phase: "array-buffer-start" });
    const data = await file.arrayBuffer();
    if (onProgress) onProgress({ phase: "array-buffer-done", byteLength: data.byteLength || 0 });
    let pdf;
    try {
      if (onProgress) onProgress({ phase: "get-document-start", mode: "worker" });
      pdf = await this.withTimeout(
        window.pdfjsLib.getDocument({ data: data.slice(0) }).promise,
        "PDF.js worker load timed out",
        8000
      );
      if (onProgress) onProgress({ phase: "get-document-done", mode: "worker", totalPages: pdf.numPages });
    } catch (workerError) {
      if (onProgress) onProgress({ phase: "worker-fallback-start", message: workerError.message });
      try {
        pdf = await this.withTimeout(
          window.pdfjsLib.getDocument({ data: data.slice(0), disableWorker: true }).promise,
          "PDF.js fallback load timed out",
          15000
        );
        if (onProgress) onProgress({ phase: "get-document-done", mode: "fallback", totalPages: pdf.numPages });
      } catch (fallbackError) {
        throw new Error(`PDF.js load failed. Worker: ${workerError.message}. Fallback: ${fallbackError.message}`);
      }
    }
    const pages = [];

    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      try {
        if (onProgress) onProgress({ phase: "page-start", pageNumber, totalPages: pdf.numPages });
        const page = await pdf.getPage(pageNumber);
        const content = await this.withTimeout(
          page.getTextContent(),
          `PDF.js text extraction timed out on page ${pageNumber}`,
          15000
        );
        const items = content.items || [];
        const compactItems = items
          .map((item) => ({
            str: item.str || "",
            x: Number(item.transform?.[4] || 0),
            y: Number(item.transform?.[5] || 0),
            width: Number(item.width || 0),
            height: Number(item.height || 0),
          }))
          .filter((item) => item.str.trim());
        pages.push({
          pageNumber,
          text: items.map((item) => item.str || "").join(" ").trim(),
          layoutItems: compactItems,
          textReconstruction: this.reconstructPageText(compactItems),
          itemsCount: items.length,
          extractionStatus: "ok",
        });
      } catch (error) {
        pages.push({
          pageNumber,
          text: "",
          itemsCount: 0,
          extractionStatus: "error: " + error.message,
        });
      }
      if (onProgress) onProgress({ phase: "page-done", pageNumber, totalPages: pdf.numPages });
    }

    return pages;
  },

  reconstructPageText(items) {
    const rowText = (row) => row.map((item) => item.str).join(" ").replace(/\s+/g, " ").trim();
    const join = (rows) => rows.map(rowText).join(" ").replace(/\s+/g, " ").trim();
    const bucket = (sortedItems, axis, tolerance = 3) => {
      const rows = [];
      sortedItems.forEach((item) => {
        const value = axis === "x" ? item.x : item.y;
        const row = rows.find((candidate) => Math.abs(candidate.value - value) <= tolerance);
        if (row) row.items.push(item);
        else rows.push({ value, items: [item] });
      });
      return rows;
    };
    const normalRows = bucket([...items].sort((a, b) => b.y - a.y || a.x - b.x), "y")
      .sort((a, b) => b.value - a.value)
      .map((row) => row.items.sort((a, b) => a.x - b.x));
    const rotatedLandscape = bucket([...items].sort((a, b) => a.x - b.x || b.y - a.y), "x")
      .sort((a, b) => a.value - b.value)
      .map((row) => row.items.sort((a, b) => b.y - a.y));
    const rotatedLandscapeReverse = bucket([...items].sort((a, b) => a.x - b.x || a.y - b.y), "x")
      .sort((a, b) => a.value - b.value)
      .map((row) => row.items.sort((a, b) => a.y - b.y));
    const rotatedLandscapeYRows = bucket([...items].sort((a, b) => b.y - a.y || a.x - b.x), "y", 1.25)
      .sort((a, b) => b.value - a.value)
      .map((row) => row.items.sort((a, b) => a.x - b.x));
    const rotatedLandscapeTightYRows = bucket([...items].sort((a, b) => b.y - a.y || a.x - b.x), "y", 0.65)
      .sort((a, b) => b.value - a.value)
      .map((row) => row.items.sort((a, b) => a.x - b.x));
    return {
      normal: join(normalRows),
      rotatedLandscape: join(rotatedLandscape),
      rotatedLandscapeReverse: join(rotatedLandscapeReverse),
      rotatedLandscapeYRows: join(rotatedLandscapeYRows),
      rotatedLandscapeTightYRows: join(rotatedLandscapeTightYRows),
      layoutRows: {
        normal: normalRows.map(rowText).filter(Boolean),
        rotatedLandscape: rotatedLandscape.map(rowText).filter(Boolean),
        rotatedLandscapeReverse: rotatedLandscapeReverse.map(rowText).filter(Boolean),
        rotatedLandscapeYRows: rotatedLandscapeYRows.map(rowText).filter(Boolean),
        rotatedLandscapeTightYRows: rotatedLandscapeTightYRows.map(rowText).filter(Boolean),
      },
    };
  },

  buildTextVariants(items) {
    const reconstructed = this.reconstructPageText(items);
    return {
      visualRows: reconstructed.normal,
      rotatedColumns: reconstructed.rotatedLandscape,
      rotatedColumnsReverse: reconstructed.rotatedLandscapeReverse,
      rotatedLandscapeYRows: reconstructed.rotatedLandscapeYRows,
      rotatedLandscapeTightYRows: reconstructed.rotatedLandscapeTightYRows,
    };
  },

  withTimeout(promise, message, timeoutMs) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error(message)), timeoutMs);
      promise.then(
        (value) => {
          clearTimeout(timer);
          resolve(value);
        },
        (error) => {
          clearTimeout(timer);
          reject(error);
        }
      );
    });
  },
};
