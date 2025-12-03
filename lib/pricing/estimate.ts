import type { CostEstimate, ModelPricing, PricingData } from "./types";
import { getPricingForModel } from "./fetch";

// Rough token estimation: ~4 chars per token for English text
const CHARS_PER_TOKEN = 4;

export function estimateTokenCount(text: string): number {
  return Math.ceil(text.length / CHARS_PER_TOKEN);
}

export function calculateCost(
  model: string,
  inputTokens: number,
  outputTokens: number,
  pricingData: PricingData
): CostEstimate {
  const pricing = getPricingForModel(pricingData, model);

  if (!pricing) {
    return {
      model,
      inputTokens,
      outputTokens,
      inputCost: 0,
      outputCost: 0,
      totalCost: 0,
    };
  }

  const inputCost = (inputTokens / 1000) * pricing.inputCostPer1kTokens;
  const outputCost = (outputTokens / 1000) * pricing.outputCostPer1kTokens;

  return {
    model,
    inputTokens,
    outputTokens,
    inputCost,
    outputCost,
    totalCost: inputCost + outputCost,
  };
}

export function estimateCostBeforeGeneration(
  model: string,
  prompt: string,
  estimatedOutputTokens: number,
  pricingData: PricingData
): CostEstimate {
  const inputTokens = estimateTokenCount(prompt);
  return calculateCost(model, inputTokens, estimatedOutputTokens, pricingData);
}

export function formatCost(cost: number): string {
  if (cost < 0.01) {
    return `$${(cost * 100).toFixed(4)}¢`;
  }
  return `$${cost.toFixed(4)}`;
}

export function formatTokens(tokens: number): string {
  if (tokens >= 1000000) {
    return `${(tokens / 1000000).toFixed(1)}M`;
  }
  if (tokens >= 1000) {
    return `${(tokens / 1000).toFixed(1)}K`;
  }
  return tokens.toString();
}

// Estimate output tokens based on task type
export function estimateOutputTokens(
  taskType: "chat" | "spec" | "plan",
  sectionCount?: number
): number {
  switch (taskType) {
    case "chat":
      return 500; // Typical chat response
    case "spec":
      // Estimate based on number of sections
      const sections = sectionCount || 10;
      return sections * 800; // ~800 tokens per section
    case "plan":
      return 2000; // Typical plan output
    default:
      return 500;
  }
}

// Calculate total cost for comparison across multiple models
export function calculateComparisonCost(
  models: string[],
  prompt: string,
  estimatedOutputTokens: number,
  pricingData: PricingData
): {
  estimates: CostEstimate[];
  totalCost: number;
  cheapest: string;
  mostExpensive: string;
} {
  const estimates = models.map((model) =>
    estimateCostBeforeGeneration(model, prompt, estimatedOutputTokens, pricingData)
  );

  const totalCost = estimates.reduce((sum, e) => sum + e.totalCost, 0);

  const sorted = [...estimates].sort((a, b) => a.totalCost - b.totalCost);
  const cheapest = sorted[0]?.model || models[0];
  const mostExpensive = sorted[sorted.length - 1]?.model || models[0];

  return {
    estimates,
    totalCost,
    cheapest,
    mostExpensive,
  };
}
