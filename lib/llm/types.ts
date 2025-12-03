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

export interface StreamChunk {
  content: string;
  done: boolean;
  inputTokens?: number;
  outputTokens?: number;
}

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

// Default models per provider
export const DEFAULT_MODELS: Record<Provider, string> = {
  openai: "gpt-4o",
  anthropic: "claude-sonnet-4-20250514",
  google: "gemini-2.5-flash-preview-05-20",
  ollama: "llama3.2",
  custom: "gpt-4o",
};

// Provider display names
export const PROVIDER_NAMES: Record<Provider, string> = {
  openai: "OpenAI",
  anthropic: "Anthropic",
  google: "Google",
  ollama: "Ollama",
  custom: "Custom",
};
