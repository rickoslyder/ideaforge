import { NextRequest, NextResponse } from "next/server";
import { extractPdfContent } from "@/lib/extraction/pdf";
import { extractDocxContent } from "@/lib/extraction/docx";
import { chunkContent } from "@/lib/extraction/chunker";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "File is required" },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File size exceeds 10MB limit" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = file.name.toLowerCase();

    let content: string | undefined;
    let pageCount: number | undefined;
    let messages: string[] | undefined;
    let error: string | undefined;

    if (fileName.endsWith(".pdf")) {
      const result = await extractPdfContent(buffer);
      if (result.success) {
        content = result.content;
        pageCount = result.pageCount;
      } else {
        error = result.error;
      }
    } else if (fileName.endsWith(".docx")) {
      const result = await extractDocxContent(buffer);
      if (result.success) {
        content = result.content;
        messages = result.messages;
      } else {
        error = result.error;
      }
    } else if (fileName.endsWith(".txt") || fileName.endsWith(".md")) {
      content = buffer.toString("utf-8");
    } else {
      return NextResponse.json(
        { error: "Unsupported file type. Supported: PDF, DOCX, TXT, MD" },
        { status: 400 }
      );
    }

    if (error || !content) {
      return NextResponse.json(
        { error: error || "Failed to extract content" },
        { status: 422 }
      );
    }

    // Chunk large content for better LLM processing
    const chunks = chunkContent(content);

    return NextResponse.json({
      success: true,
      content,
      fileName: file.name,
      fileType: fileName.split(".").pop(),
      pageCount,
      messages,
      chunks: chunks.length > 1 ? chunks : undefined,
      characterCount: content.length,
    });
  } catch (error) {
    console.error("File extraction error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
