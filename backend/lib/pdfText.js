// Extracción de texto local del PDF, con marcadores de página, para el
// respaldo con Ollama (que no puede leer el archivo directamente como Gemini).
// pdfjs-dist requiere @napi-rs/canvas instalado para el build "legacy" de
// Node (polyfills de DOMMatrix/Path2D), aunque no rendericemos nada.
async function extractPdfText(fileBuffer) {
  const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const doc = await pdfjsLib.getDocument({ data: new Uint8Array(fileBuffer) }).promise;

  const pageTexts = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    const text = content.items.map((item) => item.str).join(" ");
    pageTexts.push(`--- Página ${i} ---\n${text}`);
  }

  return pageTexts.join("\n\n");
}

module.exports = { extractPdfText };
