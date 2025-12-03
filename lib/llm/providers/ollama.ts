import type { LLMClient, ChatRequest, ChatResponse, StreamChunk, ProviderConfig } from "../types";

export class OllamaProvider implements LLMClient {
  private baseUrl: string;

  constructor(config: ProviderConfig) {
    this.baseUrl = config.baseUrl || "http://localhost:11434";
  }

  async chat(request: ChatRequest): Promise<ChatResponse> {
    const response = await fetch(`${this.baseUrl}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: request.model,
        messages: request.messages,
        stream: false,
        options: {
          temperature: request.temperature ?? 0.7,
          num_predict: request.maxTokens,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Ollama API error: ${error}`);
    }

    const data = await response.json();

    return {
      content: data.message?.content || "",
      model: data.model,
      inputTokens: data.prompt_eval_count,
      outputTokens: data.eval_count,
      finishReason: data.done_reason,
    };
  }

  async *streamChat(request: ChatRequest): AsyncGenerator<StreamChunk> {
    const response = await fetch(`${this.baseUrl}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: request.model,
        messages: request.messages,
        stream: true,
        options: {
          temperature: request.temperature ?? 0.7,
          num_predict: request.maxTokens,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Ollama API error: ${error}`);
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
        if (!line.trim()) continue;

        try {
          const parsed = JSON.parse(line);

          if (parsed.message?.content) {
            yield {
              content: parsed.message.content,
              done: false,
            };
          }

          if (parsed.done) {
            inputTokens = parsed.prompt_eval_count;
            outputTokens = parsed.eval_count;

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
