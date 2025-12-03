// LLM types and interfaces

export type Provider = "openai" | "anthropic" | "google" | "ollama" | "custom";

export interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface ChatRequest {
  model: string;
  messages: Message[];
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

export interface ChatResponse {
  content: string;
  model: string;
  inputTokens?: number;
  outputTokens?: number;
  finishReason?: string;
}

export type StreamChunk =
  | {
      type: "content";
      content: string;
      done?: boolean;
      inputTokens?: number;
      outputTokens?: number;
    }
  | {
      type: "error";
      error: string;
    }
  | {
      type: "done";
      inputTokens?: number;
      outputTokens?: number;
    };

export interface ProviderConfig {
  apiKey: string;
  baseUrl?: string;
}

export interface LLMClient {
  chat(request: ChatRequest): Promise<ChatResponse>;
  streamChat(request: ChatRequest): AsyncGenerator<StreamChunk>;
}

export interface ModelInfo {
  id: string;
  name: string;
  provider: Provider;
  contextWindow: number;
  inputCostPer1kTokens?: number;
  outputCostPer1kTokens?: number;
}

// Default models per provider (updated December 2025)
export const DEFAULT_MODELS: Record<Provider, string> = {
  openai: "gpt-5.1",
  anthropic: "claude-sonnet-4-5-20250929",
  google: "gemini-3.0-pro-preview",
  ollama: "qwen3-coder:30b",
  custom: "gpt-5.1",
};

// Provider display names
export const PROVIDER_NAMES: Record<Provider, string> = {
  openai: "OpenAI",
  anthropic: "Anthropic",
  google: "Google",
  ollama: "Ollama",
  custom: "Custom",
};
