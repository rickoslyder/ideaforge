"use client";

import { useMemo } from "react";
import { DEFAULT_MODELS, PROVIDER_NAMES, type Provider } from "@/lib/llm/types";

export interface AvailableModel {
  id: string;
  model: string;
  provider: Provider;
  displayName: string;
  contextWindow: number;
  inputCostPer1kTokens?: number;
  outputCostPer1kTokens?: number;
}

// Popular models with their metadata
const AVAILABLE_MODELS: AvailableModel[] = [
  // OpenAI Models
  {
    id: "openai-gpt-5",
    model: "gpt-5",
    provider: "openai",
    displayName: "GPT-5",
    contextWindow: 256000,
    inputCostPer1kTokens: 0.01,
    outputCostPer1kTokens: 0.03,
  },
  {
    id: "openai-gpt-5-mini",
    model: "gpt-5-mini",
    provider: "openai",
    displayName: "GPT-5 Mini",
    contextWindow: 256000,
    inputCostPer1kTokens: 0.002,
    outputCostPer1kTokens: 0.006,
  },
  {
    id: "openai-gpt-4o",
    model: "gpt-4o",
    provider: "openai",
    displayName: "GPT-4o",
    contextWindow: 128000,
    inputCostPer1kTokens: 0.005,
    outputCostPer1kTokens: 0.015,
  },
  {
    id: "openai-gpt-4o-mini",
    model: "gpt-4o-mini",
    provider: "openai",
    displayName: "GPT-4o Mini",
    contextWindow: 128000,
    inputCostPer1kTokens: 0.00015,
    outputCostPer1kTokens: 0.0006,
  },
  {
    id: "openai-o3",
    model: "o3",
    provider: "openai",
    displayName: "O3",
    contextWindow: 200000,
    inputCostPer1kTokens: 0.02,
    outputCostPer1kTokens: 0.08,
  },
  {
    id: "openai-o3-mini",
    model: "o3-mini",
    provider: "openai",
    displayName: "O3 Mini",
    contextWindow: 200000,
    inputCostPer1kTokens: 0.0011,
    outputCostPer1kTokens: 0.0044,
  },
  {
    id: "openai-o1",
    model: "o1",
    provider: "openai",
    displayName: "O1",
    contextWindow: 200000,
    inputCostPer1kTokens: 0.015,
    outputCostPer1kTokens: 0.06,
  },
  {
    id: "openai-o1-mini",
    model: "o1-mini",
    provider: "openai",
    displayName: "O1 Mini",
    contextWindow: 128000,
    inputCostPer1kTokens: 0.003,
    outputCostPer1kTokens: 0.012,
  },

  // Anthropic Models
  {
    id: "anthropic-claude-opus-4-5",
    model: "claude-opus-4-5-20251101",
    provider: "anthropic",
    displayName: "Claude Opus 4.5",
    contextWindow: 200000,
    inputCostPer1kTokens: 0.015,
    outputCostPer1kTokens: 0.075,
  },
  {
    id: "anthropic-claude-sonnet-4-5",
    model: "claude-sonnet-4-5-20250929",
    provider: "anthropic",
    displayName: "Claude Sonnet 4.5",
    contextWindow: 200000,
    inputCostPer1kTokens: 0.003,
    outputCostPer1kTokens: 0.015,
  },
  {
    id: "anthropic-claude-sonnet-4",
    model: "claude-sonnet-4-20250514",
    provider: "anthropic",
    displayName: "Claude Sonnet 4",
    contextWindow: 200000,
    inputCostPer1kTokens: 0.003,
    outputCostPer1kTokens: 0.015,
  },
  {
    id: "anthropic-claude-haiku-3-5",
    model: "claude-3-5-haiku-20241022",
    provider: "anthropic",
    displayName: "Claude Haiku 3.5",
    contextWindow: 200000,
    inputCostPer1kTokens: 0.001,
    outputCostPer1kTokens: 0.005,
  },

  // Google Models
  {
    id: "google-gemini-2-5-pro",
    model: "gemini-2.5-pro-preview-06-05",
    provider: "google",
    displayName: "Gemini 2.5 Pro",
    contextWindow: 1048576,
    inputCostPer1kTokens: 0.00125,
    outputCostPer1kTokens: 0.01,
  },
  {
    id: "google-gemini-2-5-flash",
    model: "gemini-2.5-flash-preview-05-20",
    provider: "google",
    displayName: "Gemini 2.5 Flash",
    contextWindow: 1048576,
    inputCostPer1kTokens: 0.00015,
    outputCostPer1kTokens: 0.0006,
  },
  {
    id: "google-gemini-2-flash",
    model: "gemini-2.0-flash",
    provider: "google",
    displayName: "Gemini 2.0 Flash",
    contextWindow: 1048576,
    inputCostPer1kTokens: 0.0001,
    outputCostPer1kTokens: 0.0004,
  },
  {
    id: "google-gemini-2-flash-thinking",
    model: "gemini-2.0-flash-thinking-exp",
    provider: "google",
    displayName: "Gemini 2.0 Flash Thinking",
    contextWindow: 1048576,
    inputCostPer1kTokens: 0.0001,
    outputCostPer1kTokens: 0.0004,
  },

  // Ollama Models (local, no cost)
  {
    id: "ollama-llama3-3",
    model: "llama3.3:70b",
    provider: "ollama",
    displayName: "Llama 3.3 70B",
    contextWindow: 131072,
  },
  {
    id: "ollama-qwen3",
    model: "qwen3:32b",
    provider: "ollama",
    displayName: "Qwen3 32B",
    contextWindow: 131072,
  },
  {
    id: "ollama-deepseek-r1",
    model: "deepseek-r1:70b",
    provider: "ollama",
    displayName: "DeepSeek R1 70B",
    contextWindow: 65536,
  },
  {
    id: "ollama-deepseek-v3",
    model: "deepseek-v3:latest",
    provider: "ollama",
    displayName: "DeepSeek V3",
    contextWindow: 65536,
  },
];

export function useModels() {
  const models = useMemo(() => AVAILABLE_MODELS, []);

  const modelsByProvider = useMemo(() => {
    const grouped: Record<Provider, AvailableModel[]> = {
      openai: [],
      anthropic: [],
      google: [],
      ollama: [],
      custom: [],
    };

    for (const model of models) {
      grouped[model.provider].push(model);
    }

    return grouped;
  }, [models]);

  const getModelById = (id: string): AvailableModel | undefined => {
    return models.find((m) => m.id === id);
  };

  const getModelByModelString = (modelString: string): AvailableModel | undefined => {
    return models.find((m) => m.model === modelString);
  };

  return {
    models,
    modelsByProvider,
    getModelById,
    getModelByModelString,
    defaultModels: DEFAULT_MODELS,
    providerNames: PROVIDER_NAMES,
  };
}
