import type { LLMClient, ChatRequest, ChatResponse, StreamChunk, ProviderConfig } from "../types";
import { parseSSEStream } from "../streaming";

export class OpenAIProvider implements LLMClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(config: ProviderConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || "https://api.openai.com/v1";
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
      throw new Error(`OpenAI API error: ${error}`);
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
        stream_options: { include_usage: true },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${error}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error("No response body");

    let inputTokens: number | undefined;
    let outputTokens: number | undefined;

    for await (const data of parseSSEStream(reader)) {
      try {
        const parsed = JSON.parse(data);

        // Handle usage info at the end of stream
        if (parsed.usage) {
          inputTokens = parsed.usage.prompt_tokens;
          outputTokens = parsed.usage.completion_tokens;
        }

        const delta = parsed.choices?.[0]?.delta;
        if (delta?.content) {
          yield {
            type: "content" as const,
            content: delta.content,
            done: false,
          };
        }

        if (parsed.choices?.[0]?.finish_reason) {
          yield {
            type: "done" as const,
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
