import type { LLMClient, ChatRequest, ChatResponse, StreamChunk, ProviderConfig } from "../types";
import { parseSSEStream } from "../streaming";

export class AnthropicProvider implements LLMClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(config: ProviderConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || "https://api.anthropic.com";
  }

  async chat(request: ChatRequest): Promise<ChatResponse> {
    // Separate system message from conversation
    const systemMessage = request.messages.find((m) => m.role === "system");
    const conversationMessages = request.messages.filter((m) => m.role !== "system");

    const response = await fetch(`${this.baseUrl}/v1/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: request.model,
        system: systemMessage?.content,
        messages: conversationMessages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        max_tokens: request.maxTokens || 4096,
        temperature: request.temperature ?? 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Anthropic API error: ${error}`);
    }

    const data = await response.json();

    return {
      content: data.content[0].text,
      model: data.model,
      inputTokens: data.usage?.input_tokens,
      outputTokens: data.usage?.output_tokens,
      finishReason: data.stop_reason,
    };
  }

  async *streamChat(request: ChatRequest): AsyncGenerator<StreamChunk> {
    const systemMessage = request.messages.find((m) => m.role === "system");
    const conversationMessages = request.messages.filter((m) => m.role !== "system");

    const response = await fetch(`${this.baseUrl}/v1/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: request.model,
        system: systemMessage?.content,
        messages: conversationMessages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        max_tokens: request.maxTokens || 4096,
        temperature: request.temperature ?? 0.7,
        stream: true,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Anthropic API error: ${error}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error("No response body");

    let inputTokens: number | undefined;
    let outputTokens: number | undefined;

    for await (const data of parseSSEStream(reader)) {
      try {
        const parsed = JSON.parse(data);

        if (parsed.type === "message_start" && parsed.message?.usage) {
          inputTokens = parsed.message.usage.input_tokens;
        }

        if (parsed.type === "content_block_delta" && parsed.delta?.text) {
          yield {
            type: "content" as const,
            content: parsed.delta.text,
            done: false,
          };
        }

        if (parsed.type === "message_delta" && parsed.usage) {
          outputTokens = parsed.usage.output_tokens;
        }

        if (parsed.type === "message_stop") {
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
