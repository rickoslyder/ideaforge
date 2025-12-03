export interface ModelPricing {
  model: string;
  inputCostPer1kTokens: number;
  outputCostPer1kTokens: number;
  contextWindow?: number;
  lastUpdated?: string;
}

export interface CostEstimate {
  model: string;
  inputTokens: number;
  outputTokens: number;
  inputCost: number;
  outputCost: number;
  totalCost: number;
}

export interface PricingData {
  models: Record<string, ModelPricing>;
  lastFetched: string;
  source: string;
}

export interface UsageMetrics {
  totalInputTokens: number;
  totalOutputTokens: number;
  totalCost: number;
  byModel: Record<
    string,
    {
      inputTokens: number;
      outputTokens: number;
      cost: number;
      requests: number;
    }
  >;
}
