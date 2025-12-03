import * as cheerio from "cheerio";

const JINA_READER_URL = "https://r.jina.ai/";

export interface UrlExtractionResult {
  success: boolean;
  content?: string;
  title?: string;
  source: "jina" | "direct" | "failed";
  error?: string;
}

export async function extractUrlContent(
  url: string
): Promise<UrlExtractionResult> {
  // Try Jina Reader first (better quality)
  try {
    const jinaResponse = await fetch(
      `${JINA_READER_URL}${encodeURIComponent(url)}`,
      {
        headers: {
          Accept: "text/plain",
        },
        signal: AbortSignal.timeout(30000), // 30s timeout
      }
    );

    if (jinaResponse.ok) {
      const content = await jinaResponse.text();
      return {
        success: true,
        content: content.trim(),
        source: "jina",
      };
    }
  } catch (error) {
    console.warn("Jina Reader failed, falling back to direct fetch:", error);
  }

  // Fallback to direct fetch + cheerio
  try {
    const directResponse = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; IdeaForge/1.0; +https://ideaforge.app)",
      },
      signal: AbortSignal.timeout(15000), // 15s timeout
    });

    if (!directResponse.ok) {
      return {
        success: false,
        source: "failed",
        error: `HTTP ${directResponse.status}`,
      };
    }

    const html = await directResponse.text();
    const result = extractTextFromHtml(html);

    return {
      success: true,
      content: result.content,
      title: result.title,
      source: "direct",
    };
  } catch (error) {
    return {
      success: false,
      source: "failed",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

function extractTextFromHtml(html: string): { content: string; title?: string } {
  const $ = cheerio.load(html);

  // Get title
  const title = $("title").text().trim() || $("h1").first().text().trim();

  // Remove unwanted elements
  $(
    "script, style, nav, footer, header, aside, .sidebar, .navigation, .menu, .ads, .advertisement, [role=navigation], [role=banner]"
  ).remove();

  // Try to find main content
  const mainContent =
    $("main, article, .content, #content, .post, .article, [role=main]").first();

  let text: string;
  if (mainContent.length) {
    text = mainContent.text();
  } else {
    text = $("body").text();
  }

  // Clean up whitespace
  const cleanedText = text
    .replace(/\s+/g, " ")
    .replace(/\n\s*\n/g, "\n\n")
    .trim();

  return {
    content: cleanedText,
    title: title || undefined,
  };
}
