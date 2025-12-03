import {
  COHERENCE_JUDGE_SYSTEM_PROMPT,
  buildHighlightIssuesPrompt,
  buildAutoSmoothPrompt,
} from "@/prompts/coherence-judge";

export interface CoherenceIssue {
  severity: "high" | "medium" | "low";
  type: "contradiction" | "flow" | "terminology" | "style" | "completeness";
  location: string;
  description: string;
  suggestion: string;
}

export interface CoherenceAnalysis {
  overall_coherence_score: number;
  issues: CoherenceIssue[];
  summary: string;
}

export interface CoherenceCheckResult {
  success: boolean;
  analysis?: CoherenceAnalysis;
  smoothedContent?: string;
  error?: string;
}

export async function analyzeCoherence(
  content: string,
  apiEndpoint: string = "/api/chat"
): Promise<CoherenceCheckResult> {
  try {
    const response = await fetch(apiEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [
          { role: "system", content: COHERENCE_JUDGE_SYSTEM_PROMPT },
          { role: "user", content: buildHighlightIssuesPrompt(content) },
        ],
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    const analysisText = data.content || data.message;

    // Parse JSON from response
    const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No valid JSON found in response");
    }

    const analysis = JSON.parse(jsonMatch[0]) as CoherenceAnalysis;

    return {
      success: true,
      analysis,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function smoothContent(
  content: string,
  apiEndpoint: string = "/api/chat"
): Promise<CoherenceCheckResult> {
  try {
    const response = await fetch(apiEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [
          { role: "system", content: COHERENCE_JUDGE_SYSTEM_PROMPT },
          { role: "user", content: buildAutoSmoothPrompt(content) },
        ],
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    const smoothedContent = data.content || data.message;

    return {
      success: true,
      smoothedContent,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Streaming version for auto-smooth
export async function* smoothContentStream(
  content: string,
  apiEndpoint: string = "/api/chat"
): AsyncGenerator<string> {
  const response = await fetch(apiEndpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: [
        { role: "system", content: COHERENCE_JUDGE_SYSTEM_PROMPT },
        { role: "user", content: buildAutoSmoothPrompt(content) },
      ],
      stream: true,
    }),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error("No response body");
  }

  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      if (line.startsWith("data: ")) {
        const data = line.slice(6);
        if (data === "[DONE]") continue;

        try {
          const parsed = JSON.parse(data);
          if (parsed.content) {
            yield parsed.content;
          }
        } catch {
          // Skip invalid JSON
        }
      }
    }
  }
}
