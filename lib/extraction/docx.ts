import mammoth from "mammoth";

export interface DocxExtractionResult {
  success: boolean;
  content?: string;
  messages?: string[];
  error?: string;
}

export async function extractDocxContent(
  buffer: Buffer
): Promise<DocxExtractionResult> {
  try {
    const result = await mammoth.extractRawText({ buffer });

    return {
      success: true,
      content: result.value.trim(),
      messages: result.messages.map((m) => m.message),
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to parse DOCX",
    };
  }
}
