"use client";

import { useMemo, useEffect, useState } from "react";
import { DollarSign, TrendingDown, TrendingUp, RefreshCw, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  fetchPricingData,
  calculateComparisonCost,
  formatCost,
  formatTokens,
  estimateOutputTokens,
  type PricingData,
  type CostEstimate as CostEstimateType,
} from "@/lib/pricing";

interface CostEstimateProps {
  models: string[];
  prompt: string;
  taskType?: "chat" | "spec" | "plan";
  sectionCount?: number;
  actualUsage?: Record<
    string,
    { inputTokens: number; outputTokens: number }
  >;
  className?: string;
}

export function CostEstimate({
  models,
  prompt,
  taskType = "spec",
  sectionCount,
  actualUsage,
  className,
}: CostEstimateProps) {
  const [pricingData, setPricingData] = useState<PricingData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPricingData()
      .then(setPricingData)
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, []);

  const refreshPricing = async () => {
    setIsLoading(true);
    try {
      const data = await fetchPricingData(true);
      setPricingData(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to refresh");
    } finally {
      setIsLoading(false);
    }
  };

  const estimates = useMemo(() => {
    if (!pricingData || models.length === 0) return null;

    const estimatedOutput = estimateOutputTokens(taskType, sectionCount);
    return calculateComparisonCost(
      models,
      prompt,
      estimatedOutput,
      pricingData
    );
  }, [pricingData, models, prompt, taskType, sectionCount]);

  // Calculate actual costs if usage data is provided
  const actualCosts = useMemo(() => {
    if (!pricingData || !actualUsage) return null;

    let totalActual = 0;
    const byModel: Record<string, number> = {};

    for (const [model, usage] of Object.entries(actualUsage)) {
      const estimate = calculateComparisonCost(
        [model],
        "",
        0,
        pricingData
      );
      // Re-calculate with actual tokens
      const pricing = pricingData.models[model];
      if (pricing) {
        const cost =
          (usage.inputTokens / 1000) * pricing.inputCostPer1kTokens +
          (usage.outputTokens / 1000) * pricing.outputCostPer1kTokens;
        byModel[model] = cost;
        totalActual += cost;
      }
    }

    return { total: totalActual, byModel };
  }, [pricingData, actualUsage]);

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="py-6 text-center">
          <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
          <p className="text-sm text-muted-foreground mt-2">Loading pricing...</p>
        </CardContent>
      </Card>
    );
  }

  if (error || !estimates) {
    return (
      <Card className={className}>
        <CardContent className="py-6 text-center">
          <p className="text-sm text-muted-foreground">
            {error || "No models selected"}
          </p>
          <Button variant="outline" size="sm" onClick={refreshPricing} className="mt-2">
            <RefreshCw className="h-4 w-4 mr-1" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Cost Estimate
          </CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={refreshPricing}
                  className="h-8 w-8 p-0"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Refresh pricing data</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Total estimated cost */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
          <span className="text-sm font-medium">Estimated Total</span>
          <span className="text-lg font-bold">
            {formatCost(estimates.totalCost)}
          </span>
        </div>

        {/* Per-model breakdown */}
        <div className="space-y-2">
          {estimates.estimates.map((estimate) => (
            <div
              key={estimate.model}
              className="flex items-center justify-between text-sm"
            >
              <div className="flex items-center gap-2">
                <span className="truncate max-w-[150px]">{estimate.model}</span>
                {estimate.model === estimates.cheapest && (
                  <Badge variant="secondary" className="text-xs gap-0.5">
                    <TrendingDown className="h-3 w-3" />
                    Cheapest
                  </Badge>
                )}
                {estimate.model === estimates.mostExpensive &&
                  models.length > 1 && (
                    <Badge variant="outline" className="text-xs gap-0.5">
                      <TrendingUp className="h-3 w-3" />
                      Most
                    </Badge>
                  )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground text-xs">
                  ~{formatTokens(estimate.inputTokens)} in
                </span>
                <span className="font-medium">{formatCost(estimate.totalCost)}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Actual costs if available */}
        {actualCosts && (
          <div className="pt-2 border-t">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Actual Usage</span>
              <span className="text-lg font-bold text-green-600 dark:text-green-400">
                {formatCost(actualCosts.total)}
              </span>
            </div>
            <div className="space-y-1">
              {Object.entries(actualCosts.byModel).map(([model, cost]) => (
                <div
                  key={model}
                  className="flex items-center justify-between text-xs text-muted-foreground"
                >
                  <span>{model}</span>
                  <span>{formatCost(cost)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Source indicator */}
        <p className="text-xs text-muted-foreground text-right">
          Pricing: {pricingData?.source || "unknown"}
        </p>
      </CardContent>
    </Card>
  );
}
