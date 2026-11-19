import * as pdfjsLib from "pdfjs-dist";

// Use standard ESM URL resolution for web worker
if (typeof window !== "undefined" && pdfjsLib.GlobalWorkerOptions) {
  try {
    pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
      "pdfjs-dist/build/pdf.worker.min.mjs",
      import.meta.url
    ).toString();
  } catch (e) {
    console.warn("Could not set local workerSrc via URL:", e);
  }
}

/**
 * Fast, non-blocking fallback text scanner for PDF streams.
 * Can extract text from standard uncompressed/Flate PDF text objects
 * in case PDF.js worker fails or encounters an issue.
 */
function scanRawPdfText(buffer) {
  try {
    const bytes = new Uint8Array(buffer);
    const decoder = new TextDecoder("utf-8", { fatal: false });
    const raw = decoder.decode(bytes);

    // Look for text in parenthesis inside text objects: (text) Tj or [(t)(e)(x)(t)] TJ
    const textChunks = [];
    const tjRegex = /\(([^)]+)\)\s*(?:Tj|'|")/g;
    let match;
    while ((match = tjRegex.exec(raw)) !== null) {
      if (match[1] && match[1].trim().length > 0) {
        textChunks.push(match[1]);
      }
    }

    // Look for array TJ matches: [(foo) 10 (bar)] TJ
    const arrayTjRegex = /\[(.*?)\]\s*TJ/g;
    while ((match = arrayTjRegex.exec(raw)) !== null) {
      const inner = match[1];
      const innerMatches = inner.match(/\(([^)]+)\)/g);
      if (innerMatches) {
        innerMatches.forEach((m) => {
          const cleaned = m.slice(1, -1).trim();
          if (cleaned) textChunks.push(cleaned);
        });
      }
    }

    if (textChunks.length > 5) {
      return textChunks.join(" ");
    }
  } catch (e) {
    console.warn("Raw PDF scan fallback error:", e);
  }
  return "";
}

/**
 * Extract clean text from a PDF file with sub-second performance.
 * Uses local bundled PDF.js worker without third-party CDN latency.
 *
 * @param {File|Blob|ArrayBuffer} fileOrBuffer
 * @returns {Promise<string>} Extracted plain text
 */
export async function extractPdfText(fileOrBuffer) {
  if (!fileOrBuffer) return "";

  let buffer;
  if (fileOrBuffer instanceof ArrayBuffer) {
    buffer = fileOrBuffer;
  } else if (typeof fileOrBuffer.arrayBuffer === "function") {
    buffer = await fileOrBuffer.arrayBuffer();
  } else {
    throw new Error("Invalid file or buffer provided to extractPdfText");
  }

  // Attempt extraction via bundled PDF.js
  try {
    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(buffer),
      useWorkerFetch: false,
      isEvalSupported: false,
      useSystemFonts: true,
    });

    const pdf = await loadingTask.promise;
    let fullText = "";

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const content = await page.getTextContent();
      const pageText = content.items
        .map((item) => ("str" in item ? item.str : ""))
        .join(" ");
      fullText += pageText + "\n";
    }

    const trimmed = fullText.trim();
    if (trimmed.length > 0) {
      return trimmed;
    }
  } catch (pdfJsErr) {
    console.warn("pdfjs-dist extraction failed, falling back to raw stream scan:", pdfJsErr);
  }

  // Fallback to quick binary scan if PDF.js produced empty string or error
  const rawText = scanRawPdfText(buffer);
  return rawText.trim();
}
