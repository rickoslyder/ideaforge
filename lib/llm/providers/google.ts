import type { LLMClient, ChatRequest, ChatResponse, StreamChunk, ProviderConfig } from "../types";

export class GoogleProvider implements LLMClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(config: ProviderConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || "https://generativelanguage.googleapis.com/v1beta";
  }

  async chat(request: ChatRequest): Promise<ChatResponse> {
    // Convert messages to Gemini format
    const systemInstruction = request.messages.find((m) => m.role === "system");
    const contents = request.messages
      .filter((m) => m.role !== "system")
      .map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }));

    const response = await fetch(
      `${this.baseUrl}/models/${request.model}:generateContent?key=${this.apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents,
          systemInstruction: systemInstruction
            ? { parts: [{ text: systemInstruction.content }] }
            : undefined,
          generationConfig: {
            temperature: request.temperature ?? 0.7,
            maxOutputTokens: request.maxTokens,
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Google API error: ${error}`);
    }

    const data = await response.json();
    const candidate = data.candidates?.[0];

    return {
      content: candidate?.content?.parts?.[0]?.text || "",
      model: request.model,
      inputTokens: data.usageMetadata?.promptTokenCount,
      outputTokens: data.usageMetadata?.candidatesTokenCount,
      finishReason: candidate?.finishReason,
    };
  }

  async *streamChat(request: ChatRequest): AsyncGenerator<StreamChunk> {
    const systemInstruction = request.messages.find((m) => m.role === "system");
    const contents = request.messages
      .filter((m) => m.role !== "system")
      .map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }));

    const response = await fetch(
      `${this.baseUrl}/models/${request.model}:streamGenerateContent?alt=sse&key=${this.apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents,
          systemInstruction: systemInstruction
            ? { parts: [{ text: systemInstruction.content }] }
            : undefined,
          generationConfig: {
            temperature: request.temperature ?? 0.7,
            maxOutputTokens: request.maxTokens,
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Google API error: ${error}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error("No response body");

    const decoder = new TextDecoder();
    let buffer = "";
    let inputTokens: number | undefined;
    let outputTokens: number | undefined;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith("data: ")) {
          const data = trimmed.slice(6);
          try {
            const parsed = JSON.parse(data);

            if (parsed.usageMetadata) {
              inputTokens = parsed.usageMetadata.promptTokenCount;
              outputTokens = parsed.usageMetadata.candidatesTokenCount;
            }

            const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) {
              yield {
                content: text,
                done: false,
              };
            }

            if (parsed.candidates?.[0]?.finishReason) {
              yield {
                content: "",
                done: true,
                inputTokens,
                outputTokens,
              };
            }
          } catch {
            // Skip invalid JSON
          }
        }
      }
    }
  }
}
