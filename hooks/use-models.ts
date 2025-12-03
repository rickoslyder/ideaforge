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
    id: "anthropic-claude-sonnet-4-5",
    model: "claude-sonnet-4-5-20250929",
    provider: "anthropic",
    displayName: "Claude Sonnet 4.5",
    contextWindow: 200000,
    inputCostPer1kTokens: 0.003,
    outputCostPer1kTokens: 0.015,
  },
  {
    id: "anthropic-claude-opus-4",
    model: "claude-opus-4-20250514",
    provider: "anthropic",
    displayName: "Claude Opus 4",
    contextWindow: 200000,
    inputCostPer1kTokens: 0.015,
    outputCostPer1kTokens: 0.075,
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
    id: "google-gemini-2-flash",
    model: "gemini-2.0-flash-exp",
    provider: "google",
    displayName: "Gemini 2.0 Flash",
    contextWindow: 1048576,
    inputCostPer1kTokens: 0.000075,
    outputCostPer1kTokens: 0.0003,
  },
  {
    id: "google-gemini-1-5-pro",
    model: "gemini-1.5-pro",
    provider: "google",
    displayName: "Gemini 1.5 Pro",
    contextWindow: 2097152,
    inputCostPer1kTokens: 0.00125,
    outputCostPer1kTokens: 0.005,
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
    model: "qwen3-coder:30b",
    provider: "ollama",
    displayName: "Qwen3 Coder 30B",
    contextWindow: 32768,
  },
  {
    id: "ollama-deepseek-r1",
    model: "deepseek-r1:32b",
    provider: "ollama",
    displayName: "DeepSeek R1 32B",
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
