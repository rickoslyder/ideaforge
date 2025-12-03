import type { LLMClient, Provider, ProviderConfig } from "./types";
import { OpenAIProvider } from "./providers/openai";
import { AnthropicProvider } from "./providers/anthropic";
import { GoogleProvider } from "./providers/google";
import { OllamaProvider } from "./providers/ollama";
import { CustomProvider } from "./providers/custom";

export function createLLMClient(
  provider: Provider,
  config: ProviderConfig
): LLMClient {
  switch (provider) {
    case "openai":
      return new OpenAIProvider(config);
    case "anthropic":
      return new AnthropicProvider(config);
    case "google":
      return new GoogleProvider(config);
    case "ollama":
      return new OllamaProvider(config);
    case "custom":
      return new CustomProvider(config);
    default:
      throw new Error(`Unknown provider: ${provider}`);
  }
}

// Helper to determine provider from model string
export function getProviderFromModel(model: string): Provider {
  if (model.startsWith("gpt-") || model.startsWith("o1-") || model.startsWith("o3-")) {
    return "openai";
  }
  if (model.startsWith("claude-")) {
    return "anthropic";
  }
  if (model.startsWith("gemini-")) {
    return "google";
  }
  if (model.includes("/")) {
    // LiteLLM format: provider/model
    const [provider] = model.split("/");
    if (["openai", "anthropic", "google", "ollama"].includes(provider)) {
      return provider as Provider;
    }
  }
  // Default to custom for unknown models
  return "custom";
}

// Re-export types
export type { LLMClient, Provider, ProviderConfig, ChatRequest, ChatResponse, StreamChunk } from "./types";
