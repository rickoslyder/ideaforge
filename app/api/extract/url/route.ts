import { NextRequest, NextResponse } from "next/server";
import { extractUrlContent } from "@/lib/extraction/url";
import { chunkContent } from "@/lib/extraction/chunker";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { error: "URL is required" },
        { status: 400 }
      );
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { error: "Invalid URL format" },
        { status: 400 }
      );
    }

    const result = await extractUrlContent(url);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to extract content" },
        { status: 422 }
      );
    }

    // Chunk large content for better LLM processing
    const chunks = result.content
      ? chunkContent(result.content)
      : [];

    return NextResponse.json({
      success: true,
      content: result.content,
      title: result.title,
      source: result.source,
      chunks: chunks.length > 1 ? chunks : undefined,
      characterCount: result.content?.length || 0,
    });
  } catch (error) {
    console.error("URL extraction error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
