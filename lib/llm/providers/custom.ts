import type { LLMClient, ChatRequest, ChatResponse, StreamChunk, ProviderConfig } from "../types";
import { parseSSEStream } from "../streaming";

// Custom provider for LiteLLM-compatible endpoints (OpenAI API format)
export class CustomProvider implements LLMClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(config: ProviderConfig) {
    this.apiKey = config.apiKey;
    if (!config.baseUrl) {
      throw new Error("Custom provider requires a baseUrl");
    }
    this.baseUrl = config.baseUrl;
  }

  async chat(request: ChatRequest): Promise<ChatResponse> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: request.model,
        messages: request.messages,
        temperature: request.temperature ?? 0.7,
        max_tokens: request.maxTokens,
        stream: false,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Custom API error: ${error}`);
    }

    const data = await response.json();
    const choice = data.choices[0];

    return {
      content: choice.message.content,
      model: data.model,
      inputTokens: data.usage?.prompt_tokens,
      outputTokens: data.usage?.completion_tokens,
      finishReason: choice.finish_reason,
    };
  }

  async *streamChat(request: ChatRequest): AsyncGenerator<StreamChunk> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: request.model,
        messages: request.messages,
        temperature: request.temperature ?? 0.7,
        max_tokens: request.maxTokens,
        stream: true,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Custom API error: ${error}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error("No response body");

    let inputTokens: number | undefined;
    let outputTokens: number | undefined;

    for await (const data of parseSSEStream(reader)) {
      try {
        const parsed = JSON.parse(data);

        if (parsed.usage) {
          inputTokens = parsed.usage.prompt_tokens;
          outputTokens = parsed.usage.completion_tokens;
        }

        const delta = parsed.choices?.[0]?.delta;
        if (delta?.content) {
          yield {
            content: delta.content,
            done: false,
          };
        }

        if (parsed.choices?.[0]?.finish_reason) {
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
