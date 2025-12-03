import type { PricingData, ModelPricing } from "./types";
import { getCachedPricing, setCachedPricing } from "./cache";

// LiteLLM pricing data URL
const LITELLM_PRICING_URL =
  "https://raw.githubusercontent.com/BerriAI/litellm/main/model_prices_and_context_window.json";

// Fallback pricing for common models (in case fetch fails)
const FALLBACK_PRICING: Record<string, ModelPricing> = {
  "gpt-4o": {
    model: "gpt-4o",
    inputCostPer1kTokens: 0.005,
    outputCostPer1kTokens: 0.015,
    contextWindow: 128000,
  },
  "gpt-4o-mini": {
    model: "gpt-4o-mini",
    inputCostPer1kTokens: 0.00015,
    outputCostPer1kTokens: 0.0006,
    contextWindow: 128000,
  },
  "claude-sonnet-4-5-20250929": {
    model: "claude-sonnet-4-5-20250929",
    inputCostPer1kTokens: 0.003,
    outputCostPer1kTokens: 0.015,
    contextWindow: 200000,
  },
  "claude-opus-4-20250514": {
    model: "claude-opus-4-20250514",
    inputCostPer1kTokens: 0.015,
    outputCostPer1kTokens: 0.075,
    contextWindow: 200000,
  },
  "claude-3-5-haiku-20241022": {
    model: "claude-3-5-haiku-20241022",
    inputCostPer1kTokens: 0.001,
    outputCostPer1kTokens: 0.005,
    contextWindow: 200000,
  },
  "gemini-2.0-flash-exp": {
    model: "gemini-2.0-flash-exp",
    inputCostPer1kTokens: 0.000075,
    outputCostPer1kTokens: 0.0003,
    contextWindow: 1048576,
  },
  "gemini-1.5-pro": {
    model: "gemini-1.5-pro",
    inputCostPer1kTokens: 0.00125,
    outputCostPer1kTokens: 0.005,
    contextWindow: 2097152,
  },
};

export async function fetchPricingData(
  forceRefresh: boolean = false
): Promise<PricingData> {
  // Check cache first
  if (!forceRefresh) {
    const cached = getCachedPricing();
    if (cached) {
      return cached;
    }
  }

  try {
    const response = await fetch(LITELLM_PRICING_URL, {
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const rawData = await response.json();

    // Transform LiteLLM format to our format
    const models: Record<string, ModelPricing> = {};

    for (const [modelName, info] of Object.entries(rawData)) {
      const modelInfo = info as Record<string, unknown>;
      if (
        typeof modelInfo.input_cost_per_token === "number" &&
        typeof modelInfo.output_cost_per_token === "number"
      ) {
        models[modelName] = {
          model: modelName,
          inputCostPer1kTokens: (modelInfo.input_cost_per_token as number) * 1000,
          outputCostPer1kTokens: (modelInfo.output_cost_per_token as number) * 1000,
          contextWindow: modelInfo.max_tokens as number | undefined,
        };
      }
    }

    const pricingData: PricingData = {
      models,
      lastFetched: new Date().toISOString(),
      source: "litellm",
    };

    setCachedPricing(pricingData);
    return pricingData;
  } catch (error) {
    console.warn("Failed to fetch LiteLLM pricing, using fallback:", error);

    // Return fallback data
    return {
      models: FALLBACK_PRICING,
      lastFetched: new Date().toISOString(),
      source: "fallback",
    };
  }
}

export function getPricingForModel(
  pricingData: PricingData,
  modelName: string
): ModelPricing | null {
  // Direct match
  if (pricingData.models[modelName]) {
    return pricingData.models[modelName];
  }

  // Try to find partial match
  const normalizedName = modelName.toLowerCase();
  for (const [key, pricing] of Object.entries(pricingData.models)) {
    if (key.toLowerCase().includes(normalizedName) ||
        normalizedName.includes(key.toLowerCase())) {
      return pricing;
    }
  }

  // Check fallback
  if (FALLBACK_PRICING[modelName]) {
    return FALLBACK_PRICING[modelName];
  }

  return null;
}
