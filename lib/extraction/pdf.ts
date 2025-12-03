export interface PdfExtractionResult {
  success: boolean;
  content?: string;
  pageCount?: number;
  error?: string;
}

interface PdfData {
  text: string;
  numpages: number;
}

type PdfParseFn = (buffer: Buffer) => Promise<PdfData>;

export async function extractPdfContent(
  buffer: Buffer
): Promise<PdfExtractionResult> {
  try {
    // Dynamic import - pdf-parse has mixed ESM/CJS exports
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pdfParseModule = (await import("pdf-parse")) as any;
    const pdfParse: PdfParseFn = pdfParseModule.default || pdfParseModule;
    const data = await pdfParse(buffer);

    return {
      success: true,
      content: data.text.trim(),
      pageCount: data.numpages,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to parse PDF",
    };
  }
}
