"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useModels, type AvailableModel } from "@/hooks/use-models";
import { PROVIDER_NAMES, type Provider } from "@/lib/llm/types";

const PROVIDER_COLORS: Record<Provider, string> = {
  openai: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
  anthropic: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  google: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  ollama: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  custom: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
};

interface ModelListProps {
  selectedModel: string;
  onSelectModel: (model: string) => void;
  showPricing?: boolean;
}

export function ModelList({
  selectedModel,
  onSelectModel,
  showPricing = true,
}: ModelListProps) {
  const { modelsByProvider, providerNames } = useModels();

  return (
    <div className="space-y-4">
      {(Object.keys(modelsByProvider) as Provider[]).map((provider) => {
        const models = modelsByProvider[provider];
        if (models.length === 0) return null;

        return (
          <div key={provider} className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge className={PROVIDER_COLORS[provider]}>
                {providerNames[provider]}
              </Badge>
            </div>
            <div className="grid gap-2 pl-2">
              {models.map((model) => (
                <ModelItem
                  key={model.id}
                  model={model}
                  isSelected={selectedModel === model.model}
                  onClick={() => onSelectModel(model.model)}
                  showPricing={showPricing}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

interface ModelItemProps {
  model: AvailableModel;
  isSelected: boolean;
  onClick: () => void;
  showPricing?: boolean;
}

function ModelItem({ model, isSelected, onClick, showPricing }: ModelItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center justify-between w-full p-3 rounded-lg border transition-colors text-left",
        isSelected
          ? "border-primary bg-primary/10"
          : "border-border hover:border-primary/50"
      )}
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "w-5 h-5 rounded-full border-2 flex items-center justify-center",
            isSelected ? "border-primary bg-primary" : "border-muted-foreground"
          )}
        >
          {isSelected && <Check className="h-3 w-3 text-primary-foreground" />}
        </div>
        <div>
          <div className="font-medium">{model.displayName}</div>
          <div className="text-xs text-muted-foreground">{model.model}</div>
        </div>
      </div>

      {showPricing && model.inputCostPer1kTokens && (
        <div className="text-xs text-muted-foreground text-right">
          <div>${model.inputCostPer1kTokens.toFixed(4)}/1K in</div>
          <div>${model.outputCostPer1kTokens?.toFixed(4)}/1K out</div>
        </div>
      )}
    </button>
  );
}
